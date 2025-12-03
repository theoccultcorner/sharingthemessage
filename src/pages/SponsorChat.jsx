'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ======= Get API Key from .env =======
function getApiKey() {
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
}

// ======= Call ChatGPT WITH SENTIMENT =======
async function callChatGPT(prompt, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const system = [
    'You are M.A.T.T. (My Anchor Through Turmoil), a calm, compassionate NA-style sponsor.',
    'Reply in 1–3 short sentences. Be supportive, non-judgmental, practical.',
    'Suggest one gentle next step (drink water, text a friend, breathe).',
    'Avoid medical claims. If user sounds in crisis, suggest calling 988 in U.S. or local help.',
    'No emojis. Warm, grounded, concise.',
    'ALWAYS respond as a single JSON object with two keys: "reply" and "sentiment".',
    '"reply" is the message you speak to the user.',
    '"sentiment" is one of: "very low", "low", "neutral", "high", "very high" emotional distress.'
  ].join(' ');

  const body = {
    model: 'gpt-4.1-mini',
    response_format: { type: 'json_object' },
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

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }

  const content = data?.choices?.[0]?.message?.content || '';

  // Should already be JSON, but just in case:
  try {
    const parsed = JSON.parse(content);
    return {
      reply: parsed.reply || '',
      sentiment: parsed.sentiment || 'unknown'
    };
  } catch {
    // fallback if model ever sends plain text
    return { reply: content.trim(), sentiment: 'unknown' };
  }
}

// ======= Pick Best Voice =======
function pickBestVoice(list) {
  if (!list?.length) return null;

  const isEn = (v) => /^en(-|_)?(US|GB|AU|CA|NZ)/i.test(v.lang || '');
  const score = (v) => {
    let s = 0;
    if (/google|microsoft|natural|neural/i.test(v.
