// /pages/Audiobooks.jsx
import React from "react";

const Audiobooks = () => {
  return (
    <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Audiobooks</h1>
      <p>Listen to the full Basic Text of Narcotics Anonymous below.</p>

      {/* Embedded YouTube playlist for NA Basic Text */}
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", marginTop: "1rem" }}>
        <iframe
          src="https://www.youtube.com/embed/videoseries?list=PLHeh4PPjtVu2CQXLo9yB34V8WJCDYdoRR"
          title="Narcotics Anonymous Basic Text Playlist"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        ></iframe>
      </div>
    </div>
  );
};

export default Audiobooks;
