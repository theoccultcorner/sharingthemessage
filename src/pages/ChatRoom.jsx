import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  IconButton,
  Avatar,
  Divider
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  collection,
  query,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ChatRoom = () => {
  const { user, screenName } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "chatMessages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      screenName: screenName,
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
    <Box sx={{ px: 2, py: 4, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h4" gutterBottom align="center">
        Group Chat
      </Typography>

      <Paper elevation={3} sx={{ maxHeight: "60vh", overflowY: "auto", p: 2, mb: 2 }}>
        {messages.map((msg) => (
          <Box key={msg.id} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar sx={{ bgcolor: "#1F3F3A" }}>
                {msg.screenName?.charAt(0).toUpperCase() || "?"}
              </Avatar>
              <Box flexGrow={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight="bold">{msg.screenName}</Typography>
                  {msg.createdAt?.toDate && (
                    <Typography variant="caption" color="text.secondary">
                      {msg.createdAt.toDate().toLocaleString()}
                    </Typography>
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
                    <Button onClick={confirmEdit} size="small" variant="contained" color="primary">
                      Save
                    </Button>
                  </Stack>
                ) : (
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {msg.text}
                  </Typography>
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
            </Stack>
            <Divider sx={{ my: 1 }} />
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
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button variant="contained" onClick={sendMessage} sx={{ backgroundColor: "#1F3F3A" }}>
          Send
        </Button>
      </Stack>
    </Box>
  );
};

export default ChatRoom;
