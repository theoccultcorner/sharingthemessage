// src/pages/Meditation.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  AppBar,
  Toolbar,
  Button
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const Meditation = () => {
  const [meditation, setMeditation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      <AppBar position="static" sx={{ backgroundColor: "#1F3F3A" }}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/home")}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Daily Meditation
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : meditation ? (
          <Paper elevation={3} sx={{ p: 3, whiteSpace: "pre-line" }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              {meditation.date}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
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
