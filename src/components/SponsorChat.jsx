import React, { useState, useEffect } from "react";
import { rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ref, push, onValue } from "firebase/database";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY, // ✅ Securely loaded
  dangerouslyAllowBrowser: true
});

const SponsorChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesRef = ref(rtdb, `na_chats/${user.uid}`);

  useEffect(() => {
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const parsed = data ? Object.values(data) : [];
      setMessages(parsed);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input, timestamp: Date.now() };
    await push(messagesRef, userMsg);
    setInput("");

    const chatHistory = [...messages, userMsg]
      .map((m) => `${m.sender === "user" ? user.displayName : "Sponsor"}: ${m.text}`)
      .join("\n");

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You're a supportive Narcotics Anonymous sponsor. Be encouraging, empathetic, and helpful.`,
        },
        {
          role: "user",
          content: chatHistory,
        },
      ],
    });

    const reply = aiResponse.choices[0].message.content;
    const sponsorMsg = { sender: "sponsor", text: reply, timestamp: Date.now() };
    await push(messagesRef, sponsorMsg);
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h2>Welcome, {user.displayName}</h2>
      <div style={{ height: 300, overflowY: "scroll", border: "1px solid #ccc", padding: "1rem" }}>
        {messages.map((m, i) => (
          <p key={i}><strong>{m.sender === "user" ? "You" : "Sponsor"}:</strong> {m.text}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "80%", marginTop: "1rem" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default SponsorChat;
