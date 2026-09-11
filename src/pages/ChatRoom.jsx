import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";

async function callChatGPT(prompt) {
  const res = await fetch("/api/matt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { throw new Error("The support service returned an invalid response."); }
  if (!res.ok) throw new Error(data?.error?.message || data?.error || `Support service unavailable (${res.status}).`);
  return { reply: data.reply || "I'm here with you.", sentiment: data.sentiment || "unknown" };
}

const pickBestVoice = (voices) => [...(voices || [])].sort((a, b) => {
  const score = (voice) => (/google|microsoft|natural|neural/i.test(voice.name) ? 3 : 0) + (/^en(-|_)?(US|GB|AU|CA|NZ)/i.test(voice.lang || "") ? 2 : 0);
  return score(b) - score(a);
})[0] || null;

export default function SponsorChat() {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState("Ready");
  const [lastHeard, setLastHeard] = useState("");
  const [manualText, setManualText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  const loadVoices = useCallback(() => {
    if (!window.speechSynthesis) return;
    const nextVoices = window.speechSynthesis.getVoices() || [];
    setVoices(nextVoices);
    if (!voiceName && nextVoices.length) setVoiceName(pickBestVoice(nextVoices)?.name || nextVoices[0].name);
  }, [voiceName]);

  useEffect(() => {
    if (!window.speechSynthesis) return undefined;
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [loadVoices]);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((item) => item.name === voiceName) || pickBestVoice(voices);
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    utterance.rate = rate;
    utterance.pitch = pitch;
    window.speechSynthesis.speak(utterance);
  }, [pitch, rate, voiceName, voices]);

  const respond = async (prompt) => {
    if (!prompt.trim()) return;
    setStatusText("Thinking…");
    try {
      const result = await callChatGPT(prompt);
      setSentiment(result.sentiment);
      setErrorText("");
      speak(result.reply);
    } catch (error) {
      setErrorText(error.message || "Support service unavailable.");
      setSentiment("unknown");
      speak("I’m here with you. Let’s take one small step together.");
    } finally { setStatusText("Ready"); }
  };

  const startListening = () => {
    setErrorText("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setErrorText("Speech recognition is not supported in this browser."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => { setIsListening(true); setStatusText("Listening…"); };
    recognition.onresult = async (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setLastHeard(transcript);
      await respond(transcript);
    };
    recognition.onerror = (event) => { setErrorText(`Microphone error: ${event?.error || "unknown"}`); setIsListening(false); setStatusText("Ready"); };
    recognition.onend = () => { setIsListening(false); if (statusText === "Listening…") setStatusText("Ready"); };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const sentimentColor = sentiment.toLowerCase().includes("high") ? "warning" : sentiment.toLowerCase().includes("low") ? "info" : "default";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <PsychologyRoundedIcon color="secondary" />
            <Typography variant="overline" color="secondary.dark" sx={{ fontWeight: 800, letterSpacing: ".12em" }}>RECOVERY SUPPORT</Typography>
          </Stack>
          <Typography variant="h3">M.A.T.T.</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 620 }}>My Anchor Through Turmoil — a calm place to pause, reflect, and take one next step.</Typography>
        </Box>

        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Status: ${statusText}`} color={statusText === "Ready" ? "success" : "primary"} variant="outlined" />
                {sentiment && <Chip label={`Sentiment: ${sentiment}`} color={sentimentColor} variant="outlined" />}
              </Stack>
              {errorText && <Alert severity="error">{errorText}</Alert>}
              <Box>
                <Typography variant="h6">Talk to M.A.T.T.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Use your microphone or type what is on your mind.</Typography>
              </Box>
              <Button variant="contained" color={isListening ? "error" : "primary"} startIcon={isListening ? <StopRoundedIcon /> : <MicRoundedIcon />} onClick={isListening ? () => recognitionRef.current?.stop() : startListening}>
                {isListening ? "Stop listening" : "Start talking"}
              </Button>
              <Divider><Typography variant="caption" color="text.secondary">OR TYPE INSTEAD</Typography></Divider>
              <TextField label="Message" multiline minRows={4} value={manualText} onChange={(event) => setManualText(event.target.value)} placeholder="Tell M.A.T.T. how you’re feeling right now…" />
              <Button variant="contained" color="secondary" endIcon={<SendRoundedIcon />} onClick={() => { respond(manualText); setManualText(""); }}>Send to M.A.T.T.</Button>
              {lastHeard && <Box sx={{ p: 2, borderRadius: 2, bgcolor: "primary.light" }}><Typography variant="caption" color="text.secondary">LAST THING YOU SAID</Typography><Typography sx={{ mt: .5 }}>{lastHeard}</Typography></Box>}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center"><VolumeUpRoundedIcon color="secondary" /><Typography variant="h6">Voice settings</Typography></Stack>
              <FormControl fullWidth><InputLabel id="matt-voice-label">Voice</InputLabel><Select labelId="matt-voice-label" label="Voice" value={voiceName} onChange={(event) => setVoiceName(event.target.value)}>{voices.map((voice) => <MenuItem key={voice.name} value={voice.name}>{voice.name} — {voice.lang}</MenuItem>)}</Select></FormControl>
              <Box><Typography variant="body2" color="text.secondary">Rate <strong>{rate.toFixed(2)}</strong></Typography><Slider value={rate} min={.7} max={1.3} step={.01} onChange={(_, value) => setRate(value)} /></Box>
              <Box><Typography variant="body2" color="text.secondary">Pitch <strong>{pitch.toFixed(2)}</strong></Typography><Slider value={pitch} min={.8} max={1.4} step={.01} onChange={(_, value) => setPitch(value)} /></Box>
              <Button variant="outlined" startIcon={<VolumeUpRoundedIcon />} onClick={() => speak("Hi, I’m M.A.T.T. This is my current voice.")}>Preview voice</Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
