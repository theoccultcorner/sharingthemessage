import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, Avatar, IconButton, Divider, Tooltip
} from "@mui/material";
import { ThumbUp, Send, Edit, Delete } from "@mui/icons-material";
import {
  ref, onValue, push, update, remove, runTransaction
} from "firebase/database";
import { db, rtdb } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const ChatRoom = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostText, setEditingPostText] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const userCache = useRef({});

  // Fetch Firestore profile; prefer photoURL, fallback to avatarUrl, then Auth profile.
  const fetchUserInfo = async (userId) => {
    if (!userId) return { userId: "", screenName: "Anonymous", photoURL: "" };
    if (userCache.current[userId]) return userCache.current[userId];

    let screenName = "";
    let photoURL = "";

    try {
      const docRef = doc(db, "users", userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() || {};
        screenName = data.screenName || data.displayName || "";
        photoURL = data.photoURL || data.avatarUrl || "";
      }
    } catch {
      // ignore
    }

    // Fallbacks to current Auth user
    if (userId === user?.uid) {
      if (!screenName) screenName = user?.displayName || "You";
      if (!photoURL) photoURL = user?.photoURL || "";
    }

    const info = {
      userId,
      screenName: screenName || "Anonymous",
      photoURL,
    };
    userCache.current[userId] = info;
    return info;
  };

  useEffect(() => {
    const postsRef = ref(rtdb, "posts");
    const unsubscribe = onValue(postsRef, async (snapshot) => {
      const data = snapshot.val() || {};
      const postList = await Promise.all(
        Object.entries(data).map(async ([id, post]) => {
          const author = await fetchUserInfo(post.userId);

          // Build comments array with commenter info (sorted oldest->newest)
          const commentsArr = await Promise.all(
            Object.entries(post.comments || {})
              .sort(([, a], [, b]) => (a.createdAt || 0) - (b.createdAt || 0))
              .map(async ([cid, comment]) => {
                const commenter = await fetchUserInfo(comment.userId);
                return { id: cid, ...comment, ...commenter };
              })
          );

          // Build likedBy users list (support both new object + legacy boolean)
          const likedBy = post.likedBy || {};
          const likedByUsers = await Promise.all(
            Object.keys(likedBy).map(async (uid) => {
              const entry = likedBy[uid];
              if (entry && typeof entry === "object") {
                return {
                  userId: uid,
                  screenName:
                    entry.screenName ||
                    (uid === user?.uid ? "You" : "Anonymous"),
                  photoURL: entry.photoURL || entry.avatarUrl || "",
                };
              }
              // legacy boolean: lookup from Firestore/Auth
              return fetchUserInfo(uid);
            })
          );

          return {
            id,
            ...post,
            ...author, // adds screenName/photoURL for post author
            comments: commentsArr,
            likedByUsers,
          };
        })
      );

      postList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPosts(postList);
    });

    return () => {
      try {
        unsubscribe();
      } catch {
        /* noop */
      }
    };
  }, [user?.uid]); // rehydrate names like "You" after auth loads

  const handlePost = async () => {
    if (!user?.uid) return;
    if (!newPost.trim()) return;
    await push(ref(rtdb, "posts"), {
      text: newPost.trim(),
      userId: user.uid,
      createdAt: Date.now(),
      likesCount: 0,
      likedBy: {},
      comments: {}
    });
    setNewPost("");
  };

  const handleEditPost = async (postId) => {
    if (!editingPostText.trim()) return;
    await update(ref(rtdb, `posts/${postId}`), { text: editingPostText.trim() });
    setEditingPostId(null);
    setEditingPostText("");
  };

  const handleDeletePost = async (postId) => {
    if (!user?.uid) return;
    await remove(ref(rtdb, `posts/${postId}`));
  };

  const handleComment = async (postId) => {
    if (!user?.uid) return;
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;
    await push(ref(rtdb, `posts/${postId}/comments`), {
      text: comment.trim(),
      userId: user.uid,
      createdAt: Date.now()
    });
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleEditComment = async (postId, commentId) => {
    const text = editingComment[commentId];
    if (!text?.trim()) return;
    await update(ref(rtdb, `posts/${postId}/comments/${commentId}`), { text: text.trim() });
    setEditingComment((prev) => ({ ...prev, [commentId]: "" }));
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!user?.uid) return;
    await remove(ref(rtdb, `posts/${postId}/comments/${commentId}`));
  };

  // Toggle like/unlike with denormalized liker profile including photoURL
  const handleLike = async (postId) => {
    if (!user?.uid) return;
    const postRef = ref(rtdb, `posts/${postId}`);
    await runTransaction(postRef, (current) => {
      if (!current) return current;
      const now = Date.now();
      current.likedBy = current.likedBy || {};

      // Ensure likesCount exists; migrate legacy fields
      if (typeof current.likesCount !== "number") {
        const derived = current.likedBy ? Object.keys(current.likedBy).length : 0;
        current.likesCount =
          typeof current.likes === "number" ? current.likes : derived;
      }

      const already = !!current.likedBy[user.uid];

      if (already) {
        delete current.likedBy[user.uid];
        current.likesCount = Math.max(0, (current.likesCount || 0) - 1);
      } else {
        current.likedBy[user.uid] = {
          userId: user.uid,
          screenName: user?.displayName || "Anonymous",
          photoURL: user?.photoURL || "",
          likedAt: now,
        };
        current.likesCount = (current.likesCount || 0) + 1;
      }

      if (typeof current.likes !== "undefined") delete current.likes;
      return current;
    });
  };

  const safeTime = (ts) => (ts ? new Date(ts).toLocaleString() : "");

  const formatLikedByText = (users, myId) => {
    if (!users?.length) return "";
    const names = users.map(u => (u.userId === myId ? "You" : (u.screenName || "Anonymous")));
    if (names.length <= 3) return `Liked by ${names.join(", ")}`;
    return `Liked by ${names.slice(0, 2).join(", ")} and ${names.length - 2} others`;
  };

  const authed = !!user?.uid;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" textAlign="center" mb={2}>
        Message Board
      </Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          label="What's on your mind?"
          multiline
          rows={3}
          fullWidth
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          disabled={!authed}
        />
        <Button onClick={handlePost} variant="contained" sx={{ mt: 2 }} disabled={!authed}>
          Post
        </Button>
      </Paper>

      {posts.map((post) => {
        const hasLiked = !!(post.likedBy && user?.uid && post.likedBy[user.uid]);
        const likeCount =
          typeof post.likesCount === "number"
            ? post.likesCount
            : (post.likedByUsers?.length || post.likes || 0);

        return (
          <Paper key={post.id} sx={{ p: 2, mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={post.photoURL || post.avatarUrl || ""} />
              <Box>
                <Typography fontWeight="bold">{post.screenName}</Typography>
                <Typography variant="caption">{safeTime(post.createdAt)}</Typography>
              </Box>
            </Stack>

            {editingPostId === post.id ? (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editingPostText}
                  onChange={(e) => setEditingPostText(e.target.value)}
                />
                <Stack direction="row" spacing={1} mt={1}>
                  <Button variant="contained" onClick={() => handleEditPost(post.id)}>Save</Button>
                  <Button onClick={() => setEditingPostId(null)}>Cancel</Button>
                </Stack>
              </Box>
            ) : (
              <Typography sx={{ mt: 2, whiteSpace: "pre-wrap" }}>{post.text}</Typography>
            )}

            {authed && user.uid === post.userId && editingPostId !== post.id && (
              <Stack direction="row" spacing={1} mt={1}>
                <IconButton onClick={() => { setEditingPostId(post.id); setEditingPostText(post.text || ""); }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDeletePost(post.id)}>
                  <Delete />
                </IconButton>
              </Stack>
            )}

            <Stack direction="row" spacing={1} alignItems="center" mt={1}>
              <Tooltip title={hasLiked ? "Unlike" : "Like"}>
                <span>
                  <IconButton onClick={() => handleLike(post.id)} disabled={!authed}>
                    <ThumbUp color={hasLiked ? "primary" : undefined} />
                  </IconButton>
                </span>
              </Tooltip>
              <Typography>{likeCount}</Typography>

              {!!(post.likedByUsers && post.likedByUsers.length) && (
                <>
                  <Stack direction="row" spacing={0.5} ml={1}>
                    {post.likedByUsers.map((u) => (
                      <Tooltip key={u.userId} title={u.screenName || "User"}>
                        <Avatar
                          src={u.photoURL || u.avatarUrl || ""}
                          alt={u.screenName || "User"}
                          sx={{ width: 20, height: 20 }}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                  <Typography variant="body2" ml={1}>
                    {formatLikedByText(post.likedByUsers, user?.uid)}
                  </Typography>
                </>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" mb={1}>Comments:</Typography>
            {(post.comments || []).map((comment) => (
              <Box key={comment.id} sx={{ mb: 1 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar src={comment.photoURL || comment.avatarUrl || ""} sx={{ width: 24, height: 24 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontSize="0.875rem" fontWeight="bold">{comment.screenName}</Typography>
                    {editingComment[comment.id] !== undefined ? (
                      <Box>
                        <TextField
                          size="small"
                          fullWidth
                          value={editingComment[comment.id]}
                          onChange={(e) =>
                            setEditingComment((prev) => ({ ...prev, [comment.id]: e.target.value }))
                          }
                        />
                        <Stack direction="row" spacing={1} mt={1}>
                          <Button size="small" onClick={() => handleEditComment(post.id, comment.id)}>Save</Button>
                          <Button
                            size="small"
                            onClick={() =>
                              setEditingComment((prev) => ({ ...prev, [comment.id]: undefined }))
                            }
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <>
                        <Typography fontSize="0.9rem" sx={{ whiteSpace: "pre-wrap" }}>
                          {comment.text}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {safeTime(comment.createdAt)}
                        </Typography>
                        {authed && user.uid === comment.userId && (
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setEditingComment((prev) => ({ ...prev, [comment.id]: comment.text || "" }))
                              }
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </>
                    )}
                  </Box>
                </Stack>
              </Box>
            ))}

            <Stack direction="row" spacing={1} alignItems="center" mt={2}>
              <TextField
                size="small"
                fullWidth
                placeholder="Write a comment..."
                value={commentInputs[post.id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [post.id]: e.target.value
                  }))
                }
                disabled={!authed}
              />
              <IconButton onClick={() => handleComment(post.id)} disabled={!authed}>
                <Send />
              </IconButton>
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
};

export default ChatRoom;
