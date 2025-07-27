import React, { useState, useEffect, useRef } from "react";
import { rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ref, push, onValue } from "firebase/database";
import OpenAI from "openai";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Container
} from "@mui/material";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SponsorChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const messagesRef = ref(rtdb, `na_chats/${user.uid}`);

  useEffect(() => {
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const parsed = data ? Object.values(data) : [];
      setMessages(parsed);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input, timestamp: Date.now() };
    await push(messagesRef, userMsg);
    setInput("");

    const chatHistory = [...messages, userMsg]
      .map((m) => `${m.sender === "user" ? user.displayName : "Sponsor"}: ${m.text}`)
      .join("\n");

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You're a supportive Narcotics Anonymous sponsor. Be encouraging, empathetic, and helpful.`,
        },
        {
          role: "user",
          content: chatHistory,
        },
      ],
    });

    const reply = aiResponse.choices[0].message.content;
    const sponsorMsg = { sender: "sponsor", text: reply, timestamp: Date.now() };
    await push(messagesRef, sponsorMsg);
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Welcome, {user.displayName}
      </Typography>

      <Paper
        elevation={3}
        sx={{
          height: "60vh",
          overflowY: "auto",
          p: 2,
          borderRadius: 2,
          mb: 2,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Stack spacing={2}>
          {messages.map((m, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  backgroundColor: m.sender === "user" ? "#1F3F3A" : "#e0e0e0",
                  color: m.sender === "user" ? "#fff" : "#000",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">
                  <strong>{m.sender === "user" ? "You" : "Sponsor"}:</strong> {m.text}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          fullWidth
          size="small"
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{
            backgroundColor: "#1F3F3A",
            "&:hover": { backgroundColor: "#16302D" },
          }}
        >
          Send
        </Button>
      </Stack>
    </Container>
  );
};

export default SponsorChat;
