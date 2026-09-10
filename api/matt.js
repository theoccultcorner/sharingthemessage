export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "M.A.T.T. is not configured yet." });
  const prompt = req.body?.prompt;
  if (!prompt || typeof prompt !== "string" || prompt.length > 4000) return res.status(400).json({ error: "Enter a message under 4,000 characters." });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style recovery support companion. Reply in 1-3 short sentences. Be supportive, non-judgmental, and practical. Suggest one gentle next step. Never claim to replace a sponsor, clinician, or emergency service. If the person may be in immediate danger, urge them to call emergency services or 988 in the U.S. Respond as JSON with reply and sentiment; sentiment must be very low, low, neutral, high, or very high." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 220
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "Support service unavailable." });
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
    return res.status(200).json({ reply: parsed.reply || "I'm here with you.", sentiment: parsed.sentiment || "unknown" });
  } catch (error) {
    console.error("M.A.T.T. request failed", error);
    return res.status(500).json({ error: "Support service unavailable. Please try again." });
  }
}
