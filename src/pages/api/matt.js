// src/pages/api/matt.js

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST' });
      return;
    }

    // Use either OPENAI_API_KEY or your NEXT_PUBLIC_OPENAI_API_KEY
    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      res.status(500).json({
        error:
          'Missing OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY on the server.'
      });
      return;
    }

    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Missing "prompt" string in body.' });
      return;
    }

    const system = [
      'You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.',
      'Reply in 1–3 short sentences. Be supportive, non-judgmental, and practical.',
      'Suggest one gentle next step (drink water, text a friend, breathe).',
      'Avoid medical claims. If user sounds in crisis, suggest calling 988 in U.S. or local help.',
      'No emojis. Warm, grounded, concise.',
      'ALWAYS respond as a single JSON object with "reply" and "sentiment".',
      '"sentiment" should be: "very low", "low", "neutral", "high", or "very high" emotional distress.'
    ].join(' ');

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `User said: "${prompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const raw = await openaiRes.text(); // get raw text for safety

    if (!openaiRes.ok) {
      console.error('OpenAI error body:', raw);
      let msg = 'OpenAI error';
      try {
        const parsedErr = JSON.parse(raw);
        msg = parsedErr?.error?.message || msg;
      } catch {
        // raw was not JSON
      }
      res.status(openaiRes.status).json({ error: msg });
      return;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse OpenAI JSON:', raw);
      res.status(500).json({
        error: 'Invalid JSON from OpenAI.',
        raw
      });
      return;
    }

    const content = data?.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { reply: content, sentiment: 'unknown' };
    }

    res.status(200).json({
      reply: parsed.reply || '',
      sentiment: parsed.sentiment || 'unknown'
    });
  } catch (err) {
    console.error('/api/matt unexpected server error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Unexpected server error calling OpenAI.',
        details: String(err)
      });
    }
  }
}
