
import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, IconButton
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  ref, onChildAdded, onChildRemoved, onChildChanged, push, remove, update, get, child, getDatabase
} from "firebase/database";
import { db as rtdb } from "../firebase"; // Assuming you configured realtime db in your firebase.js
import { useAuth } from "../context/AuthContext";

const ChatRoom = () => {
  const { user, screenName: userScreenName } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [screenNames, setScreenNames] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    const messagesRef = ref(rtdb, "chatMessages");

    const handleAdd = async (snapshot) => {
      const data = snapshot.val();
      const id = snapshot.key;
      const userId = data.userId;
      if (!screenNames[userId]) {
        try {
          const snap = await get(child(ref(rtdb), `users/${userId}`));
          const userData = snap.exists() ? snap.val() : {};
          setScreenNames((prev) => ({ ...prev, [userId]: userData.screenName || "Unknown" }));
        } catch {
          setScreenNames((prev) => ({ ...prev, [userId]: "Unknown" }));
        }
      }
      setMessages((prev) => [...prev, { id, ...data }]);
    };

    const handleChange = (snapshot) => {
      const data = snapshot.val();
      const id = snapshot.key;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...data } : msg))
      );
    };

    const handleRemove = (snapshot) => {
      const id = snapshot.key;
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    const addListener = onChildAdded(messagesRef, handleAdd);
    const changeListener = onChildChanged(messagesRef, handleChange);
    const removeListener = onChildRemoved(messagesRef, handleRemove);

    return () => {
      addListener();
      changeListener();
      removeListener();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const messagesRef = ref(rtdb, "chatMessages");
    await push(messagesRef, {
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
    const msgRef = ref(rtdb, `chatMessages/${editingId}`);
    await update(msgRef, { text: editingText });
    setEditingId(null);
    setEditingText("");
  };

  const deleteMessage = async (id) => {
    await remove(ref(rtdb, `chatMessages/${id}`));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Chatroom
      </Typography>

      <Paper sx={{ flexGrow: 1, overflowY: "auto", p: 2, mb: 1 }}>
        {messages.map((msg) => (
          <Box key={msg.id} sx={{ mb: 1, borderBottom: "1px solid #ccc", pb: 1 }}>
            <Typography variant="subtitle2" color="primary">
              {screenNames[msg.userId] || "Loading..."}
            </Typography>
            {editingId === msg.id ? (
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <Button onClick={confirmEdit} size="small">Save</Button>
              </Stack>
            ) : (
              <Typography variant="body1">{msg.text}</Typography>
            )}
            {msg.userId === user.uid && editingId !== msg.id && (
              <Stack direction="row" spacing={1} mt={1}>
                <IconButton size="small" onClick={() => startEditing(msg)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => deleteMessage(msg.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Box>
        ))}
        <div ref={bottomRef} />
      </Paper>

      <Box component="form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }} sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
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
