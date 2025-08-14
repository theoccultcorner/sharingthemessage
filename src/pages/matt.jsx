// pages/matt.jsx
import dynamic from 'next/dynamic';
const SponsorChat = dynamic(() => import('./SponsorChat'), { ssr: false });

export default function MattPage() {
  // Read the public env var on the server/page and pass to client as prop
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  return <SponsorChat apiKey={apiKey} />;
}
