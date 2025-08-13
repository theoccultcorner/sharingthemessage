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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const LS_KEYS = {
  voice: "mattVoiceName",
  rate: "mattVoiceRate",
  pitch: "mattVoicePitch",
};

const SponsorChat = () => {
  const { user } = useAuth();
  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [statusText, setStatusText] = useState("Idle");

  // TTS voice state
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState(
    localStorage.getItem(LS_KEYS.voice) || ""
  );
  const [rate, setRate] = useState(Number(localStorage.getItem(LS_KEYS.rate)) || 1);
  const [pitch, setPitch] = useState(Number(localStorage.getItem(LS_KEYS.pitch)) || 1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const messagesRef = user ? rtdbRef(rtdb, `na_chats/${user.uid}`) : null;

  // ----- Voice management -----
  const loadVoices = useCallback(() => {
    if (!window.speechSynthesis) return [];
    const v = window.speechSynthesis.getVoices() || [];
    setVoices(v);

    // If no saved choice, pick a "best" default
    if (!voiceName && v.length) {
      // Prefer high-quality voices (Chrome often labels them "Google ...")
      const preferred = v.find(
        (vv) =>
          /google|natural|neural|microsoft/i.test(vv.name) &&
          /^en(-|_)?(US|GB)/i.test(vv.lang)
      );
      const fallback = v.find((vv) => /^en(-|_)?(US|GB)/i.test(vv.lang)) || v[0];
      const chosen = preferred || fallback;
      setVoiceName(chosen?.name || "");
      if (chosen?.name) localStorage.setItem(LS_KEYS.voice, chosen.name);
    }
    return v;
  }, [voiceName]);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    loadVoices();
    // Some browsers populate voices async
    const onChange = () => loadVoices();
    window.speechSynthesis.onvoiceschanged = onChange;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

  const getSelectedVoice = useCallback(() => {
    if (!window.speechSynthesis) return null;
    const list = window.speechSynthesis.getVoices() || voices;
    return list.find((v) => v.name === voiceName) || null;
  }, [voiceName, voices]);

  // ----- TTS -----
  const speak = useCallback(
    (text) => {
      try {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const v = getSelectedVoice();
        if (v) utterance.voice = v;
        utterance.lang = v?.lang || "en-US";
        utterance.rate = rate;   // 0.1–10
        utterance.pitch = pitch; // 0–2
        utterance.volume = 1;

        utterance.onend = () => {
          if (isMountedRef.current && isListening) {
            safeStartRecognition();
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch { /* no-op */ }
    },
    [getSelectedVoice, rate, pitch, isListening]
  );

  // ----- DB send & reply -----
  const handleSendMessage = useCallback(
    async (messageText) => {
      const text = (messageText || "").trim();
      if (!text || !messagesRef) return;

      try {
        await push(messagesRef, { sender: "user", text, timestamp: Date.now() });
      } catch (e) {
        console.error("Failed to push user message:", e);
      }

      // TODO: wire in AI backend; this is placeholder
      const replyText = "Thank you for sharing. Stay strong. I’m here for you.";
      try {
        await push(messagesRef, {
          sender: "M.A.T.T.",
          text: replyText,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.error("Failed to push sponsor message:", e);
      }

      speak(replyText);
    },
    [messagesRef, speak]
  );

  // ----- Speech recognition -----
  const createRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SR) return null;

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setStatusText("Listening…");
      setIsListening(true);
    };

    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const transcript = last && last[0] ? last[0].transcript : "";
      const clean = (transcript || "").trim();
      if (clean) {
        setLastHeard(clean);
        handleSendMessage(clean);
      }
    };

    rec.onspeechend = () => {
      try { rec.stop(); } catch {}
    };

    rec.onend = () => {
      setStatusText("Idle");
      setIsListening(false);
      if (isMountedRef.current && recognitionRef.current && isListening) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          safeStartRecognition();
        }, 350);
      }
    };

    rec.onerror = (e) => {
      console.warn("SpeechRecognition error:", e?.error || e);
      setStatusText(`Mic error: ${e?.error || "unknown"}`);
      setIsListening(false);
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
      alert("Voice input isn’t supported here. Try Chrome/Edge desktop.");
      return;
    }
    recognitionRef.current = rec;
    try { rec.start(); } catch {}
  }, [createRecognition]);

  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch {}
    }
    setIsListening(false);
    setStatusText("Idle");
  }, []);

  // Lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(restartTimerRef.current);
      try { recognitionRef.current?.stop(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  // UI handlers
  const handleStartClick = async () => {
    if (!user) { alert("Please sign in to use voice chat."); return; }
    try {
      // Prime TTS permissions on first gesture
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis?.speak(u);
    } catch {}
    setIsListening(true);
    safeStartRecognition();
  };

  const handleStopClick = () => stopRecognition();

  const handlePreview = () => {
    speak("Hi, I’m M.A.T.T. This is my current voice.");
  };

  const handleVoiceChange = (e) => {
    const name = e.target.value;
    setVoiceName(name);
    localStorage.setItem(LS_KEYS.voice, name);
  };

  const handleRateChange = (_, val) => {
    setRate(val);
    localStorage.setItem(LS_KEYS.rate, String(val));
  };

  const handlePitchChange = (_, val) => {
    setPitch(val);
    localStorage.setItem(LS_KEYS.pitch, String(val));
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
        <Stack spacing={3} alignItems="center" sx={{ width: "min(800px, 92vw)" }}>
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

          {/* Voice controls */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              width: "100%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: "rgba(255,255,255,0.9)" }}>Voice</InputLabel>
                <Select
                  value={voiceName}
                  label="Voice"
                  onChange={handleVoiceChange}
                  sx={{ color: "white" }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                >
                  {voices.map((v) => (
                    <MenuItem key={v.name} value={v.name}>
                      {v.name} — {v.lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  Rate ({rate.toFixed(2)})
                </Typography>
                <Slider
                  min={0.7}
                  max={1.3}
                  step={0.01}
                  value={rate}
                  onChange={handleRateChange}
                />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  Pitch ({pitch.toFixed(2)})
                </Typography>
                <Slider
                  min={0.8}
                  max={1.4}
                  step={0.01}
                  value={pitch}
                  onChange={handlePitchChange}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  onClick={handlePreview}
                  variant="outlined"
                  startIcon={<VolumeUpIcon />}
                  sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
                >
                  Preview Voice
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Start/Stop */}
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
                mt: 1,
                p: 2,
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.8)" }}>
                Last heard
              </Typography>
              <Typography variant="body1" sx={{ color: "white", wordBreak: "break-word" }}>
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
