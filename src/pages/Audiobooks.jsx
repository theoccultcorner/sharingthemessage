import React, { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import HeadphonesRoundedIcon from "@mui/icons-material/HeadphonesRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";

const books = [
  { title: "Narcotics Anonymous Basic Text", label: "10 chapters", description: "The foundation of the NA recovery program.", chapters: [
    ["Chapter 1 – Who Is an Addict?", "qGf1r3XVzqY"], ["Chapter 2 – What Is the Narcotics Anonymous Program?", "2Us7CZ6WXKE"], ["Chapter 3 – Why Are We Here?", "4YEQhYNFlkQ"], ["Chapter 4 – How It Works", "4e9LHY5Xltc"], ["Chapter 5 – What Can I Do?", "a-l2S639CdM"], ["Chapter 6 – The Twelve Traditions of NA", "yopAPnimAew"], ["Chapter 7 – Recovery and Relapse", "l5FbRbv_0A0"], ["Chapter 8 – We Do Recover", "fqnq90dL2DA"], ["Chapter 9 – Just for Today", "eAi0ntTPcfE"], ["Chapter 10 – More Will Be Revealed", "c0xFQNkr4f8"]
  ]},
  { title: "It Works: How and Why", label: "12 steps", description: "A closer look at the principles behind each step.", chapters: [
    ["Step 1", "w_gixHePwDw"], ["Step 2", "F3d6B94epnA"], ["Step 3", "5Ry42KZp7F8"], ["Step 4", "8jgzWuH3vVI"], ["Step 5", "PrulUCK1Pks"], ["Step 6", "A9JkVk6wblo"], ["Step 7", "ouirRX2n-To"], ["Step 8", "s4ur7jnTWwo"], ["Step 9", "MHkW_YDuuOI"], ["Step 10", "IGmFrBERbY8"], ["Step 11", "CLNlwYAmD-M"], ["Step 12", "Ti3oCQt5svM"]
  ]},
  { title: "Living Clean", label: "7 readings", description: "Experience, strength, and hope for life in recovery.", chapters: [
    ["Preface", "oZIfAxGpAJA"], ["Chapter 1", "Ke6QpyZiJZU"], ["Chapter 2", "YJYybAY6hT4"], ["Chapter 3", "bbYt9rqrgZ8"], ["Chapter 4", "ZTeJnVBvqcc"], ["Chapter 5", "yX1YWEP2erI"], ["Chapter 6", "UOD-dweq5pg"]
  ]}
];

export default function Audiobooks() {
  const [openBook, setOpenBook] = useState(0);
  const [openChapter, setOpenChapter] = useState("");
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-end" }} spacing={2} sx={{ mb: 4 }}>
        <Box><Typography variant="overline" color="secondary.dark" sx={{ fontWeight: 800, letterSpacing: ".12em" }}>RECOVERY LIBRARY</Typography><Typography variant="h4">Audiobooks</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Listen at your pace. Choose a book, then open any chapter.</Typography></Box>
        <Chip icon={<HeadphonesRoundedIcon />} label="29 recordings" sx={{ bgcolor: "primary.light", color: "primary.dark", fontWeight: 700 }} />
      </Stack>

      <Grid container spacing={2.5}>
        {books.map((book, bookIndex) => (
          <Grid item xs={12} key={book.title}>
            <Paper elevation={0} sx={{ border: "1px solid rgba(21,63,58,.1)", overflow: "hidden" }}>
              <Accordion expanded={openBook === bookIndex} onChange={(_, expanded) => setOpenBook(expanded ? bookIndex : -1)} sx={{ m: "0 !important", border: 0, borderRadius: "0 !important" }}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 2.5, md: 3.5 }, py: 1.25, "& .MuiAccordionSummary-content": { alignItems: "center", gap: 2 } }}>
                  <Box sx={{ width: 50, height: 50, borderRadius: 3, bgcolor: bookIndex === 1 ? "secondary.light" : "primary.light", color: "primary.dark", display: "grid", placeItems: "center", flexShrink: 0 }}><MenuBookRoundedIcon /></Box>
                  <Box sx={{ flex: 1 }}><Typography variant="h6">{book.title}</Typography><Typography variant="body2" color="text.secondary">{book.description}</Typography></Box>
                  <Chip label={book.label} size="small" sx={{ display: { xs: "none", sm: "flex" }, mr: 1 }} />
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 2, md: 3.5 }, pb: 3.5, pt: 1 }}>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {book.chapters.map(([title, videoId], chapterIndex) => {
                      const key = `${bookIndex}-${chapterIndex}`;
                      return (
                        <Accordion key={key} expanded={openChapter === key} onChange={(_, expanded) => setOpenChapter(expanded ? key : "")} sx={{ bgcolor: "#f7f8f6" }}>
                          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 2.25 }}>
                            <Stack direction="row" spacing={1.25} alignItems="center"><PlayCircleOutlineRoundedIcon color="primary" /><Typography sx={{ fontWeight: 650 }}>{title}</Typography></Stack>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
                            <Box sx={{ position: "relative", pt: "56.25%", overflow: "hidden", borderRadius: 3, bgcolor: "#0b2b28" }}>
                              <Box component="iframe" src={`https://www.youtube.com/embed/${videoId}`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
