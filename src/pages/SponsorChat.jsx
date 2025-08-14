import React, { useState, useEffect, useRef, useCallback } from "react";

async function callGemini(prompt, apiKey) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    encodeURIComponent(apiKey);

  const system = [
    "You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.",
    "Reply in 1–3 short sentences. Be supportive, non-judgmental, practical.",
    "Suggest one gentle next step (e.g., drink water, text a friend/sponsor, step outside, breathe).",
    "Avoid medical/clinical claims. If the user sounds in crisis, gently suggest 988 in the U.S. or local help.",
    "No emojis. Warm, grounded, concise.",
  ].join(" ");

  const body = {
    contents: [
      { role: "user", parts: [{ text: system }] },
      {
        role: "user",
        parts: [
          {
            text: `User said: "${prompt}"\nRespond as M.A.T.T. now (1–3 short sentences).`,
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 160 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=UTF-8" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }
  const txt =
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text).join(" ") ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "";
  return (txt || "").trim();
}

function pickBestVoice(list) {
  if (!list?.length) return null;
  const isEn = (v) => /^en(-|_)?(US|GB|AU|CA|NZ)/i.test(v.lang || "");
  const score = (v) => {
    let s = 0;
    if (/google|microsoft|natural|neural/i.test(v.name)) s += 3;
    if (isEn(v)) s += 2;
    if (/female|male/i.test(v.name)) s += 1;
    return s;
  };
  return [...list].sort((a, b) => score(b) - score(a))[0] || list[0];
}

export default function SponsorChat() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState("Idle");
  const [lastHeard, setLastHeard] = useState("");
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [errorText, setErrorText] = useState("");
  const [manualText, setManualText] = useState("");

  // Load voices
  const loadVoices = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    const v = window.speechSynthesis.getVoices() || [];
    setVoices(v);
    if (!voiceName && v.length) {
      const best = pickBestVoice(v);
      setVoiceName(best?.name || v[0].name);
    }
  }, [voiceName]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    loadVoices();
    const handler = () => loadVoices();
    window.speechSynthesis.onvoiceschanged = handler;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

  const selectedVoice = useCallback(() => {
    return voices.find((v) => v.name === voiceName) || pickBestVoice(voices);
  }, [voiceName, voices]);

  const speak = useCallback(
    (text) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = selectedVoice();
      if (v) u.voice = v;
      u.lang = v?.lang || "en-US";
      u.rate = rate;
      u.pitch = pitch;
      window.speechSynthesis.speak(u);
    },
    [selectedVoice, rate, pitch]
  );

  function createRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorText(
        "Speech recognition not supported. Try Chrome or Edge on desktop."
      );
      return null;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setStatusText("Listening…");
    rec.onresult = async (e) => {
      const transcript = e?.results?.[0]?.[0]?.transcript || "";
      const clean = transcript.trim();
      setLastHeard(clean);
      setStatusText("Thinking…");
      try {
        if (!API_KEY) throw new Error("Missing API key");
        const reply = await callGemini(clean, API_KEY);
        speak(reply);
        setErrorText("");
      } catch (err) {
        setErrorText(err.message);
        speak("I’m here with you. Let’s take one small step together.");
      } finally {
        setStatusText("Idle");
      }
    };
    rec.onend = () => {
      setIsListening(false);
      setStatusText("Idle");
    };
    rec.onerror = (e) => {
      setErrorText(`Mic error: ${e?.error || "unknown"}`);
      setIsListening(false);
      setStatusText("Idle");
    };
    return rec;
  }

  const startListening = () => {
    setErrorText("");
    try {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis?.speak(u);
    } catch {}
    const rec = createRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    setIsListening(true);
    try {
      rec.start();
    } catch {
      setErrorText("Could not start microphone.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatusText("Idle");
  };

  const sendManual = async () => {
    const input = manualText.trim();
    if (!input) return;
    setStatusText("Thinking…");
    try {
      if (!API_KEY) throw new Error("Missing API key");
      const reply = await callGemini(input, API_KEY);
      speak(reply);
      setErrorText("");
    } catch (err) {
      setErrorText(err.message);
      speak("I’m here with you. Let’s take one small step together.");
    } finally {
      setStatusText("Idle");
    }
  };

  return (
    <div style={{ padding: 20, background: "black", color: "white" }}>
      <h2>M.A.T.T. — My Anchor Through Turmoil</h2>
      <div>Status: {statusText}</div>
      {errorText && (
        <div style={{ color: "red", margin: "8px 0" }}>Error: {errorText}</div>
      )}

      <label>
        Voice:&nbsp;
        <select
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
        >
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} — {v.lang}
            </option>
          ))}
        </select>
      </label>

      {!isListening ? (
        <button onClick={startListening}>Start Talking</button>
      ) : (
        <button onClick={stopListening}>Stop</button>
      )}

      <div style={{ marginTop: 10 }}>
        <input
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Type to test..."
        />
        <button onClick={sendManual}>Send</button>
      </div>

      {lastHeard && (
        <div style={{ marginTop: 10 }}>
          <strong>You said:</strong> {lastHeard}
        </div>
      )}
    </div>
  );
}
