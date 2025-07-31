import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, Avatar, IconButton, Divider, Tooltip
} from "@mui/material";
import { ThumbUp, Send, Edit, Delete } from "@mui/icons-material";
import {
  ref, onValue, push, update, remove, off, runTransaction
} from "firebase/database"; // ⬅️ added runTransaction
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

  const fetchUserInfo = async (userId) => {
    if (userCache.current[userId]) return userCache.current[userId];
    const docRef = doc(db, "users", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const { screenName = "Anonymous", avatarUrl = "" } = snap.data();
      const info = { screenName, avatarUrl, userId };
      userCache.current[userId] = info;
      return info;
    }
    return { screenName: "Unknown", avatarUrl: "", userId };
  };

  useEffect(() => {
    const postsRef = ref(rtdb, "posts");
    const unsub = onValue(postsRef, async (snapshot) => {
      const data = snapshot.val() || {};
      const postList = await Promise.all(
        Object.entries(data).map(async ([id, post]) => {
          const author = await fetchUserInfo(post.userId);

          // Build comments array with commenter info
          const comments = await Promise.all(
            Object.entries(post.comments || {}).map(async ([cid, comment]) => {
              const commenter = await fetchUserInfo(comment.userId);
              return { id: cid, ...comment, ...commenter };
            })
          );

          // Build likedBy users list
          const likedByIds = Object.keys(post.likedBy || {});
          const likedByUsers = await Promise.all(
            likedByIds.map(async (uid) => fetchUserInfo(uid))
          );

          return {
            id,
            ...post,
            ...author,
            comments,
            likedByUsers, // [{screenName, avatarUrl, userId}]
          };
        })
      );
      setPosts(postList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    });

    return () => off(postsRef);
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    await push(ref(rtdb, "posts"), {
      text: newPost,
      userId: user.uid,
      createdAt: Date.now(),
      likesCount: 0,        // ⬅️ new
      likedBy: {},          // ⬅️ new
      comments: {}
    });
    setNewPost("");
  };

  const handleEditPost = async (postId) => {
    if (!editingPostText.trim()) return;
    await update(ref(rtdb, `posts/${postId}`), { text: editingPostText });
    setEditingPostId(null);
    setEditingPostText("");
  };

  const handleDeletePost = async (postId) => {
    await remove(ref(rtdb, `posts/${postId}`));
  };

  const handleComment = async (postId) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;
    await push(ref(rtdb, `posts/${postId}/comments`), {
      text: comment,
      userId: user.uid,
      createdAt: Date.now()
    });
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleEditComment = async (postId, commentId) => {
    const text = editingComment[commentId];
    if (!text?.trim()) return;
    await update(ref(rtdb, `posts/${postId}/comments/${commentId}`), { text });
    setEditingComment((prev) => ({ ...prev, [commentId]: "" }));
  };

  const handleDeleteComment = async (postId, commentId) => {
    await remove(ref(rtdb, `posts/${postId}/comments/${commentId}`));
  };

  // Like exactly once per user. Uses a transaction on the post to atomically update likedBy and likesCount.
  const handleLike = async (postId) => {
    const postRef = ref(rtdb, `posts/${postId}`);
    await runTransaction(postRef, (current) => {
      if (!current) return current;
      if (!current.likedBy) current.likedBy = {};
      if (!current.likesCount && current.likesCount !== 0) {
        // Backwards compat: if only "likes" existed, initialize likesCount from it.
        current.likesCount = typeof current.likes === "number" ? current.likes : 0;
      }
      if (current.likedBy[user.uid]) {
        // already liked; do nothing
        return current;
      }
      current.likedBy[user.uid] = true;
      current.likesCount = (current.likesCount || 0) + 1;
      // Optional: remove old "likes" field if present to avoid confusion
      if (typeof current.likes !== "undefined") delete current.likes;
      return current;
    });
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleString();

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
        />
        <Button onClick={handlePost} variant="contained" sx={{ mt: 2 }}>
          Post
        </Button>
      </Paper>

      {posts.map((post) => {
        const hasLiked = !!(post.likedBy && post.likedBy[user.uid]);
        const likeCount =
          typeof post.likesCount === "number"
            ? post.likesCount
            : (post.likedByUsers?.length || post.likes || 0);

        return (
          <Paper key={post.id} sx={{ p: 2, mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={post.avatarUrl} />
              <Box>
                <Typography fontWeight="bold">{post.screenName}</Typography>
                <Typography variant="caption">{formatTime(post.createdAt)}</Typography>
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
              <Typography sx={{ mt: 2 }}>{post.text}</Typography>
            )}

            {user.uid === post.userId && editingPostId !== post.id && (
              <Stack direction="row" spacing={1} mt={1}>
                <IconButton onClick={() => { setEditingPostId(post.id); setEditingPostText(post.text); }}><Edit /></IconButton>
                <IconButton onClick={() => handleDeletePost(post.id)}><Delete /></IconButton>
              </Stack>
            )}

            <Stack direction="row" spacing={1} alignItems="center" mt={1}>
              <Tooltip title={hasLiked ? "You already liked this" : "Like"}>
                <span>
                  <IconButton
                    onClick={() => handleLike(post.id)}
                    disabled={hasLiked} // ⬅️ block multiple likes
                  >
                    <ThumbUp color={hasLiked ? "primary" : undefined} />
                  </IconButton>
                </span>
              </Tooltip>
              <Typography>{likeCount}</Typography>
              {/* Show who liked: tiny avatars with tooltip names */}
              {!!(post.likedByUsers && post.likedByUsers.length) && (
                <Stack direction="row" spacing={0.5} ml={1}>
                  {post.likedByUsers.map((u) => (
                    <Tooltip key={u.userId} title={u.screenName}>
                      <Avatar
                        src={u.avatarUrl}
                        sx={{ width: 20, height: 20 }}
                        alt={u.screenName}
                      />
                    </Tooltip>
                  ))}
                </Stack>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" mb={1}>Comments:</Typography>
            {post.comments.map((comment) => (
              <Box key={comment.id} sx={{ mb: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={comment.avatarUrl} sx={{ width: 24, height: 24 }} />
                  <Box>
                    <Typography fontSize="small" fontWeight="bold">{comment.screenName}</Typography>
                    {editingComment[comment.id] !== undefined ? (
                      <Box>
                        <TextField
                          size="small"
                          fullWidth
                          value={editingComment[comment.id]}
                          onChange={(e) => setEditingComment((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                        />
                        <Stack direction="row" spacing={1} mt={1}>
                          <Button size="small" onClick={() => handleEditComment(post.id, comment.id)}>Save</Button>
                          <Button size="small" onClick={() => setEditingComment((prev) => ({ ...prev, [comment.id]: undefined }))}>Cancel</Button>
                        </Stack>
                      </Box>
                    ) : (
                      <>
                        <Typography fontSize="small">{comment.text}</Typography>
                        <Typography variant="caption">{formatTime(comment.createdAt)}</Typography>
                        {user.uid === comment.userId && (
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small" onClick={() => setEditingComment((prev) => ({ ...prev, [comment.id]: comment.text }))}><Edit fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => handleDeleteComment(post.id, comment.id)}><Delete fontSize="small" /></IconButton>
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
              />
              <IconButton onClick={() => handleComment(post.id)}>
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
