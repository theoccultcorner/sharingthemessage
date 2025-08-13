// === FRONTEND: SponsorChat.jsx ===
import React, { useEffect, useRef, useState, useCallback } from "react";
import { rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ref as rtdbRef, push } from "firebase/database";
import {
  Box,
  Typography,
  Container,
  useMediaQuery,
  Button,
  Stack,
  Chip,
  Paper
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import StopCircleIcon from "@mui/icons-material/StopCircle";

const SponsorChat = () => {
  const { user } = useAuth();
  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [statusText, setStatusText] = useState("Idle");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Realtime DB path guarded by user presence
  const messagesRef = user ? rtdbRef(rtdb, `na_chats/${user.uid}`) : null;

  // --- Speech Synthesis (TTS)
  const speak = useCallback((text) => {
    try {
      if (!window.speechSynthesis) return;
      if (speechSynthesis.speaking) speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      // After speaking, restart listening (if user wants to keep listening)
      utterance.onend = () => {
        if (isMountedRef.current && isListening) {
          safeStartRecognition(); // restart after TTS ends
        }
      };

      speechSynthesis.speak(utterance);
    } catch {
      /* no-op */
    }
  }, [isListening]);

  // --- Send message to RTDB and reply
  const handleSendMessage = useCallback(
    async (messageText) => {
      const text = (messageText || "").trim();
      if (!text || !messagesRef) return;

      // Push user message
      const userMsg = {
        sender: "user",
        text,
        timestamp: Date.now(),
      };
      try {
        await push(messagesRef, userMsg);
      } catch (e) {
        console.error("Failed to push user message:", e);
      }

      // Generate reply (placeholder here — plug in your AI later)
      const replyText =
        "Thank you for sharing. Stay strong. I’m here for you.";

      const sponsorMsg = {
        sender: "M.A.T.T.",
        text: replyText,
        timestamp: Date.now(),
      };
      try {
        await push(messagesRef, sponsorMsg);
      } catch (e) {
        console.error("Failed to push sponsor message:", e);
      }

      // Speak reply after it’s queued
      speak(replyText);
    },
    [messagesRef, speak]
  );

  // --- Recognition lifecycle helpers
  const createRecognition = useCallback(() => {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    if (!SR) return null;

    const rec = new SR();

    // Single-utterance mode: stop automatically when the user pauses
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setStatusText("Listening…");
      setIsListening(true);
    };

    rec.onresult = (event) => {
      // Get final transcript for this utterance
      const last = event.results[event.results.length - 1];
      const transcript = last && last[0] ? last[0].transcript : "";
      const clean = (transcript || "").trim();

      if (clean) {
        setLastHeard(clean);
        handleSendMessage(clean);
      }
    };

    // Fires when user stops speaking (in single-utterance mode it’ll end)
    rec.onspeechend = () => {
      try {
        rec.stop();
      } catch { /* ignore */ }
    };

    rec.onend = () => {
      setStatusText("Idle");
      setIsListening(false);

      // If component still wants to listen, restart after a short pause
      if (isMountedRef.current && recognitionRef.current && isListening) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          safeStartRecognition();
        }, 350); // small buffer to prevent rapid restarts
      }
    };

    rec.onerror = (e) => {
      console.warn("SpeechRecognition error:", e?.error || e);
      setStatusText(`Mic error: ${e?.error || "unknown"}`);
      setIsListening(false);
      // Attempt gentle restart for transient issues
      if (isMountedRef.current && isListening) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          safeStartRecognition();
        }, 1000);
      }
    };

    return rec;
  }, [handleSendMessage, isListening]);

  const safeStartRecognition = useCallback(() => {
    const rec = recognitionRef.current || createRecognition();
    if (!rec) {
      alert(
        "Voice input is not supported in this browser. Try Chrome or Edge on desktop."
      );
      return;
    }
    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      // start() can throw if already started — ignore
    }
  }, [createRecognition]);

  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch { /* ignore */ }
    }
    setIsListening(false);
    setStatusText("Idle");
  }, []);

  // --- Mount/Unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(restartTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch { /* ignore */ }
      // Cancel any speech still playing
      try {
        window.speechSynthesis?.cancel();
      } catch { /* ignore */ }
    };
  }, []);

  // --- Optional: Auto-init mic if browser supports it (after user gesture, see below)
  // We won’t auto-start on mount to avoid permission/UI friction on mobile.
  // Users can tap the Start button to begin.

  // --- UI handlers
  const handleStartClick = async () => {
    if (!user) {
      alert("Please sign in to use voice chat.");
      return;
    }
    // On first interaction, some browsers require a user gesture to allow TTS later
    try {
      // Prime TTS with a silent utterance to unlock autoplay in some browsers
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis?.speak(u);
    } catch { /* ignore */ }

    setIsListening(true);
    safeStartRecognition();
  };

  const handleStopClick = () => {
    stopRecognition();
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "black",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          textAlign: "center",
          zIndex: 10,
          p: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h4"}
          sx={{ color: "white", textShadow: "1px 1px 3px black" }}
        >
          M.A.T.T. – My Anchor Through Turmoil
        </Typography>
      </Box>

      {/* Center content */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Chip
            label={statusText}
            color={isListening ? "success" : "default"}
            variant="filled"
            sx={{ color: "white" }}
          />
          <Typography
            variant="body1"
            sx={{
              color: "white",
              textAlign: "center",
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            {isListening
              ? "Listening… Speak to M.A.T.T."
              : "Tap Start to speak to M.A.T.T."}
          </Typography>

          <Stack direction="row" spacing={2}>
            {!isListening ? (
              <Button
                onClick={handleStartClick}
                variant="contained"
                color="success"
                startIcon={<KeyboardVoiceIcon />}
              >
                Start
              </Button>
            ) : (
              <Button
                onClick={handleStopClick}
                variant="contained"
                color="error"
                startIcon={<StopCircleIcon />}
              >
                Stop
              </Button>
            )}
          </Stack>

          {lastHeard ? (
            <Paper
              elevation={3}
              sx={{
                mt: 2,
                p: 2,
                maxWidth: 720,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                Last heard
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "white", wordBreak: "break-word" }}
              >
                {lastHeard}
              </Typography>
            </Paper>
          ) : null}
        </Stack>
      </Box>
    </Container>
  );
};

export default SponsorChat;
