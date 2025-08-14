// pages/SponsorChat.jsx
import dynamic from 'next/dynamic';

// Dynamically import the client-only component (no SSR because it uses window, mic, TTS)
const SponsorChatClient = dynamic(() => import('../components/SponsorChatClient'), {
  ssr: false,
});

export default function SponsorChatPage() {
  // Read the public env var at build time and pass to the client as a prop.
  // This is the MOST reliable way on Vercel Pages Router.
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  return <SponsorChatClient apiKey={apiKey} />;
}
