// === FRONTEND: SponsorChat.jsx ===
import React, { useEffect, useRef } from "react";
import { rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ref, push } from "firebase/database";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as faceapi from "face-api.js";

const SponsorChat = () => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const messagesRef = ref(rtdb, `na_chats/${user.uid}`);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    };

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch(err => console.error("Camera error:", err));

    loadModels();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current && faceapi.nets.tinyFaceDetector.params) {
        const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        if (detections) {
          const expressions = detections.expressions;
          const maxExp = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
          const feedback = `I see you're feeling ${maxExp}. I'm here with you.`;
          const botMsg = { sender: "M.A.T.T.", text: feedback, timestamp: Date.now() };
          await push(messagesRef, botMsg);
          speak(feedback);
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

    const imageBase64 = captureImage();
    console.log("Captured image size:", imageBase64.length);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "You are M.A.T.T. (My Anchor Through Turmoil), a virtual Narcotics Anonymous sponsor. Respond with empathy. Describe the user if an image is provided.",
          history: `User: ${messageText}`,
          imageBase64
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("API error:", errText);
        throw new Error(errText);
      }

      const data = await res.json();
      if (!data.reply) throw new Error("No reply from Gemini");

      const sponsorMsg = { sender: "M.A.T.T.", text: data.reply, timestamp: Date.now() };
      await push(messagesRef, sponsorMsg);
      speak(data.reply);

    } catch (err) {
      console.error("Fetch error:", err);
      speak("I'm having trouble responding right now.");
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", backgroundColor: "black" }}>
      <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", textAlign: "center", zIndex: 10, p: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: "white", textShadow: "1px 1px 3px black" }}>
          M.A.T.T. – My Anchor Through Turmoil
        </Typography>
      </Box>
      <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </Container>
  );
};

export default SponsorChat;