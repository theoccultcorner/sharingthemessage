// === FRONTEND ONLY: SponsorChat.jsx ===
// Strictly Gemini (no backend, no Firebase). Realistic browser TTS voice.
// Works in Chrome/Edge. Safari iOS supports TTS; speech recognition varies.

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box, Typography, Container, useMediaQuery, Button, Stack, Chip, Paper,
  FormControl, InputLabel, Select, MenuItem, Slider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

// Gemini browser SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------- CONFIG / UTILS ----------------------
const LS_KEYS = { voice: "mattVoiceName", rate: "mattVoiceRate", pitch: "mattVoicePitch" };

function getApiKey() {
  // Prefer window var for reliability; fall back to common env forms.
  const key =
    (typeof window !== "undefined" && window.GEMINI_API_KEY) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof process !== "undefined" && (process.env?.REACT_APP_GEMINI_API_KEY || process.env?.GEMINI_API_KEY));

  if (!key) throw new Error("GEMINI_API_KEY is missing. Set window.GEMINI_API_KEY or VITE_GEMINI_API_KEY or REACT_APP_GEMINI_API_KEY.");
  return key;
}

let geminiClient = null;
function getGemini() {
  if (!geminiClient) geminiClient = new GoogleGenerativeAI(getApiKey());
  return geminiClient;
}

// More-compatible prompt call (plain string = fewer SDK shape issues)
async function geminiReply(userText) {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const system = [
    "You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.",
    "Reply in 1–3 short sentences. Be supportive, non-judgmental, practical.",
    "Suggest one gentle next step (e.g., drink water, text a friend/sponsor, step outside, breathe).",
    "Avoid medical/clinical claims. If the user sounds in crisis, gently suggest 988 in the U.S. or local help.",
    "No emojis. Warm, grounded, concise."
  ].join(" ");

  const prompt = `${system}\n\nUser said: "${userText}"\nRespond as M.A.T.T. now (1–3 short sentences).`;

  const res = await model.generateContent(prompt);
  const out =
    (typeof res?.response?.text === "function" && res.response.text()) ||
    res?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "";
  return (out || "").trim() ||
    "I hear you. You’re not alone. Slow breath in, slow breath out. What’s one small, healthy step you can take right now?";
}

// Pick a solid voice automatically (Google/Microsoft/Natural/Neural + English)
function pickBestVoice(voices) {
  if (!voices?.length) return null;
  const en = (v) => /^en(-|_)?(US|GB|AU|CA|NZ)/i.test(v.lang || "");
  const score = (v) => {
    let s = 0;
    if (/google|microsoft|natural|neural/i.test(v.name)) s += 3;
    if (en(v)) s += 2;
    if (/female|male/i.test(v.name)) s += 1;
    return s;
  };
  return [...voices].sort((a, b) => score(b) - score(a))[0] || voices[0];
}

// ---------------------- COMPONENT ----------------------
const SponsorChat = () => {
  // Speech recog state/refs
  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const keepListeningRef = useRef(false); // explicit “autoloop” flag, avoids stale state
  const mountedRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [statusText, setStatusText] = useState("Idle");

  // Voice controls
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState(localStorage.getItem(LS_KEYS.voice) || "");
  const [rate, setRate] = useState(Number(localStorage.getItem(LS_KEYS.rate)) || 1);
  const [pitch, setPitch] = useState(Number(localStorage.getItem(LS_KEYS.pitch)) || 1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ---------- VOICE MGMT ----------
  const loadVoices = useCallback(() => {
    if (!("speechSynthesis" in window)) return [];
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
    if (!("speechSynthesis" in window)) return;
    loadVoices();
    const onChange = () => loadVoices();
    window.speechSynthesis.onvoiceschanged = onChange;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [loadVoices]);

  const getSelectedVoice = useCallback(() => {
    if (!("speechSynthesis" in window)) return null;
    const list = window.speechSynthesis.getVoices() || voices;
    return list.find((v) => v.name === voiceName) || pickBestVoice(list);
  }, [voiceName, voices]);

  // ---------- TTS ----------
  const speak = useCallback((text) => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = getSelectedVoice();
      if (v) u.voice = v;
      u.lang = v?.lang || "en-US";
      u.rate = rate;   // 0.1–10
      u.pitch = pitch; // 0–2
      u.volume = 1;

      u.onend = () => {
        // After speaking, if autoloop enabled, restart mic
        if (mountedRef.current && keepListeningRef.current) safeStartRecognition();
      };
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  }, [getSelectedVoice, rate, pitch]);

  // ---------- GEMINI FLOW ----------
  const handleTurn = useCallback(async (userText) => {
    // Get Gemini reply; speak it
    let reply = "";
    try {
      reply = await geminiReply(userText);
    } catch (e) {
      console.warn("Gemini error:", e);
      reply = "I’m here with you. Let’s breathe together for a few seconds. What small step feels doable?";
    }
    speak(reply);
  }, [speak]);

  // ---------- SPEECH RECOGNITION ----------
  const createRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.continuous = false;      // single utterance
    rec.interimResults = false;  // only final
    rec.lang = "en-US";

    rec.onstart = () => { setStatusText("Listening…"); setIsListening(true); };
    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const transcript = last && last[0] ? last[0].transcript : "";
      const clean = (transcript || "").trim();
      if (clean) {
        setLastHeard(clean);
        // Immediately process with Gemini
        handleTurn(clean);
      }
    };
    rec.onspeechend = () => { try { rec.stop(); } catch {} };
    rec.onend = () => {
      setStatusText("Idle");
      setIsListening(false);
      // If user wants autoloop, rec will restart after TTS (see speak.onend)
      // or, if TTS already ended, softly restart here as a backup
      if (mountedRef.current && keepListeningRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => safeStartRecognition(), 350);
      }
    };
    rec.onerror = (e) => {
      console.warn("SpeechRecognition error:", e?.error || e);
      setStatusText(`Mic error: ${e?.error || "unknown"}`);
      setIsListening(false);
      if (mountedRef.current && keepListeningRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => safeStartRecognition(), 1000);
      }
    };

    return rec;
  }, [handleTurn]);

  const safeStartRecognition = useCallback(() => {
    const rec = recognitionRef.current || createRecognition();
    if (!rec) { alert("Voice input isn’t supported in this browser. Try Chrome/Edge."); return; }
    recognitionRef.current = rec;
    try { rec.start(); } catch { /* already started */ }
  }, [createRecognition]);

  const stopRecognition = useCallback(() => {
    keepListeningRef.current = false;
    const rec = recognitionRef.current;
    if (rec) { try { rec.stop(); } catch {} }
    setIsListening(false);
    setStatusText("Idle");
  }, []);

  // ---------- LIFECYCLE ----------
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(restartTimerRef.current);
      try { recognitionRef.current?.stop(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  // ---------- UI HANDLERS ----------
  const handleStart = async () => {
    // Prime TTS permission on first gesture (mobile)
    try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; window.speechSynthesis?.speak(u); } catch {}
    keepListeningRef.current = true;
    safeStartRecognition();
  };

  const handleStop = () => stopRecognition();
  const handlePreview = () => speak("Hi, I’m M.A.T.T. This is my current voice.");
  const handleVoiceChange = (e) => { const v = e.target.value; setVoiceName(v); localStorage.setItem(LS_KEYS.voice, v); };
  const handleRateChange = (_, val) => { setRate(val); localStorage.setItem(LS_KEYS.rate, String(val)); };
  const handlePitchChange = (_, val) => { setPitch(val); localStorage.setItem(LS_KEYS.pitch, String(val)); };

  // ---------------------- UI ----------------------
  return (
    <Container maxWidth={false} disableGutters
      sx={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", backgroundColor: "black" }}>
      {/* Header */}
      <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", textAlign: "center", zIndex: 10, p: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <Typography variant={isMobile ? "h6" : "h4"} sx={{ color: "white", textShadow: "1px 1px 3px black" }}>
          M.A.T.T. – My Anchor Through Turmoil
        </Typography>
      </Box>

      {/* Center */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", px: 2 }}>
        <Stack spacing={3} alignItems="center" sx={{ width: "min(800px, 92vw)" }}>
          <Chip label={statusText} color={isListening ? "success" : "default"} variant="filled" sx={{ color: "white" }} />
          <Typography variant="body1" sx={{ color: "white", textAlign: "center", fontSize: isMobile ? "1rem" : "1.25rem" }}>
            {isListening ? "Listening… Speak to M.A.T.T." : "Tap Start to speak to M.A.T.T."}
          </Typography>

          {/* Voice controls */}
          <Paper elevation={3}
            sx={{ p: 2, width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: "rgba(255,255,255,0.9)" }}>Voice</InputLabel>
                <Select value={voiceName} label="Voice" onChange={handleVoiceChange} sx={{ color: "white" }}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}>
                  {voices.map((v) => (
                    <MenuItem key={v.name} value={v.name}>{v.name} — {v.lang}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>Rate ({rate.toFixed(2)})</Typography>
                <Slider min={0.7} max={1.3} step={0.01} value={rate} onChange={handleRateChange} />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>Pitch ({pitch.toFixed(2)})</Typography>
                <Slider min={0.8} max={1.4} step={0.01} value={pitch} onChange={handlePitchChange} />
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button onClick={handlePreview} variant="outlined" startIcon={<VolumeUpIcon />}
                        sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
                  Preview Voice
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Start/Stop */}
          <Stack direction="row" spacing={2}>
            {!isListening ? (
              <Button onClick={handleStart} variant="contained" color="success" startIcon={<KeyboardVoiceIcon />}>Start</Button>
            ) : (
              <Button onClick={handleStop} variant="contained" color="error" startIcon={<StopCircleIcon />}>Stop</Button>
            )}
          </Stack>

          {lastHeard ? (
            <Paper elevation={3}
              sx={{ mt: 1, p: 2, width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.8)" }}>Last heard</Typography>
              <Typography variant="body1" sx={{ color: "white", wordBreak: "break-word" }}>{lastHeard}</Typography>
            </Paper>
          ) : null}
        </Stack>
      </Box>
    </Container>
  );
};

export default SponsorChat;
