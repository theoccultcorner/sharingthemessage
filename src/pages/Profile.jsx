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
  const bottomRef = useRef(null);
  const [screenNames, setScreenNames] = useState({});

  useEffect(() => {
    const q = query(collection(db, "chatMessages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const userId = data.userId;
        if (!screenNames[userId]) {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          setScreenNames((prev) => ({ ...prev, [userId]: userData.screenName || "Unknown" }));
        }
        return { id: docSnap.id, ...data };
      }));
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
    <Box sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Chatroom
      </Typography>
      <Paper sx={{ maxHeight: 400, overflowY: "auto", p: 2, mb: 2 }}>
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

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button variant="contained" onClick={sendMessage} sx={{ backgroundColor: "#1F3F3A" }}>
          Send
        </Button>
      </Stack>
    </Box>
  );
};

export default ChatRoom;
