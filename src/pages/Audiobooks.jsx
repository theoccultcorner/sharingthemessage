// /pages/Audiobooks.jsx
import React from "react";

const chapters = [
  {
    title: "Chapter 1 – Who Is an Addict?",
    url: "https://www.youtube.com/embed/qGf1r3XVzqY",
  },
  {
    title: "Chapter 2 – What Is the Narcotics Anonymous Program?",
    url: "https://www.youtube.com/embed/2Us7CZ6WXKE",
  },
  {
    title: "Chapter 3 – Why Are We Here?",
    url: "https://www.youtube.com/embed/4YEQhYNFlkQ",
  },
  {
    title: "Chapter 4 – How It Works",
    url: "https://www.youtube.com/embed/4e9LHY5Xltc",
  },
  {
    title: "Chapter 5 – What Can I Do?",
    url: "https://www.youtube.com/embed/a-l2S639CdM",
  },
  {
    title: "Chapter 6 – The Twelve Traditions of NA",
    url: "https://www.youtube.com/embed/yopAPnimAew",
  },
  {
    title: "Chapter 7 – Recovery and Relapse",
    url: "https://www.youtube.com/embed/l5FbRbv_0A0",
  },
  {
    title: "Chapter 8 – We Do Recover",
    url: "https://www.youtube.com/embed/fqnq90dL2DA",
  },
  {
    title: "Chapter 9 – Just for Today – Living the Program",
    url: "https://www.youtube.com/embed/eAi0ntTPcfE",
  },
  {
    title: "Chapter 10 – More Will Be Revealed",
    url: "https://www.youtube.com/embed/c0xFQNkr4f8",
  },
];

const Audiobooks = () => {
  return (
    <div style={{ padding: "1rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Narcotics Anonymous Basic Text</h1>
      <p>Listen to each chapter of the Basic Text of NA below:</p>

      {chapters.map((chapter, index) => (
        <div key={index} style={{ marginBottom: "3rem" }}>
          <h2>{chapter.title}</h2>
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
            }}
          >
            <iframe
              src={chapter.url}
              title={chapter.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            ></iframe>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Audiobooks;
