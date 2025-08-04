
// components/SponsorChat.jsx
import React, { useEffect, useRef } from "react";

const SponsorChat = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }).catch(err => console.error("Camera error:", err));
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black", overflow: "hidden" }}>
      <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};

export default SponsorChat;
