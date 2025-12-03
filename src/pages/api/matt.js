
// pages/api/matt.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  // Use either OPENAI_API_KEY or your existing NEXT_PUBLIC_OPENAI_API_KEY
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error:
        'Missing OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY in environment.'
    });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing "prompt" string in body.' });
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

  try {
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

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error('OpenAI error:', data);
      return res
        .status(openaiRes.status)
        .json({ error: data?.error?.message || 'OpenAI error' });
    }

    const content = data?.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { reply: content, sentiment: 'unknown' };
    }

    return res.status(200).json({
      reply: parsed.reply || '',
      sentiment: parsed.sentiment || 'unknown'
    });
  } catch (err) {
    console.error('/api/matt server error:', err);
    return res.status(500).json({ error: 'Server error calling OpenAI.' });
  }
}
