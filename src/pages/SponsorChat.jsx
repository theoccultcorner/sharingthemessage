import React, { useState, useEffect, useRef, useCallback } from "react";

// ==== Get API Key ====
function getApiKey() {
  return (
    process.env.GEMINI_API_KEY || // Works if bundler injects it
    (typeof window !== "undefined" && window.GEMINI_API_KEY) || // Fallback if injected in index.html
    ""
  );
}

const GEMINI_API_KEY = getApiKey();

const SponsorChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState("Idle");
  const [lastHeard, setLastHeard] = useState("");
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const recognitionRef = useRef(null);

  // ===== Load best voice =====
  const loadVoices = useCallback(() => {
    if (!window.speechSynthesis) return;
    const list = window.speechSynthesis.getVoices();
    setVoices(list);
    if (!voiceName && list.length) {
      const preferred = list.find(
        (v) =>
          /Google|Microsoft|Natural|Neural/i.test(v.name) &&
          /^en(-|_)?(US|GB)/i.test(v.lang)
      );
      setVoiceName((preferred || list[0]).name);
    }
  }, [voiceName]);

  useEffect(() => {
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  const getSelectedVoice = useCallback(() => {
    return voices.find((v) => v.name === voiceName) || null;
  }, [voiceName, voices]);

  // ===== Text to Speech =====
  const speak = useCallback(
    (text) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const v = getSelectedVoice();
      if (v) utterance.voice = v;
      utterance.lang = v?.lang || "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    },
    [getSelectedVoice]
  );

  // ===== Call Gemini API =====
  async function getGeminiReply(prompt) {
    if (!GEMINI_API_KEY) {
      console.error("❌ Missing GEMINI_API_KEY");
      return "I’m here for you.";
    }

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
          GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: prompt }] }
            ],
          }),
        }
      );
      const data = await res.json();
      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I’m here for you."
      );
    } catch (err) {
      console.error("Gemini API Error:", err);
      return "Something went wrong.";
    }
  }

  // ===== Speech Recognition =====
  function createRecognition() {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SR) {
      alert("Speech recognition not supported in this browser.");
      return null;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      setStatusText("Listening…");
    };

    rec.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setLastHeard(transcript);
      setStatusText("Thinking…");
      const reply = await getGeminiReply(transcript);
      speak(reply);
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
    if (rec) {
      recognitionRef.current = rec;
      setIsListening(true);
      rec.start();
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div style={{ padding: "20px", background: "black", color: "white", height: "100vh" }}>
      <h1>M.A.T.T. – My Anchor Through Turmoil</h1>
      <p>Status: {statusText}</p>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Voice:{" "}
          <select
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} – {v.lang}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!isListening ? (
        <button onClick={startListening} style={{ padding: "10px", background: "green", color: "white" }}>
          Start Talking
        </button>
      ) : (
        <button onClick={stopListening} style={{ padding: "10px", background: "red", color: "white" }}>
          Stop
        </button>
      )}

      {lastHeard && (
        <div style={{ marginTop: "20px" }}>
          <strong>You said:</strong> {lastHeard}
        </div>
      )}
    </div>
  );
};

export default SponsorChat;
