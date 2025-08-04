// === FRONTEND: SponsorChat.jsx ===
import React, { useState, useEffect, useRef } from "react";
import { rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ref, push, onValue } from "firebase/database";
import {
  Box, Typography, Paper, Stack, Container, IconButton, useMediaQuery
} from "@mui/material";
import { Mic, MicOff } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const SponsorChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMsg = { sender: "user", text: messageText, timestamp: Date.now() };
    await push(messagesRef, userMsg);

    const limitedHistory = [...messages.slice(-10), userMsg];
    const chatHistory = limitedHistory
      .map(m => `${m.sender === "user" ? user.displayName : "Sponsor"}: ${m.text}`)
      .join("\n");

    const imageBase64 = captureImage();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "You're a supportive Narcotics Anonymous sponsor. Describe the person kindly if you can see them, then respond with empathy.",
          history: chatHistory,
          imageBase64
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        speak("I'm having trouble responding right now.");
        return;
      }

      const data = await res.json();
      console.log("Bot reply:", data);
      const sponsorMsg = { sender: "sponsor", text: data.reply, timestamp: Date.now() };
      await push(messagesRef, sponsorMsg);
      speak(data.reply);

    } catch (err) {
      console.error("Fetch error:", err);
      speak("Something went wrong processing the image.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 2, pb: 6, px: isMobile ? 1 : 4 }}>
      <Typography variant={isMobile ? "h6" : "h5"} align="center" gutterBottom>
        Welcome, {user.displayName}
      </Typography>

      <Paper elevation={3} sx={{ height: isMobile ? "50vh" : "60vh", overflowY: "auto", p: 1.5, borderRadius: 2, mb: 2, backgroundColor: "#f9f9f9" }}>
        <Stack spacing={1.5}>
          {messages.map((m, i) => (
            <Box key={i} sx={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
              <Paper sx={{ p: 1, backgroundColor: m.sender === "user" ? "#1F3F3A" : "#e0e0e0", color: m.sender === "user" ? "#fff" : "#000", borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>{m.sender === "user" ? "You" : "Sponsor"}:</strong> {m.text}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
        <IconButton onClick={handleListen} color={listening ? "primary" : "default"}>
          {listening ? <Mic /> : <MicOff />}
        </IconButton>
        <Typography variant="body2">
          {listening ? "Listening..." : "Tap mic to talk"}
        </Typography>
      </Stack>

      <Box mt={2} sx={{ textAlign: "center" }}>
        <Typography variant="subtitle2">Camera View</Typography>
        <video ref={videoRef} autoPlay muted style={{ width: "100%", borderRadius: 8, maxHeight: isMobile ? "200px" : "300px" }} />
      </Box>
    </Container>
  );
};

export default SponsorChat;
