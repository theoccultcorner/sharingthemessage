import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, IconButton, Avatar
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  ref, onChildAdded, onChildChanged, onChildRemoved,
  push, remove, update
} from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { db, rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ChatRoom = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const userCache = useRef({});
  const bottomRef = useRef(null);

  const fetchUserInfo = async (userId) => {
    if (userCache.current[userId]) return userCache.current[userId];
    try {
      const docRef = doc(db, "users", userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const { screenName, avatarUrl = "", email = "" } = snap.data();
        const info = { screenName, avatarUrl, email };
        userCache.current[userId] = info;
        return info;
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
    return { screenName: "Unknown", avatarUrl: "", email: "N/A" };
  };

  useEffect(() => {
    const messagesRef = ref(rtdb, "chatMessages");

    const handleNewMessage = async (snapshot) => {
      const data = snapshot.val();
      const id = snapshot.key;
      const userInfo = await fetchUserInfo(data.userId);
      setMessages((prev) => [...prev, { id, ...data, ...userInfo }]);
    };

    const handleUpdate = async (snapshot) => {
      const data = snapshot.val();
      const id = snapshot.key;
      const userInfo = await fetchUserInfo(data.userId);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...data, ...userInfo } : msg))
      );
    };

    const handleDelete = (snapshot) => {
      const id = snapshot.key;
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    const addListener = onChildAdded(messagesRef, handleNewMessage);
    const updateListener = onChildChanged(messagesRef, handleUpdate);
    const removeListener = onChildRemoved(messagesRef, handleDelete);

    return () => {
      addListener();
      updateListener();
      removeListener();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await push(ref(rtdb, "chatMessages"), {
      text: input,
      userId: user.uid,
      createdAt: Date.now()
    });
    setInput("");
  };

  const startEditing = (msg) => {
    setEditingId(msg.id);
    setEditingText(msg.text);
  };

  const confirmEdit = async () => {
    if (!editingText.trim()) return;
    await update(ref(rtdb, `chatMessages/${editingId}`), { text: editingText });
    setEditingId(null);
    setEditingText("");
  };

  const deleteMessage = async (id) => {
    await remove(ref(rtdb, `chatMessages/${id}`));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", p: 0 }}>
      <Typography variant="h5" sx={{ backgroundColor: "#1F3F3A", color: "#fff", p: 2 }}>
        Group Chat
      </Typography>

      <Paper sx={{ flexGrow: 1, overflowY: "auto", p: 2, mb: 1, borderRadius: 0 }}>
        {messages.map((msg) => (
          <Box key={msg.id} sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar src={msg.avatarUrl} />
              <Box>
                <Typography variant="subtitle2">{msg.screenName}</Typography>
                <Typography variant="caption" color="textSecondary">{msg.email}</Typography>
              </Box>
            </Stack>
            {editingId === msg.id ? (
              <Stack direction="row" spacing={1} mt={1}>
                <TextField
                  size="small"
                  fullWidth
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <Button onClick={confirmEdit} size="small">Save</Button>
              </Stack>
            ) : (
              <Typography variant="body1" mt={1}>{msg.text}</Typography>
            )}
            {msg.userId === user.uid && editingId !== msg.id && (
              <Stack direction="row" spacing={1} mt={1}>
                <IconButton size="small" onClick={() => startEditing(msg)}><Edit fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => deleteMessage(msg.id)}><Delete fontSize="small" /></IconButton>
              </Stack>
            )}
          </Box>
        ))}
        <div ref={bottomRef} />
      </Paper>

      <Box
        component="form"
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        sx={{
          display: "flex",
          p: 1,
          borderTop: "1px solid #ccc",
          backgroundColor: "#fff",
          position: "sticky",
          bottom: 0,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" variant="contained" sx={{ backgroundColor: "#1F3F3A", ml: 1 }}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatRoom;
