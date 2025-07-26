// /pages/MessageBoard.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, Avatar, IconButton, Divider
} from "@mui/material";
import { ThumbUp, Send } from "@mui/icons-material";
import {
  ref, onValue, push, update, off
} from "firebase/database";
import { db, rtdb } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const ChatRoom = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
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
          <Typography sx={{ mt: 2 }}>{post.text}</Typography>

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
                  <Typography fontSize="small">{comment.text}</Typography>
                  <Typography variant="caption">{formatTime(comment.createdAt)}</Typography>
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
