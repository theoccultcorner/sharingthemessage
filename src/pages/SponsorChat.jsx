// === FRONTEND: SponsorChat.jsx ===
import React, { useEffect, useRef } from "react";
import { rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ref, push } from "firebase/database";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const SponsorChat = () => {
  const { user } = useAuth();
  const recognitionRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const messagesRef = ref(rtdb, `na_chats/${user.uid}`);

  useEffect(() => {
    const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window;
    if (!isSpeechRecognitionSupported) {
      alert("Voice input is not supported on your browser. Try Chrome for full functionality.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleSendMessage(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();

    return () => recognition.stop();
  }, []);

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

    const replyText = `Thank you for sharing. Stay strong. I’m here for you.`;
    const sponsorMsg = { sender: "M.A.T.T.", text: replyText, timestamp: Date.now() };
    await push(messagesRef, sponsorMsg);
    speak(replyText);
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", backgroundColor: "black" }}>
      <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", textAlign: "center", zIndex: 10, p: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: "white", textShadow: "1px 1px 3px black" }}>
          M.A.T.T. – My Anchor Through Turmoil
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Typography variant="body1" sx={{ color: "white", textAlign: "center" }}>
          Voice chat active. Speak to M.A.T.T.
        </Typography>
      </Box>
    </Container>
  );
};

export default SponsorChat;
