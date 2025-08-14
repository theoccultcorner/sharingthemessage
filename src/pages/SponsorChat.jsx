// app/matt/SponsorChat.jsx (or components/SponsorChat.jsx)
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ===== Gemini REST call =====
async function callGemini(prompt, apiKey) {
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
    encodeURIComponent(apiKey);

  const system = [
    'You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.',
    'Reply in 1–3 short sentences. Be supportive, non-judgmental, practical.',
    'Suggest one gentle next step (e.g., drink water, text a friend/sponsor, step outside, breathe).',
    'Avoid medical/clinical claims. If the user sounds in crisis, gently suggest 988 in the U.S. or local help.',
    'No emojis. Warm, grounded, concise.',
  ].join(' ');

  const body = {
    contents: [
      { role: 'user', parts: [{ text: system }] },
      { role: 'user', parts: [{ text: `User said: "${prompt}"\nRespond as M.A.T.T. now (1–3 short sentences).` }] },
    ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 160 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Gemini error: ${msg}`);
  }

  const txt =
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join(' ') ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    '';
  return (txt || '').trim();
}

// ===== Voice helpers =====
function pickBestVoice(list) {
  if (!list?.length) return null;
  const isEn = (v) => /^en(-|_)?(US|GB|AU|CA|NZ)/i.test(v.lang || '');
  const score = (v) => {
    let s = 0;
    if (/google|microsoft|natural|neural/i.test(v.name)) s += 3;
    if (isEn(v)) s += 2;
    if (/female|male/i.test(v.name)) s += 1;
    return s;
  };
  return [...list].sort((a, b) => score(b) - score(a))[0] || list[0];
}

export default function SponsorChat({ apiKey = '' }) {
  // Accept key via prop (server-inlined). Fallback to window for manual hotfix.
  const API_KEY = apiKey || (typeof window !== 'undefined' && window.NEXT_PUBLIC_GEMINI_API_KEY) || '';

  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('Idle');
  const [lastHeard, setLastHeard] = useState('');
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [errorText, setErrorText] = useState('');
  const [manualText, setManualText] = useState('');

  // Show masked status so you can confirm the key is actually present
  const keyDetected = Boolean(API_KEY);
  const maskedKey = keyDetected ? `${API_KEY.slice(0, 6)}…${API_KEY.slice(-4)}` : '—';

  // Voices
  const loadVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const v = window.speechSynthesis.getVoices() || [];
    setVoices(v);
    if (!voiceName && v.length) {
      const best = pickBestVoice(v);
      setVoiceName(best?.name || v[0].name);
    }
  }, [voiceName]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    loadVoices();
    const handler = () => loadVoices();
    window.speechSynthesis.onvoiceschanged = handler;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [loadVoices]);

  const selectedVoice = useCallback(() => {
    return voices.find((v) => v.name === voiceName) || pickBestVoice(voices);
  }, [voiceName, voices]);

  // TTS
  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = selectedVoice();
      if (v) u.voice = v;
      u.lang = v?.lang || 'en-US';
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  }, [selectedVoice, rate, pitch]);

  // Speech Recognition
  function createRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorText('Speech recognition not supported in this browser. Try Chrome/Edge desktop.');
      return null;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setStatusText('Listening…');
    rec.onresult = async (e) => {
      const transcript = e?.results?.[0]?.[0]?.transcript || '';
      const clean = transcript.trim();
      setLastHeard(clean);
      setStatusText('Thinking…');
      try {
        if (!API_KEY) throw new Error('Missing API key in client. Ensure NEXT_PUBLIC_GEMINI_API_KEY is set and passed.');
        const reply = await callGemini(clean, API_KEY);
        speak(reply || "I hear you. You’re not alone. Slow breath in, slow breath out.");
        setErrorText('');
      } catch (err) {
        console.error(err);
        setErrorText(err?.message || 'Gemini failed.');
        speak("I’m here with you. Let’s take one small, steady step together.");
      } finally {
        setStatusText('Idle');
      }
    };
    rec.onend = () => { setIsListening(false); setStatusText('Idle'); };
    rec.onerror = (e) => {
      console.warn('SR error:', e?.error || e);
      setErrorText(`Mic error: ${e?.error || 'unknown'}`);
      setIsListening(false);
      setStatusText('Idle');
    };
    return rec;
  }

  const startListening = async () => {
    setErrorText('');
    // Prime TTS permission (mobile)
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis?.speak(u); } catch {}
    const rec = createRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    setIsListening(true);
    try { rec.start(); } catch (e) { setErrorText('Could not start microphone. Check HTTPS and permissions.'); setIsListening(false); }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatusText('Idle');
  };

  // Manual text fallback
  const sendManual = async () => {
    const input = (manualText || '').trim();
    if (!input) return;
    setStatusText('Thinking…');
    try {
      if (!API_KEY) throw new Error('Missing API key in client. Ensure NEXT_PUBLIC_GEMINI_API_KEY is set and passed.');
      const reply = await callGemini(input, API_KEY);
      speak(reply || "I hear you. You’re not alone. Slow breath in, slow breath out.");
      setErrorText('');
    } catch (err) {
      console.error(err);
      setErrorText(err?.message || 'Gemini failed.');
      speak("I’m here with you. Let’s take one small, steady step together.");
    } finally {
      setStatusText('Idle');
    }
  };

  return (
    <div style={{ padding: 20, background: 'black', color: 'white', minHeight: '100vh' }}>
      <h2 style={{ marginTop: 0 }}>M.A.T.T. — My Anchor Through Turmoil</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <strong>Status:</strong> {statusText}
        <span
          title={keyDetected ? `Key detected: ${maskedKey}` : 'No key detected'}
          style={{
            marginLeft: 8, padding: '2px 8px', borderRadius: 12, border: '1px solid #444',
            background: keyDetected ? '#103a1b' : '#3a1010', color: keyDetected ? '#79ffa1' : '#ff8a8a', fontSize: 12
          }}
        >
          {keyDetected ? 'Key detected' : 'No key detected'}
        </span>
      </div>

      {errorText && (
        <div style={{ marginBottom: 12, padding: 10, background: '#330', border: '1px solid #a33', borderRadius: 6 }}>
          <strong>Problem:</strong> {errorText}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          Voice:&nbsp;
          <select
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            style={{ padding: 6, background: '#111', color: 'white', borderRadius: 6 }}
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} — {v.lang}
              </option>
            ))}
          </select>
        </label>

        <label>
          Rate:&nbsp;
          <input type="range" min="0.7" max="1.3" step="0.01" value={rate}
                 onChange={(e) => setRate(parseFloat(e.target.value))}/>
          &nbsp;{rate.toFixed(2)}
        </label>

        <label>
          Pitch:&nbsp;
          <input type="range" min="0.8" max="1.4" step="0.01" value={pitch}
                 onChange={(e) => setPitch(parseFloat(e.target.value))}/>
          &nbsp;{pitch.toFixed(2)}
        </label>

        <button
          onClick={() => speak("Hi, I’m M.A.T.T. This is my current voice.")}
          style={{ padding: '8px 12px', background: '#222', color: 'white', borderRadius: 6, border: '1px solid #444' }}
        >
          Preview Voice
        </button>
      </div>

      {!isListening ? (
        <button onClick={startListening}
                style={{ padding: '10px 16px', background: 'green', color: 'white', borderRadius: 8, border: 'none', marginRight: 8 }}>
          Start Talking
        </button>
      ) : (
        <button onClick={stopListening}
                style={{ padding: '10px 16px', background: 'crimson', color: 'white', borderRadius: 8, border: 'none', marginRight: 8 }}>
          Stop
        </button>
      )}

      {/* Manual input fallback */}
      <div style={{ marginTop: 14 }}>
        <input
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Type here to test Gemini (no mic needed)…"
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', background: '#111', color: 'white' }}
        />
        <button onClick={sendManual}
                style={{ marginTop: 8, padding: '8px 12px', background: '#0a84ff', color: 'white', borderRadius: 6, border: 'none' }}>
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
