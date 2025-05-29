import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, IconButton
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  collection, query, orderBy, addDoc, onSnapshot, serverTimestamp,
  deleteDoc, doc, updateDoc, getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ChatRoom = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [screenNames, setScreenNames] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "chatMessages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newScreenNames = { ...screenNames };
      const msgs = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const userId = data.userId;
        if (!newScreenNames[userId]) {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          newScreenNames[userId] = userData.screenName || "Unknown";
        }
        return { id: docSnap.id, ...data };
      }));
      setScreenNames(newScreenNames);
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await addDoc(collection(db, "chatMessages"), {
      text: input,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    setInput("");
  };

  const startEditing = (msg) => {
    setEditingId(msg.id);
    setEditingText(msg.text);
  };

  const confirmEdit = async () => {
    if (!editingText.trim()) return;
    const msgRef = doc(db, "chatMessages", editingId);
    await updateDoc(msgRef, { text: editingText });
    setEditingId(null);
    setEditingText("");
  };

  const deleteMessage = async (id) => {
    await deleteDoc(doc(db, "chatMessages", id));
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
