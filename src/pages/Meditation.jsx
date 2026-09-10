// src/pages/Meditation.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";

const Meditation = () => {
  const [meditation, setMeditation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMeditation = async () => {
      try {
        const response = await fetch("/meditations_cleaned.json");

        if (!response.ok) throw new Error("Failed to load meditations");

        const data = await response.json();

        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const key = `${month}-${day}`;

        if (data[key]) {
          setMeditation({
            date: today.toDateString(),
            text: data[key]
          });
        } else {
          setMeditation(null);
        }
      } catch (err) {
        console.error(err);
        setError("Couldn't load meditation.");
      } finally {
        setLoading(false);
      }
    };

    loadMeditation();
  }, []);

  return (
    <Box>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="overline" color="secondary.dark" sx={{ fontWeight: 800, letterSpacing: ".12em" }}>JUST FOR TODAY</Typography>
        <Typography variant="h4" sx={{ mb: 3 }}>Daily meditation</Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : meditation ? (
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, whiteSpace: "pre-line", border: "1px solid rgba(21,63,58,.1)", boxShadow: "0 16px 42px rgba(25,55,49,.08)" }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              {meditation.date}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.85, fontSize: "1.08rem" }}>
              {meditation.text}
            </Typography>
          </Paper>
        ) : (
          <Typography>No meditation found for today.</Typography>
        )}
      </Container>
    </Box>
  );
};

export default Meditation;
