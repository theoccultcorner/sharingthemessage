export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { system, history } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${system}\n\n${history}` }] }
        ]
      })
    });

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("Gemini API did not return a reply:", data);
      return res.status(500).json({ error: "No reply from Gemini" });
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error('Gemini API fetch error:', error);
    res.status(500).json({ error: 'Failed to get response from Gemini' });
  }
}
