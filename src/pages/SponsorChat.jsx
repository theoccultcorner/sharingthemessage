'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================
//   LOAD API KEY
// ==========================
function getApiKey() {
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
}

// ==========================
//   CALL CHATGPT WITH SENTIMENT
// ==========================
async function callChatGPT(prompt, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const system = [
    'You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.',
    'Reply in 1–3 short sentences. Be supportive, non-judgmental, practical.',
    'Suggest one gentle next step (drink water, text a friend, breathe).',
    'Avoid medical claims. If user sounds in crisis, suggest calling 988 in U.S. or local help.',
    'No emojis. Warm, grounded, concise.',
    'ALWAYS respond as a single JSON object with "reply" and "sentiment".',
    '"sentiment" should be: very low, low, neutral, high, or very high distress.'
  ].join(' ');

  const body = {
    model: 'gpt-4.1-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `User said: "${prompt}"` }
    ],
    temperature: 0.7
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

  const content = data?.choices?.[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(content);
    return {
      reply: parsed.reply || '',
      sentiment: parsed.sentiment || 'unknown'
    };
  } catch {
    return { reply: content, sentiment: 'unknown' };
  }
}

// ==========================
//   PICK BEST VOICE
// ==========================
function pickBestVoice(list) {
  if (!list || !list.length) return null;

  const isEn = (v) => /^en/i.test(v.lang || '');
  const score = (v) => {
    let s = 0;
    if (/google|microsoft|natural|neural/i.test(v.name)) s += 3;
    if (isEn(v)) s += 2;
    return s;
  };

  return [...list].sort((a, b) => score(b) - score(a))[0];
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
  }, [loadVoices]);

  const selectedVoice = useCallback(() => {
    return voices.find((v) => v.name === voiceName) || pickBestVoice(voices);
  }, [voiceName, voices]);

  // ==========================
  //   SPEAK FUNCTION
  // ==========================
  const speak = useCallback(
    (text) => {
      const u = new SpeechSynthesisUtterance(text);
      const v = selectedVoice();
      if (v) u.voice = v;
      u.lang = v?.lang || 'en-US';
      u.rate = rate;
      u.pitch = pitch;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    },
    [selectedVoice, rate, pitch]
  );

  // ==========================
  //   CREATE SPEECH RECOGNITION
  // ==========================
  function createRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorText('Speech Recognition not supported on this device.');
      return null;
    }

    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;

    rec.onstart = () => setStatusText('Listening…');

    rec.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      setLastHeard(transcript);

      setStatusText('Thinking…');
      try {
        const { reply, sentiment } = await callChatGPT(transcript, API_KEY);
        setSentiment(sentiment);
        speak(reply);
      } catch (err) {
        setErrorText(String(err));
        speak("I'm here with you. Let's take one small step together.");
      }
      setStatusText('Idle');
    };

    rec.onerror = (e) => {
      setErrorText('Microphone error');
      setIsListening(false);
    };

    rec.onend = () => setIsListening(false);

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

  // ==========================
  //   MANUAL TEXT INPUT
  // ==========================
  const sendManual = async () => {
    if (!manualText.trim()) return;
    setStatusText('Thinking…');

    try {
      const { reply, sentiment } = await callChatGPT(manualText, API_KEY);
      setSentiment(sentiment);
      speak(reply);
    } catch (err) {
      speak("I'm here with you.");
    }

    setStatusText('Idle');
  };

  // ==========================
  //   SENTIMENT COLORS
  // ==========================
  const sentimentClass = (() => {
    const s = sentiment.toLowerCase();
    if (s.includes('very high')) return 'sent badge danger';
    if (s.includes('high')) return 'sent badge warning';
    if (s.includes('low')) return 'sent badge low';
    if (s.includes('neutral')) return 'sent badge neutral';
    return 'sent badge unknown';
  })();

  // ==========================
  //   JSX UI
  // ==========================
  return (
    <>
      <div className="wrapper">
        <div className="container">

          <h1 className="title">M.A.T.T.</h1>
          <p className="subtitle">My Anchor Through Turmoil</p>

          <div className="status-row">
            <div className="chip">Status: {statusText}</div>
            {sentiment && <div className={sentimentClass}>{sentiment}</div>}
          </div>

          {errorText && <div className="error">{errorText}</div>}

          <div className="card">
            <h2>Talk to M.A.T.T.</h2>

            {!isListening ? (
              <button className="btn green" onClick={startListening}>
                🎤 Start Talking
              </button>
            ) : (
              <button className="btn red" onClick={stopListening}>
                ■ Stop
              </button>
            )}

            <div className="or">or type instead</div>

            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Tell M.A.T.T. what's on your mind..."
            />

            <button className="btn purple" onClick={sendManual}>
              Send
            </button>
          </div>

          {lastHeard && (
            <div className="card">
              <h2>Last thing you said</h2>
              <p className="bubble">{lastHeard}</p>
            </div>
          )}

        </div>
      </div>

      {/* ========================== */}
      {/*           CSS              */}
      {/* ========================== */}
      <style jsx>{`
        .wrapper {
          min-height: 100vh;
          background: black;
          color: white;
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        .container {
          width: 100%;
          max-width: 450px;
        }
        .title {
          text-align: center;
          margin: 0;
          font-size: 2rem;
        }
        .subtitle {
          text-align: center;
          margin-top: 4px;
          color: #aaa;
        }
        .status-row {
          margin-top: 15px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .chip {
          background: #222;
          padding: 6px 12px;
          border-radius: 20px;
        }
        .sent {
          padding: 6px 12px;
          border-radius: 20px;
        }
        .badge.danger { background: #5a0a0a; }
        .badge.warning { background: #6a4a00; }
        .badge.low { background: #0a3d5a; }
        .badge.neutral { background: #333; }
        .badge.unknown { background: #444; }
        .error {
          margin-top: 10px;
          background: #300;
          padding: 10px;
          border-radius: 10px;
          color: #f88;
        }
        .card {
          background: #111;
          padding: 15px;
          border-radius: 12px;
          margin-top: 20px;
          border: 1px solid #333;
        }
        .card h2 {
          margin: 0 0 10px;
        }
        textarea {
          width: 100%;
          min-height: 70px;
          border-radius: 10px;
          padding: 10px;
          background: #000;
          color: white;
          border: 1px solid #333;
        }
        .btn {
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          border-radius: 10px;
          font-size: 1rem;
          border: none;
          cursor: pointer;
        }
        .btn.green { background: #128a41; }
        .btn.red { background: #8a1a1a; }
        .btn.purple { background: #5a32a3; }
        .bubble {
          background: #000;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #333;
        }
        .or {
          text-align: center;
          margin: 12px 0;
          color: #777;
        }
      `}</style>
    </>
  );
}

// ==========================
//   EXPORT AT THE BOTTOM
// ==========================
export default SponsorChat;
