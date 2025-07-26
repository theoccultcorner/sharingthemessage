// /pages/Audiobooks.jsx
import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const books = [
  {
    title: "Narcotics Anonymous Basic Text",
    chapters: [
      { title: "Chapter 1 – Who Is an Addict?", url: "https://www.youtube.com/embed/qGf1r3XVzqY" },
      { title: "Chapter 2 – What Is the Narcotics Anonymous Program?", url: "https://www.youtube.com/embed/2Us7CZ6WXKE" },
      { title: "Chapter 3 – Why Are We Here?", url: "https://www.youtube.com/embed/4YEQhYNFlkQ" },
      { title: "Chapter 4 – How It Works", url: "https://www.youtube.com/embed/4e9LHY5Xltc" },
      { title: "Chapter 5 – What Can I Do?", url: "https://www.youtube.com/embed/a-l2S639CdM" },
      { title: "Chapter 6 – The Twelve Traditions of NA", url: "https://www.youtube.com/embed/yopAPnimAew" },
      { title: "Chapter 7 – Recovery and Relapse", url: "https://www.youtube.com/embed/l5FbRbv_0A0" },
      { title: "Chapter 8 – We Do Recover", url: "https://www.youtube.com/embed/fqnq90dL2DA" },
      { title: "Chapter 9 – Just for Today – Living the Program", url: "https://www.youtube.com/embed/eAi0ntTPcfE" },
      { title: "Chapter 10 – More Will Be Revealed", url: "https://www.youtube.com/embed/c0xFQNkr4f8" }
    ]
  },
  {
    title: "It Works: How and Why",
    chapters: [
      { title: "Step One", url: "https://www.youtube.com/embed/w_gixHePwDw" },
      { title: "Step Two", url: "https://www.youtube.com/embed/F3d6B94epnA" },
      { title: "Step Three", url: "https://www.youtube.com/embed/5Ry42KZp7F8" },
      { title: "Step Four", url: "https://www.youtube.com/embed/8jgzWuH3vVI" },
      { title: "Step Five", url: "https://www.youtube.com/embed/PrulUCK1Pks" },
      { title: "Step Six", url: "https://www.youtube.com/embed/A9JkVk6wblo" },
      { title: "Step Seven", url: "https://www.youtube.com/embed/ouirRX2n-To" },
      { title: "Step Eight", url: "https://www.youtube.com/embed/s4ur7jnTWwo" },
      { title: "Step Nine", url: "https://www.youtube.com/embed/MHkW_YDuuOI" },
      { title: "Step Ten", url: "https://www.youtube.com/embed/IGmFrBERbY8" },
      { title: "Step Eleven", url: "https://www.youtube.com/embed/CLNlwYAmD-M" },
      { title: "Step Twelve", url: "https://www.youtube.com/embed/Ti3oCQt5svM" }
    ]
  },
  {
    title: "Living Clean",
    chapters: [
      { title: "Preface", url: "https://www.youtube.com/embed/oZIfAxGpAJA" },
      { title: "Chapter 1 (Living Clean)", url: "https://www.youtube.com/embed/Ke6QpyZiJZU" },
      { title: "Chapter 2 (The Ties That Bind)", url: "https://www.youtube.com/embed/YJYybAY6hT4" },
      { title: "Chapter 3 (A Spiritual Path)", url: "https://www.youtube.com/embed/bbYt9rqrgZ8" },
      { title: "Chapter 4 (Our Physical Selves)", url: "https://www.youtube.com/embed/ZTeJnVBvqcc" },
      { title: "Chapter 5 (Relationships)", url: "https://www.youtube.com/embed/yX1YWEP2erI" },
      { title: "Chapter 7 (The Journey Continues)", url: "https://www.youtube.com/embed/UOD-dweq5pg" }
    ]
  }
];

const Audiobooks = () => {
  return (
    <div style={{ padding: "1rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>NA Audiobooks Library</h1>
      <p>Select a book to view and listen to its chapters:</p>
      {books.map((book, bookIndex) => (
        <Accordion key={bookIndex} defaultExpanded={bookIndex === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{book.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {book.chapters.map((chapter, index) => (
              <div key={index} style={{ marginBottom: "2rem" }}>
                <Typography variant="subtitle1" gutterBottom>
                  {chapter.title}
                </Typography>
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden"
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
                      height: "100%"
                    }}
                  ></iframe>
                </div>
              </div>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default Audiobooks;