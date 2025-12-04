import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================
//   LOAD API KEY FROM ENV
// ==========================
function getApiKey() {
  const key =
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    '';

  if (typeof window !== 'undefined') {
    console.log(
      'MATT ENV KEY (first 10 chars):',
      key ? key.slice(0, 10) + '...' : 'MISSING'
    );
  }

  return key;
}

// ==========================
//   CALL CHATGPT
// ==========================
async function callChatGPT(prompt, apiKey) {
  if (!apiKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_OPENAI_API_KEY / OPENAI_API_KEY in environment.'
    );
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
//   INLINE STYLES
// ==========================
const styles = {
  root: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top, #222b3b, #050509 50%, #000000)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#f9fafb',
    boxSizing: 'border-box'
  },
  shell: {
    width: '100%',
    maxWidth: 640,
    background: 'rgba(10, 10, 16, 0.95)',
    borderRadius: 20,
    padding: 22,
    boxShadow: '0 18px 40px rgba(0,0,0,0.7)',
    border: '1px solid rgba(148,163,184,0.25)',
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: 16
  },
  title: {
    margin: 0,
    fontSize: 24,
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: 14,
    color: '#a5b4fc',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  statusRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  chipBase: {
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid rgba(148,163,184,0.4)',
    background: 'rgba(15,23,42,0.8)'
  },
  chipLabel: {
    textTransform: 'uppercase',
    fontWeight: 600,
    color: '#9ca3af',
    fontSize: 11
  },
  chipValue: {
    fontWeight: 500
  },
  chipKeyOk: {
    border: '1px solid rgba(34,197,94,0.7)',
    background: 'rgba(22,163,74,0.2)'
  },
  chipKeyMissing: {
    border: '1px solid rgba(248,113,113,0.7)',
    background: 'rgba(127,29,29,0.2)'
  },
  sentimentDanger: {
    border: '1px solid rgba(248,113,113,0.9)',
    background: 'rgba(127,29,29,0.7)'
  },
  sentimentWarning: {
    border: '1px solid rgba(250,204,21,0.9)',
    background: 'rgba(113,63,18,0.7)'
  },
  sentimentLow: {
    border: '1px solid rgba(96,165,250,0.9)',
    background: 'rgba(23,37,84,0.7)'
  },
  sentimentNeutral: {
    border: '1px solid rgba(148,163,184,0.9)',
    background: 'rgba(15,23,42,0.7)'
  },
  errorBox: {
    marginBottom: 10,
    padding: '8px 10px',
    fontSize: 12,
    borderRadius: 10,
    background: 'rgba(239,68,68,0.09)',
    border: '1px solid rgba(248,113,113,0.7)',
    color: '#fecaca',
    wordBreak: 'break-word'
  },
  card: {
    background:
      'radial-gradient(circle at top left, #020617, #020617 40%, #020617)',
    borderRadius: 16,
    padding: 14,
    border: '1px solid rgba(55,65,81,0.7)',
    marginTop: 12,
    boxSizing: 'border-box'
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#e5e7eb'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginBottom: 10
  },
  fieldLabel: {
    fontSize: 12,
    color: '#9ca3af',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sliderValue: {
    fontVariantNumeric: 'tabular-nums',
    color: '#e5e7eb'
  },
  select: {
    borderRadius: 10,
    border: '1px solid rgba(75,85,99,0.9)',
    background: 'rgba(15,23,42,0.8)',
    color: '#f9fafb',
    padding: '8px 10px',
    fontSize: 14,
    outline: 'none'
  },
  textarea: {
    borderRadius: 10,
    border: '1px solid rgba(75,85,99,0.9)',
    background: 'rgba(15,23,42,0.8)',
    color: '#f9fafb',
    padding: '8px 10px',
    fontSize: 14,
    outline: 'none',
    resize: 'vertical',
    minHeight: 72,
    maxHeight: 200
  },
  sliderRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 10
  },
  sliderField: {
    flex: 1
  },
  buttonBase: {
    borderRadius: 999,
    border: 'none',
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition:
      'transform 0.08s ease, box-shadow 0.08s ease, background 0.12s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    width: '100%'
  },
  btnPrimary: {
    background: 'linear-gradient(to right, #22c55e, #16a34a)',
    color: '#022c22',
    boxShadow: '0 8px 18px rgba(34,197,94,0.45)'
  },
  btnDanger: {
    background: 'linear-gradient(to right, #ef4444, #dc2626)',
    color: '#fee2e2',
    boxShadow: '0 8px 18px rgba(239,68,68,0.45)'
  },
  btnSecondary: {
    background: 'rgba(17,24,39,0.9)',
    color: '#e5e7eb',
    border: '1px solid rgba(75,85,99,0.9)'
  },
  btnAccent: {
    background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
    color: '#eef2ff',
    boxShadow: '0 8px 18px rgba(129,140,248,0.5)'
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 8
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '8px 0 10px',
    fontSize: 12,
    color: '#9ca3af'
  },
  orLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(to right, transparent, #4b5563)'
  },
  orSpan: {
    margin: '0 8px'
  },
  transcript: {
    margin: '4px 0 0',
    fontSize: 14,
    color: '#e5e7eb',
    borderRadius: 10,
    padding: '8px 10px',
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(55,65,81,0.8)'
  }
};

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

  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const v = window.speechSynthesis.getVoices() || [];
    setVoices(v);
    if (!voiceName && v.length) {
      const best = pickBestVoice(v);
      setVoiceName(best?.name || v[0].name);
    }
  }, [voiceName]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

  const selectedVoice = useCallback(() => {
    return voices.find((v) => v.name === voiceName) || pickBestVoice(voices);
  }, [voiceName, voices]);

  const speak = useCallback(
    (text) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
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

  function createRecognition() {
    if (typeof window === 'undefined') return null;
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
    if (typeof window === 'undefined') return;

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

  const sentimentStyle = (() => {
    const s = (sentiment || '').toLowerCase();
    if (s.includes('very high')) return styles.sentimentDanger;
    if (s.includes('high')) return styles.sentimentWarning;
    if (s.includes('low')) return styles.sentimentLow;
    if (s.includes('neutral')) return styles.sentimentNeutral;
    return {};
  })();

  const hasKey = !!API_KEY;

  return (
    <div style={styles.root}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <h1 style={styles.title}>M.A.T.T.</h1>
          <p style={styles.subtitle}>My Anchor Through Turmoil</p>
        </header>

        <section style={styles.statusRow}>
          <div style={styles.chipBase}>
            <span style={styles.chipLabel}>Status</span>
            <span style={styles.chipValue}>{statusText}</span>
          </div>

          {sentiment ? (
            <div style={{ ...styles.chipBase, ...sentimentStyle }}>
              <span style={styles.chipLabel}>Sentiment</span>
              <span style={styles.chipValue}>{sentiment}</span>
            </div>
          ) : null}

          <div
            style={{
              ...styles.chipBase,
              ...(hasKey ? styles.chipKeyOk : styles.chipKeyMissing)
            }}
          >
            <span style={styles.chipLabel}>API Key</span>
            <span style={styles.chipValue}>
              {hasKey ? 'Loaded' : 'Missing'}
            </span>
          </div>
        </section>

        {errorText && <div style={styles.errorBox}>{errorText}</div>}

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Voice Settings</h2>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Voice</label>
            <select
              style={styles.select}
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

          <div style={styles.sliderRow}>
            <div style={styles.sliderField}>
              <label style={styles.fieldLabel}>
                Rate
                <span style={styles.sliderValue}>{rate.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value || '1'))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={styles.sliderField}>
              <label style={styles.fieldLabel}>
                Pitch
                <span style={styles.sliderValue}>{pitch.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.01"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value || '1'))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <button
            style={{ ...styles.buttonBase, ...styles.btnSecondary }}
            onClick={() =>
              speak('Hi, I’m M.A.T.T. This is my current voice.')
            }
          >
            Preview Voice
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Talk to M.A.T.T.</h2>

          <div style={styles.buttonRow}>
            {!isListening ? (
              <button
                style={{ ...styles.buttonBase, ...styles.btnPrimary }}
                onClick={startListening}
              >
                🎤 Start Talking
              </button>
            ) : (
              <button
                style={{ ...styles.buttonBase, ...styles.btnDanger }}
                onClick={stopListening}
              >
                ■ Stop Listening
              </button>
            )}
          </div>

          <div style={styles.orDivider}>
            <div style={styles.orLine} />
            <span style={styles.orSpan}>or type instead</span>
            <div style={styles.orLine} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Message</label>
            <textarea
              style={styles.textarea}
              rows={3}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Tell M.A.T.T. how you're feeling right now..."
            />
          </div>

          <button
            style={{ ...styles.buttonBase, ...styles.btnAccent }}
            onClick={sendManual}
          >
            Send to M.A.T.T.
          </button>
        </section>

        {lastHeard && (
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Last thing you said</h2>
            <p style={styles.transcript}>{lastHeard}</p>
          </section>
        )}
      </div>
    </div>
  );
}

// 👇 your export at the bottom
export default SponsorChat;
