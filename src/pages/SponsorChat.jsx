// === FRONTEND ONLY — SponsorChat.jsx ===
// No backend. Uses GEMINI_API_KEY and the browser's best TTS voice.
// If you don't use Firebase, simply remove the RTDB lines noted below.

import React, { useEffect, useRef, useState, useCallback } from "react";

// OPTIONAL: Comment out these 3 lines if you're not saving messages.
// ---------- FIREBASE (OPTIONAL LOGGING OF CHAT) ----------
import { rtdb } from "../firebase"; // remove if not using
import { ref as rtdbRef, push } from "firebase/database"; // remove if not using
// --------------------------------------------------------

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

// Gemini browser SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

const LS_KEYS = {
  voice: "mattVoiceName",
  rate: "mattVoiceRate",
  pitch: "mattVoicePitch",
};

// ---- API KEY (frontend) ----
// Only uses the variable name you supplied: GEMINI_API_KEY.
// Exposed via your bundler or set at runtime on window.GEMINI_API_KEY.
function getGeminiApiKey() {
  const k =
    (typeof import.meta !== "undefined" && import.meta.env?.GEMINI_API_KEY) ||
    (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
    (typeof window !== "undefined" && window.GEMINI_API_KEY);
  if (!k) {
    throw new Error(
      "GEMINI_API_KEY is not set. Provide import.meta.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY, or window.GEMINI_API_KEY."
    );
  }
  return k;
}

// Lazy client init
let _genAI = null;
function getGeminiClient() {
  if (_genAI) return _genAI;
  _genAI = new GoogleGenerativeAI(getGeminiApiKey());
  return _genAI;
}

async function getMATTReplyGemini(userText) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const system = [
    "You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.",
    "Reply in 1–3 short sentences. Be supportive, non-judgmental, practical.",
    "Suggest one gentle next step (e.g., drink water, text a friend/sponsor, step outside, breathe).",
    "Avoid medical/clinical claims. If the user sounds in crisis, suggest local resources or 988 (U.S.).",
    "No emojis. Warm, grounded, concise.",
  ].join(" ");

  const prompt = `User said: "${userText}". Respond as M.A.T.T. now (1–3 short sentences).`;

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: system }] },
      { role: "user", parts: [{ text: prompt }] },
    ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 140 },
  });

  const text =
    result?.response?.text?.() ||
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "";
  return text?.trim() ||
    "I hear you. You’re not alone. Let’s take one small step—slow breath in, slow breath out.";
}

// Helper: pick a “better” voice: Google/Microsoft/Natural/Neural, English, desktop
function pickBestVoice(voices) {
  if (!voices || !voices.length) return null;
  const eno = (v) => /^en(-|_)?(US|GB|AU|CA|NZ)/i.test(v.lang || "");
  const score = (v) => {
    let s = 0;
    if (/google|microsoft|natural|neural/i.test(v.name)) s += 3;
    if (eno(v)) s += 2;
    if (/female|male/i.test(v.name)) s += 1;
    return s;
  };
  return [...voices].sort((a, b) => score(b) - score(a))[0] || voices[0];
}

const SponsorChat = ({ saveToFirebase = true, userId = "local-user" }) => {
  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [statusText, setStatusText] = useState("Idle");

  // Voice controls
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState(
    localStorage.getItem(LS_KEYS.voice) || ""
  );
  const [rate, setRate] = useState(
    Number(localStorage.getItem(LS_KEYS.rate)) || 1
  );
  const [pitch, setPitch] = useState(
    Number(localStorage.getItem(LS_KEYS.pitch)) || 1
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // OPTIONAL: remove these two if not saving chat
  const messagesRef =
    saveToFirebase && rtdb ? rtdbRef(rtdb, `na_chats/${userId}`) : null;

  // ---------- VOICE MGMT ----------
  const loadVoices = useCallback(() => {
    if (!window.speechSynthesis) return [];
    const v = window.speechSynthesis.getVoices() || [];
    setVoices(v);
    if (!voiceName && v.length) {
      const chosen = pickBestVoice(v);
      setVoiceName(chosen?.name || "");
      if (chosen?.name) localStorage.setItem(LS_KEYS.voice, chosen.name);
    }
    return v;
  }, [voiceName]);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    // Chrome sometimes loads voices async
    loadVoices();
    const onChange = () => loadVoices();
    window.speechSynthesis.onvoiceschanged = onChange;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

  const getSelectedVoice = useCallback(() => {
    if (!window.speechSynthesis) return null;
    const list = window.speechSynthesis.getVoices() || voices;
    return list.find((v) => v.name === voiceName) || pickBestVoice(list);
  }, [voiceName, voices]);

  // ---------- TTS ----------
  const speak = useCallback(
    (text) => {
      if (!window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        const v = getSelectedVoice();
        if (v) utter.voice = v;
        utter.lang = v?.lang || "en-US";
        utter.rate = rate;
        utter.pitch = pitch;
        utter.volume = 1;

        // After speaking, resume mic if we’re in “auto” mode
        utter.onend = () => {
          if (isMountedRef.current && isListening) safeStartRecognition();
        };
        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn("TTS error:", e);
      }
    },
    [getSelectedVoice, rate, pitch, isListening]
  );

  // ---------- CHAT FLOW (Gemini; no backend) ----------
  const pushOptional = async (payload) => {
    if (!messagesRef) return;
    try {
      await push(messagesRef, payload);
    } catch (e) {
      console.warn("RTDB push failed (non-fatal):", e);
    }
  };

  const handleSendMessage = useCallback(
    async (messageText) => {
      const text = (messageText || "").trim();
      if (!text) return;

      // Log user message (optional)
      await pushOptional({ sender: "user", text, timestamp: Date.now() });

      // Get Gemini reply
      let replyText =
        "I hear you. You’re not alone. Let’s take one small step—slow breath in, slow breath out.";
      try {
        replyText = await getMATTReplyGemini(text);
      } catch (e) {
        console.warn("Gemini failed; using fallback:", e?.message || e);
      }

      // Log assistant reply (optional)
      await pushOptional({
        sender: "M.A.T.T.",
        text: replyText,
        timestamp: Date.now(),
      });

      // Speak it
      speak(replyText);
    },
    [speak]
  );

  // ---------- SPEECH RECOGNITION ----------
  const createRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.continuous = false; // single utterance
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
      try {
        rec.stop();
      } catch {}
    };

    rec.onend = () => {
      setStatusText("Idle");
      setIsListening(false);
      // If we’re still supposed to listen, soft-restart after a tiny pause
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
      alert("Voice input isn’t supported in this browser. Try Chrome or Edge.");
      return;
    }
    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      /* already started */
    }
  }, [createRecognition]);

  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {}
    }
    setIsListening(false);
    setStatusText("Idle");
  }, []);

  // ---------- LIFECYCLE ----------
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(restartTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {}
      try {
        window.speechSynthesis?.cancel();
      } catch {}
    };
  }, []);

  // ---------- UI HANDLERS ----------
  const handleStartClick = async () => {
    // Prime TTS permission on first gesture (mobile)
    try {
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

      {/* Center */}
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
                <InputLabel sx={{ color: "rgba(255,255,255,0.9)" }}>
                  Voice
                </InputLabel>
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
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
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
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
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
