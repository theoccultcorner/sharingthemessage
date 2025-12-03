'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ======= Get API Key from .env =======
function getApiKey() {
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
}

// ======= Call ChatGPT =======
async function callChatGPT(prompt, apiKey) {
  const url = "https://api.openai.com/v1/chat/completions";

  const system = [
    "You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.",
    "Reply in 1–3 short sentences. Be supportive, non-judgmental, practical.",
    "Suggest one gentle next step (drink water, text a friend, breathe).",
    "Avoid medical claims. If user sounds in crisis, suggest calling 988 in U.S. or local help.",
    "No emojis. Warm, grounded, concise."
  ].join(" ");

  const body = {
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: `User said: "${prompt}"` }
    ],
    temperature: 0.7,
    max_tokens: 160
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

// ======= Pick Best Voice =======
function pickBestVoice(list) {
  if (!list?.length) return null;

  const isEn = (v) => /^en(-|_)?(US|GB|AU|CA|NZ)/i.test(v.lang || "");
  const score = (v) => {
    let s = 0;
    if (/google|microsoft|natural|neural/i.test(v.name)) s += 3;
    if (isEn(v)) s += 2;
    return s;
  };

  return [...list].sort((a, b) => score(b) - score(a))[0] || list[0];
}

export default function SponsorChat() {
  const API_KEY = getApiKey();
  const recognitionRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('Idle');
  const [lastHeard, setLastHeard] = useState('');
  const [errorText, setErrorText] = useState('');
  const [manualText, setManualText] = useState('');

  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  // Load Voices
  const loadVoices = useCallback(() => {
    const v = window.speechSynthesis.getVoices() || [];
    setVoices(v);
    if (!voiceName && v.length) {
      const best = pickBestVoice(v);
      setVoiceName(best?.name || v[0].name);
    }
  }, [voiceName]);

  useEffect(() => {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => window.speechSynthesis.onvoiceschanged = null;
  }, [loadVoices]);

  const selectedVoice = useCallback(() => {
    return voices.find((v) => v.name === voiceName) || pickBestVoice(voices);
  }, [voiceName, voices]);

  // Speak
  const speak = useCallback((text) => {
    const u = new SpeechSynthesisUtterance(text);
    const v = selectedVoice();
    if (v) u.voice = v;
    u.lang = v?.lang || "en-US";
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }, [selectedVoice, rate, pitch]);

  // Speech Recognition
  function createRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorText("Speech recognition not supported.");
      return null;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;

    rec.onstart = () => setStatusText("Listening…");
    rec.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      setLastHeard(transcript);
      setStatusText("Thinking…");

      try {
        if (!API_KEY) throw new Error("Missing API key.");
        const reply = await callChatGPT(transcript, API_KEY);
        speak(reply);
      } catch (err) {
        setErrorText(err.message);
        speak("I’m here with you. Let’s take one small step together.");
      }

      setStatusText("Idle");
    };

    rec.onerror = (e) => {
      setErrorText(e.error || "Mic error");
      setIsListening(false);
      setStatusText("Idle");
    };

    rec.onend = () => {
      setIsListening(false);
      setStatusText("Idle");
    };

    return rec;
  }

  const startListening = () => {
    const rec = createRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    setIsListening(true);
    rec.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Manual text input
  const sendManual = async () => {
    if (!manualText.trim()) return;
    setStatusText("Thinking…");

    try {
      if (!API_KEY) throw new Error("Missing API key.");
      const reply = await callChatGPT(manualText, API_KEY);
      speak(reply);
    } catch (err) {
      setErrorText(err.message);
      speak("I’m here with you. Let’s take one small step together.");
    }

    setStatusText("Idle");
  };

  return (
    <div style={{ padding: 20, background: "black", color: "white", minHeight: "100vh" }}>
      <h2>M.A.T.T. — My Anchor Through Turmoil</h2>

      <div><strong>Status:</strong> {statusText}</div>
      {errorText && <div style={{ color: "red" }}>Error: {errorText}</div>}

      <div style={{ marginTop: 10 }}>
        Voice:&nbsp;
        <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)}>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>{v.name} — {v.lang}</option>
          ))}
        </select>

        &nbsp; Rate:
        <input type="range" min="0.7" max="1.3" step="0.01"
          value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />

        &nbsp; Pitch:
        <input type="range" min="0.8" max="1.4" step="0.01"
          value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} />

        <button onClick={() => speak("Hi, I’m M.A.T.T. This is my current voice.")}>
          Preview Voice
        </button>
      </div>

      {!isListening ? (
        <button onClick={startListening}
          style={{ background: "green", color: "white", padding: 10, marginTop: 10 }}>
          Start Talking
        </button>
      ) : (
        <button onClick={stopListening}
          style={{ background: "red", color: "white", padding: 10, marginTop: 10 }}>
          Stop
        </button>
      )}

      <div style={{ marginTop: 14 }}>
        <input
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Type here to test ChatGPT..."
          style={{ width: "80%", padding: 8 }}
        />
        <button onClick={sendManual}
          style={{ padding: 8, background: "#0a84ff", color: "white" }}>
          Send
        </button>
      </div>

      {lastHeard && (
        <div style={{ marginTop: 16 }}>
          <strong>You said:</strong> {lastHeard}
        </div>
      )}
    </div>
  );
}
