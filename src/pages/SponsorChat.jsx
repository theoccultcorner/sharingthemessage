'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================
//   LOAD API KEY FROM ENV
// ==========================
function getApiKey() {
  // Vercel: NEXT_PUBLIC_OPENAI_API_KEY is set in dashboard
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
}

// ==========================
//   CALL CHATGPT (NO JSON MODE, JUST PROMPTED JSON)
// ==========================
async function callChatGPT(prompt, apiKey) {
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_OPENAI_API_KEY in environment.');
  }

  const url = 'https://api.openai.com/v1/chat/completions';

  const system = [
    'You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.',
    'Reply in 1–3 short sentences. Be supportive, non-judgmental, practical.',
    'Suggest one gentle next step (drink water, text a friend, breathe).',
    'Avoid medical claims. If user sounds in crisis, suggest calling 988 in U.S. or local help.',
    'No emojis. Warm, grounded, concise.',
    'Always respond ONLY as a JSON object with two keys: "reply" and "sentiment".',
    '"reply" is the short supportive message.',
    '"sentiment" is one of: "very low", "low", "neutral", "high", or "very high" emotional distress.',
    'Example: {"reply":"I’m here with you.","sentiment":"high"}'
  ].join(' ');

  const body = {
    model: 'gpt-4.1-mini',
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

  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`OpenAI raw response (not JSON): ${text || '[empty]'}`);
  }

  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI HTTP ${res.status}`);
  }

  const content = data?.choices?.[0]?.message?.content || '';

  try {
    const parsed = JSON.parse(content);
    return {
      reply: parsed.reply || '',
      sentiment: parsed.sentiment || 'unknown'
    };
  } catch {
    // If it didn't obey JSON strictly, just speak the content
    return { reply: content.trim(), sentiment: 'unknown' };
  }
}

// ==========================
//   PICK BEST VOICE
// ==========================
function pickBestVoice(list) {
  if (!list || !list.length) return null;

  const isEn = (v) => /^en(-|_)?(US|GB|AU|CA|NZ)/i.test(v.lang || '');
  const score = (v) => {
    let s = 0;
    if (/google|microsoft|natural|neural/i.test(v.name)) s += 3;
    if (isEn(v)) s += 2;
    return s;
  };

  return [...list].sort((a, b) => score(b) - score(a))[0] || list[0];
}

// ==========================
//   MAIN COMPONENT
// ==========================
function SponsorChat() {
  const API_KEY = getApiKey();
  const recognitionRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('Idle');
  const [lastHeard, setLastHeard] = useState('');
  const [manualText, setManualText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [sentiment, setSentiment] = useState('');

  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  // ==========================
  //   LOAD VOICES
  // ==========================
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

  // ==========================
  //   SPEAK
  // ==========================
  const speak = useCallback(
    (text) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = selectedVoice();
      if (v) u.voice = v;
      u.lang = (v && v.lang) || 'en-US';
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    },
    [selectedVoice, rate, pitch]
  );

  // ==========================
  //   SPEECH RECOGNITION
  // ==========================
  function createRecognition() {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorText('Speech recognition not supported in this browser.');
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
        const { reply, sentiment } = await callChatGPT(transcript, API_KEY);
        setSentiment(sentiment);
        setErrorText('');
        speak(reply || "I'm here for you.");
      } catch (err) {
        setErrorText(String(err.message || err));
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

  // ==========================
  //   MANUAL TEXT
  // ==========================
  const sendManual = async () => {
    if (!manualText.trim()) return;
    setStatusText('Thinking…');

    try {
      const { reply, sentiment } = await callChatGPT(manualText, API_KEY);
      setSentiment(sentiment);
      setErrorText('');
      speak(reply || "I'm here for you.");
    } catch (err) {
      setErrorText(String(err.message || err));
      setSentiment('unknown');
      speak("I’m here with you. Let’s take one small step together.");
    } finally {
      setStatusText('Idle');
    }
  };

  // ==========================
  //   SENTIMENT BADGE CLASS
  // ==========================
  const sentimentClass = (() => {
    const s = (sentiment || '').toLowerCase();
    if (s.includes('very high')) return 'sentiment-badge danger';
    if (s.includes('high')) return 'sentiment-badge warning';
    if (s.includes('low')) return 'sentiment-badge low';
    if (s.includes('neutral')) return 'sentiment-badge neutral';
    return 'sentiment-badge unknown';
  })();

  // ==========================
  //   UI
  // ==========================
  return (
    <>
      <div className="matt-root">
        <div className="matt-shell">
          <header className="matt-header">
            <h1>M.A.T.T.</h1>
            <p className="matt-subtitle">My Anchor Through Turmoil</p>
          </header>

          <section className="matt-status-row">
            <div className="status-chip">
              <span className="label">Status</span>
              <span className="value">{statusText}</span>
            </div>

            {sentiment ? (
              <div className={sentimentClass}>
                <span className="label">Sentiment</span>
                <span className="value">{sentiment}</span>
              </div>
            ) : null}
          </section>

          {errorText && <div className="error-box">{errorText}</div>}

          <section className="card">
            <h2 className="card-title">Voice Settings</h2>

            <div className="field-group">
              <label className="field-label">Voice</label>
              <select
                className="select"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} — {v.lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="slider-row">
              <div className="slider-field">
                <label className="field-label">
                  Rate <span className="slider-value">{rate.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.01"
                  value={rate}
                  onChange={(e) =>
                    setRate(parseFloat(e.target.value || '1'))
                  }
                />
              </div>
              <div className="slider-field">
                <label className="field-label">
                  Pitch{' '}
                  <span className="slider-value">{pitch.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.01"
                  value={pitch}
                  onChange={(e) =>
                    setPitch(parseFloat(e.target.value || '1'))
                  }
                />
              </div>
            </div>

            <button
              className="btn secondary full"
              onClick={() =>
                speak('Hi, I’m M.A.T.T. This is my current voice.')
              }
            >
              Preview Voice
            </button>
          </section>

          <section className="card">
            <h2 className="card-title">Talk to M.A.T.T.</h2>

            <div className="button-row">
              {!isListening ? (
                <button className="btn primary full" onClick={startListening}>
                  🎤 Start Talking
                </button>
              ) : (
                <button className="btn danger full" onClick={stopListening}>
                  ■ Stop Listening
                </button>
              )}
            </div>

            <div className="or-divider">
              <span>or type instead</span>
            </div>

            <div className="field-group">
              <textarea
                className="textarea"
                rows={3}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Tell M.A.T.T. how you're feeling right now..."
              />
            </div>

            <button className="btn accent full" onClick={sendManual}>
              Send to M.A.T.T.
            </button>
          </section>

          {lastHeard && (
            <section className="card">
              <h2 className="card-title">Last thing you said</h2>
              <p className="transcript">{lastHeard}</p>
            </section>
          )}
        </div>
      </div>

      {/* ====== STYLES (Mobile + Desktop) ====== */}
      <style jsx>{`
        :root {
          color-scheme: dark;
        }

        .matt-root {
          min-height: 100vh;
          background: radial-gradient(circle at top, #222b3b, #050509 50%, #000);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            sans-serif;
          color: #f9fafb;
        }

        .matt-shell {
          width: 100%;
          max-width: 480px;
          background: rgba(10, 10, 16, 0.95);
          border-radius: 20px;
          padding: 18px 16px 24px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(148, 163, 184, 0.25);
        }

        @media (min-width: 768px) {
          .matt-shell {
            max-width: 640px;
            padding: 24px 22px 28px;
          }
        }

        .matt-header {
          text-align: center;
          margin-bottom: 16px;
        }

        .matt-header h1 {
          margin: 0;
          font-size: 2rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .matt-subtitle {
          margin: 4px 0 0;
          font-size: 0.9rem;
          color: #a5b4fc;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .matt-status-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }

        .status-chip,
        .sentiment-badge {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(15, 23, 42, 0.8);
        }

        .status-chip .label,
        .sentiment-badge .label {
          text-transform: uppercase;
          font-weight: 600;
          color: #9ca3af;
          font-size: 0.7rem;
        }

        .status-chip .value,
        .sentiment-badge .value {
          font-weight: 500;
        }

        .sentiment-badge.danger {
          border-color: rgba(248, 113, 113, 0.9);
          background: rgba(127, 29, 29, 0.7);
        }

        .sentiment-badge.warning {
          border-color: rgba(250, 204, 21, 0.9);
          background: rgba(113, 63, 18, 0.7);
        }

        .sentiment-badge.low {
          border-color: rgba(96, 165, 250, 0.9);
          background: rgba(23, 37, 84, 0.7);
        }

        .sentiment-badge.neutral {
          border-color: rgba(148, 163, 184, 0.9);
          background: rgba(15, 23, 42, 0.7);
        }

        .sentiment-badge.unknown {
          opacity: 0.75;
        }

        .error-box {
          margin-bottom: 10px;
          padding: 8px 10px;
          font-size: 0.8rem;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.09);
          border: 1px solid rgba(248, 113, 113, 0.7);
          color: #fecaca;
          word-break: break-word;
        }

        .card {
          background: radial-gradient(circle at top left, #020617, #020617 40%, #020617);
          border-radius: 16px;
          padding: 12px 12px 14px;
          border: 1px solid rgba(55, 65, 81, 0.7);
          margin-top: 10px;
        }

        @media (min-width: 768px) {
          .card {
            padding: 14px 14px 16px;
            margin-top: 12px;
          }
        }

        .card-title {
          margin: 0 0 8px;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #e5e7eb;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
        }

        .field-label {
          font-size: 0.8rem;
          color: #9ca3af;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slider-value {
          font-variant-numeric: tabular-nums;
          color: #e5e7eb;
        }

        .select,
        .textarea {
          border-radius: 10px;
          border: 1px solid rgba(75, 85, 99, 0.9);
          background: rgba(15, 23, 42, 0.8);
          color: #f9fafb;
          padding: 8px 10px;
          font-size: 0.9rem;
          outline: none;
        }

        .select:focus,
        .textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.7);
        }

        .textarea {
          resize: vertical;
          min-height: 72px;
          max-height: 200px;
        }

        .slider-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 10px;
        }

        .slider-field input[type='range'] {
          width: 100%;
        }

        @media (min-width: 600px) {
          .slider-row {
            flex-direction: row;
            gap: 12px;
          }
          .slider-field {
            flex: 1;
          }
        }

        .btn {
          border-radius: 999px;
          border: none;
          padding: 10px 14px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.08s ease, box-shadow 0.08s ease,
            background 0.12s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        .btn.full {
          width: 100%;
        }

        .btn.primary {
          background: linear-gradient(to right, #22c55e, #16a34a);
          color: #022c22;
          box-shadow: 0 8px 18px rgba(34, 197, 94, 0.45);
        }

        .btn.danger {
          background: linear-gradient(to right, #ef4444, #dc2626);
          color: #fee2e2;
          box-shadow: 0 8px 18px rgba(239, 68, 68, 0.45);
        }

        .btn.secondary {
          background: rgba(17, 24, 39, 0.9);
          color: #e5e7eb;
          border: 1px solid rgba(75, 85, 99, 0.9);
        }

        .btn.accent {
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          color: #eef2ff;
          box-shadow: 0 8px 18px rgba(129, 140, 248, 0.5);
        }

        .btn:active {
          transform: translateY(1px) scale(0.99);
          box-shadow: none;
        }

        .button-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 8px;
        }

        .or-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 8px 0 10px;
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .or-divider::before,
        .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #4b5563);
        }

        .or-divider::before {
          margin-right: 8px;
        }

        .or-divider::after {
          margin-left: 8px;
        }

        .transcript {
          margin: 4px 0 0;
          font-size: 0.9rem;
          color: #e5e7eb;
          border-radius: 10px;
          padding: 8px 10px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(55, 65, 81, 0.8);
        }
      `}</style>
    </>
  );
}

export default SponsorChat;
