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
import md5 from "md5"; // ✅ Ensure you run: npm install md5

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
        const { screenName = "Anonymous", email = "" } = snap.data();
        const avatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?d=identicon`;
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
    const messagesRef = ref(rtdb, "chatMessages");

    const handleNewMessage = async (snapshot) => {
      const data = snapshot.val();
      const id = snapshot.key;
      const userInfo = await fetchUserInfo(data.userId);
      setMessages((prev) =>
        prev.some((msg) => msg.id === id)
          ? prev
          : [...prev, { id, ...data, ...userInfo }]
      );
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
    await update(ref(rtdb, `chatMessages/${editingId}`), {
      text: editingText
    });
    setEditingId(null);
    setEditingText("");
  };

  const deleteMessage = async (id) => {
    await remove(ref(rtdb, `chatMessages/${id}`));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Typography variant="h5" sx={{ backgroundColor: "#1F3F3A", color: "#fff", p: 2, textAlign: "center" }}>
        Group Chat
      </Typography>

      <Paper sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 1 }}>
        {messages.map((msg) => {
          const isOwn = msg.userId === user.uid;
          return (
            <Stack
              key={msg.id}
              direction="row"
              justifyContent={isOwn ? "flex-end" : "flex-start"}
              alignItems="flex-end"
              spacing={1}
              sx={{ mb: 2 }}
            >
              {!isOwn && <Avatar src={msg.avatarUrl} />}
              <Box
                sx={{
                  backgroundColor: isOwn ? "#1F3F3A" : "#e0f2f1",
                  color: isOwn ? "white" : "black",
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: "70%",
                  position: "relative"
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" fontWeight="bold">
                    {msg.screenName}
                  </Typography>
                  {isOwn && editingId !== msg.id && (
                    <Stack direction="row" spacing={0}>
                      <IconButton size="small" onClick={() => startEditing(msg)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteMessage(msg.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
                {editingId === msg.id ? (
                  <Stack direction="row" spacing={1} mt={1}>
                    <TextField
                      size="small"
                      fullWidth
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <Button onClick={confirmEdit} size="small" variant="contained">Save</Button>
                  </Stack>
                ) : (
                  <Typography mt={1}>{msg.text}</Typography>
                )}
                <Typography variant="caption" sx={{ position: "absolute", bottom: -18, right: 8 }}>
                  {formatTime(msg.createdAt)}
                </Typography>
              </Box>
              {isOwn && <Avatar src={msg.avatarUrl} />}
            </Stack>
          );
        })}
        <div ref={bottomRef} />
      </Paper>

      <Box
        component="form"
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        sx={{
          display: "flex",
          gap: 1,
          p: 1,
          borderTop: "1px solid #ccc",
          backgroundColor: "#fff",
          position: "sticky",
          bottom: 0
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message or paste media/emoji..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" variant="contained" sx={{ backgroundColor: "#1F3F3A" }}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatRoom;
