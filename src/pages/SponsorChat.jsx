'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ======= Get API Key from .env =======
function getApiKey() {
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
}

// ======= Call ChatGPT WITH SENTIMENT =======
async function callChatGPT(prompt, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const system = [
    'You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.',
    'Reply in 1–3 short sentences. Be supportive, non-judgmental, practical.',
    'Suggest one gentle next step (drink water, text a friend, breathe).',
    'Avoid medical claims. If user sounds in crisis, suggest calling 988 in U.S. or local help.',
    'No emojis. Warm, grounded, concise.',
    'ALWAYS respond as a single JSON object with two keys: "reply" and "sentiment".',
    '"reply" is the message you speak to the user.',
    '"sentiment" is one of: "very low", "low", "neutral", "high", "very high" emotional distress.'
  ].join(' ');

  const body = {
    model: 'gpt-4.1-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `User said: "${prompt}"` }
    ],
    temperature: 0.7,
    max_tokens: 200
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }

  const content = data?.choices?.[0]?.message?.content || '';

  // Should already be JSON, but just in case:
  try {
    const parsed = JSON.parse(content);
    return {
      reply: parsed.reply || '',
      sentiment: parsed.sentiment || 'unknown'
    };
  } catch {
    // fallback if model ever sends plain text
    return { reply: content.trim(), sentiment: 'unknown' };
  }
}

// ======= Pick Best Voice =======
function pickBestVoice(list) {
  if (!list?.length) return null;

  const isEn = (v) => /^en(-|_)?(US|GB|AU|CA|NZ)/i.test(v.lang || '');
  const score = (v) => {
    let s = 0;
    if (/google|microsoft|natural|neural/i.test(v.name)) s += 3;
    if (isEn(v)) s += 2;
    return s;
  };

  return [...list].sort((a, b) => score(b) - score(a))[0] || list[0];
}

function SponsorChat() {
  const API_KEY = getApiKey();
  const recognitionRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('Idle');
  const [lastHeard, setLastHeard] = useState('');
  const [errorText, setErrorText] = useState('');
  const [manualText, setManualText] = useState('');
  const [sentiment, setSentiment] = useState('');

  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  // Load Voices
  const loadVoices = useCallback(() => {
    if (!window.speechSynthesis) return;
    const v = window.speechSynthesis.getVoices() || [];
    setVoices(v);
    if (!voiceName && v.length) {
      const best = pickBestVoice(v);
      setVoiceName(best?.name || v[0].name);
    }
  }, [voiceName]);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

  const selectedVoice = useCallback(() => {
    return voices.find((v) => v.name === voiceName) || pickBestVoice(voices);
  }, [voiceName, voices]);

  // Speak
  const speak = useCallback(
    (text) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = selectedVoice();
      if (v) u.voice = v;
      u.lang = v?.lang || 'en-US';
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    },
    [selectedVoice, rate, pitch]
  );

  // Speech Recognition
  function createRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorText('Speech recognition not supported.');
      return null;
    }

    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setStatusText('Listening…');
    rec.onresult = async (e) => {
      const transcript = e?.results?.[0]?.[0]?.transcript || '';
      setLastHeard(transcript);
      setStatusText('Thinking…');

      try {
        if (!API_KEY) throw new Error('Missing API key. Set NEXT_PUBLIC_OPENAI_API_KEY.');
        const { reply, sentiment } = await callChatGPT(transcript, API_KEY);
        setSentiment(sentiment);
        speak(reply || "I'm here for you.");
      } catch (err) {
        setErrorText(err.message);
        setSentiment('unknown');
        speak("I’m here with you. Let’s take one small step together.");
      } finally {
        setStatusText('Idle');
      }
    };

    rec.onerror = (e) => {
      setErrorText(`Mic error: ${e?.error || 'unknown'}`);
      setIsListening(false);
      setStatusText('Idle');
    };

    rec.onend = () => {
      setIsListening(false);
      setStatusText('Idle');
    };

    return rec;
  }

  const startListening = () => {
    setErrorText('');
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis?.speak(u);
    } catch {}
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

  // Manual text input fallback
  const sendManual = async () => {
    if (!manualText.trim()) return;
    setStatusText('Thinking…');

    try {
      if (!API_KEY) throw new Error('Missing API key. Set NEXT_PUBLIC_OPENAI_API_KEY.');
      const { reply, sentiment } = await callChatGPT(manualText, API_KEY);
      setSentiment(sentiment);
      speak(reply || "I'm here for you.");
    } catch (err) {
      setErrorText(err.message);
      setSentiment('unknown');
      speak("I’m here with you. Let’s take one small step together.");
    } finally {
      setStatusText('Idle');
    }
  };

  return (
    <div style={{ padding: 20, background: 'black', color: 'white', minHeight: '100vh' }}>
      <h2>M.A.T.T. — My Anchor Through Turmoil</h2>

      <div><strong>Status:</strong> {statusText}</div>
      {sentiment && <div><strong>Sentiment:</strong> {sentiment}</div>}
      {errorText && <div style={{ color: 'red' }}>Error: {errorText}</div>}

      <div style={{ marginTop: 10 }}>
        Voice:&nbsp;
        <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)}>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} — {v.lang}
            </option>
          ))}
        </select>
        &nbsp; Rate:
        <input
          type="range"
          min="0.7"
          max="1.3"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
        />
        &nbsp; Pitch:
        <input
          type="range"
          min="0.8"
          max="1.4"
          step="0.01"
          value={pitch}
          onChange={(e) => setPitch(parseFloat(e.target.value))}
        />
        <button onClick={() => speak("Hi, I’m M.A.T.T. This is my current voice.")}>
          Preview Voice
        </button>
      </div>

      {!isListening ? (
        <button
          onClick={startListening}
          style={{ background: 'green', color: 'white', padding: '10px', marginTop: '10px' }}
        >
          Start Talking
        </button>
      ) : (
        <button
          onClick={stopListening}
          style={{ background: 'red', color: 'white', padding: '10px', marginTop: '10px' }}
        >
          Stop
        </button>
      )}

      <div style={{ marginTop: 14 }}>
        <input
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Type here to test ChatGPT..."
          style={{ width: '80%', padding: 8 }}
        />
        <button
          onClick={sendManual}
          style={{ padding: 8, background: '#0a84ff', color: 'white' }}
        >
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

export default SponsorChat;
