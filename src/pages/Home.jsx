import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, IconButton, Avatar
} from "@mui/material";
import { Edit, Delete, ThumbUp } from "@mui/icons-material";
import {
  ref, onValue, push, remove, update, set, off
} from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { db, rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ChatRoom = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const userCache = useRef({});
  const bottomRef = useRef(null);

  const fetchUserInfo = async (userId) => {
    if (userCache.current[userId]) return userCache.current[userId];
    try {
      const docRef = doc(db, "users", userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const { screenName = "Anonymous", avatarUrl = "" } = snap.data();
        const info = { screenName, avatarUrl };
        userCache.current[userId] = info;
        return info;
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
    return { screenName: "Unknown", avatarUrl: "" };
  };

  useEffect(() => {
    const postsRef = ref(rtdb, "posts");
    const handleValue = async (snapshot) => {
      const data = snapshot.val() || {};
      const entries = await Promise.all(
        Object.entries(data).map(async ([id, post]) => {
          const userInfo = await fetchUserInfo(post.userId);
          return { id, ...post, ...userInfo };
        })
      );
      setPosts(entries);
    };
    onValue(postsRef, handleValue);
    return () => off(postsRef);
  }, []);

  const addPost = async () => {
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

  const deletePost = async (id) => {
    await remove(ref(rtdb, `posts/${id}`));
  };

  const editPost = async (id, newText) => {
    await update(ref(rtdb, `posts/${id}`), { text: newText });
  };

  const addComment = async (postId, commentText) => {
    const commentId = Date.now().toString();
    await set(ref(rtdb, `posts/${postId}/comments/${commentId}`), {
      text: commentText,
      userId: user.uid,
      createdAt: Date.now()
    });
  };

  const deleteComment = async (postId, commentId) => {
    await remove(ref(rtdb, `posts/${postId}/comments/${commentId}`));
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Message Board</Typography>

      <Stack spacing={2} mb={3}>
        <TextField
          multiline
          fullWidth
          rows={3}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share something..."
        />
        <Button variant="contained" onClick={addPost}>Post</Button>
      </Stack>

      {posts.map((post) => (
        <Paper key={post.id} sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={post.avatarUrl} />
            <Box flexGrow={1}>
              <Typography variant="subtitle1">{post.screenName}</Typography>
              <Typography variant="caption">{formatTime(post.createdAt)}</Typography>
            </Box>
            {post.userId === user.uid && (
              <>
                <IconButton onClick={() => editPost(post.id, prompt("Edit your post:", post.text))}><Edit /></IconButton>
                <IconButton onClick={() => deletePost(post.id)}><Delete /></IconButton>
              </>
            )}
          </Stack>
          <Typography sx={{ mt: 2 }}>{post.text}</Typography>

          <Box mt={2}>
            <Typography variant="subtitle2">Comments:</Typography>
            <Stack spacing={1} mt={1}>
              {post.comments && Object.entries(post.comments).map(([cid, comment]) => (
                <Box key={cid} sx={{ pl: 2 }}>
                  <Typography variant="body2">
                    {userCache.current[comment.userId]?.screenName || "User"}: {comment.text}
                  </Typography>
                  <Typography variant="caption">{formatTime(comment.createdAt)}</Typography>
                  {comment.userId === user.uid && (
                    <>
                      <IconButton size="small" onClick={() => deleteComment(post.id, cid)}><Delete fontSize="small" /></IconButton>
                    </>
                  )}
                </Box>
              ))}
              <Box>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add a comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addComment(post.id, e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </Box>
            </Stack>
          </Box>
        </Paper>
      ))}

      <div ref={bottomRef} />
    </Box>
  );
};

export default ChatRoom;
