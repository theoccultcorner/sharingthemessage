
// === BACKEND: pages/api/chat.js ===
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { system, history, imageBase64 } = req.body;
  if (!imageBase64) {
    console.error("No image data received.");
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    console.log("Sending request to Gemini...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${system}\n\n${history}` },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64.split(',')[1]
                }
              }
            ]
          }
        ]
      })
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Unexpected non-JSON response:", text);
      return res.status(500).json({ error: "Invalid response format", raw: text });
    }

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data));

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("Gemini API no reply:", data);
      return res.status(500).json({ error: "No reply from Gemini", raw: data });
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to get response from Gemini' });
  }
}
