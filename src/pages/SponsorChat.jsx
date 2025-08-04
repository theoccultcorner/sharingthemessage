// === FRONTEND: SponsorChat.jsx ===
import React, { useState, useEffect, useRef } from "react";
import { rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ref, push, onValue } from "firebase/database";
import {
  Box, Typography, Paper, Stack, Container, IconButton
} from "@mui/material";
import { Mic, MicOff } from "@mui/icons-material";

const SponsorChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

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

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch(err => console.error("Camera error:", err));
  }, []);

  useEffect(() => {
    const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window;
    if (!isSpeechRecognitionSupported) {
      alert("Voice input is not supported on your browser. Try Chrome for full functionality.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSendMessage(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleListen = () => {
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const speak = (text) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMsg = { sender: "user", text: messageText, timestamp: Date.now() };
    await push(messagesRef, userMsg);

    const chatHistory = [...messages, userMsg]
      .map(m => `${m.sender === "user" ? user.displayName : "Sponsor"}: ${m.text}`)
      .join("\n");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "You're a supportive Narcotics Anonymous sponsor. Be empathetic, encouraging.",
          history: chatHistory
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        speak("I'm having trouble responding right now.");
        return;
      }

      const data = await res.json();
      const sponsorMsg = { sender: "sponsor", text: data.reply, timestamp: Date.now() };
      await push(messagesRef, sponsorMsg);
      speak(data.reply);

    } catch (err) {
      console.error("Fetch error:", err);
      speak("Something went wrong. Please try again later.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Welcome, {user.displayName}
      </Typography>

      <Paper elevation={3} sx={{ height: "60vh", overflowY: "auto", p: 2, borderRadius: 2, mb: 2, backgroundColor: "#f9f9f9" }}>
        <Stack spacing={2}>
          {messages.map((m, i) => (
            <Box key={i} sx={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
              <Paper sx={{ p: 1.5, backgroundColor: m.sender === "user" ? "#1F3F3A" : "#e0e0e0", color: m.sender === "user" ? "#fff" : "#000", borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>{m.sender === "user" ? "You" : "Sponsor"}:</strong> {m.text}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton onClick={handleListen} color={listening ? "primary" : "default"}>
          {listening ? <Mic /> : <MicOff />}
        </IconButton>
        <Typography variant="body2">
          {listening ? "Listening..." : "Click mic to talk"}
        </Typography>
      </Stack>

      <Box mt={3} sx={{ textAlign: "center" }}>
        <Typography variant="subtitle1">Camera View</Typography>
        <video ref={videoRef} autoPlay muted style={{ width: "100%", borderRadius: 8 }} />
      </Box>
    </Container>
  );
};

export default SponsorChat;