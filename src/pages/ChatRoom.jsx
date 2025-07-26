import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, Avatar, IconButton, Divider
} from "@mui/material";
import { ThumbUp, Send, Edit, Delete } from "@mui/icons-material";
import {
  ref, onValue, push, update, remove, off
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

  const fetchUserInfo = async (userId) => {
    if (userCache.current[userId]) return userCache.current[userId];
    const docRef = doc(db, "users", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const { screenName = "Anonymous", avatarUrl = "" } = snap.data();
      const info = { screenName, avatarUrl };
      userCache.current[userId] = info;
      return info;
    }
    return { screenName: "Unknown", avatarUrl: "" };
  };

  const loadPosts = async () => {
    const postsRef = ref(rtdb, "posts");
    onValue(postsRef, async (snapshot) => {
      const data = snapshot.val() || {};
      const postList = await Promise.all(
        Object.entries(data).map(async ([id, post]) => {
          const author = await fetchUserInfo(post.userId);
          const comments = await Promise.all(
            Object.entries(post.comments || {}).map(async ([cid, comment]) => {
              const commenter = await fetchUserInfo(comment.userId);
              return { id: cid, ...comment, ...commenter };
            })
          );
          return {
            id,
            ...post,
            ...author,
            comments
          };
        })
      );
      setPosts(postList.reverse());
    });

    return () => off(postsRef);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    await push(ref(rtdb, "posts"), {
      text: newPost,
      userId: user.uid,
      createdAt: Date.now(),
      likes: 0,
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

  const handleLike = async (postId, currentLikes = 0) => {
    await update(ref(rtdb, `posts/${postId}`), { likes: currentLikes + 1 });
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

      {posts.map((post) => (
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
            <IconButton onClick={() => handleLike(post.id, post.likes)}>
              <ThumbUp />
            </IconButton>
            <Typography>{post.likes || 0}</Typography>
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
      ))}
    </Box>
  );
};

export default ChatRoom;