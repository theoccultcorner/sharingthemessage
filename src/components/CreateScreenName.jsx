import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Container, TextField, Button, Typography, Box, Paper, Chip } from "@mui/material";

const CreateScreenName = () => {
  const { user, setScreenName } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Enter a screen name to continue."); return; }
    setSaving(true); setError("");
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { screenName: name.trim(), role: "member" }, { merge: true });
      setScreenName(name.trim());
      navigate("/home");
    } catch (err) {
      setError("We couldn't save your screen name. Please try again.");
    } finally { setSaving(false); }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ py: { xs: 3, md: 7 }, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}
    >
      <Box sx={{ mb: 2 }}>
        <Chip label="ONE LAST STEP" size="small" sx={{ mb: 2, bgcolor: "primary.light", color: "primary.dark", fontWeight: 800 }} />
        <Typography variant="h4" sx={{ mb: 1 }}>Choose your screen name</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>This is how other members will see you in the community.</Typography>

        <Paper elevation={0} sx={{ bgcolor: "primary.dark", color: "#fff", p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ color: "secondary.light", fontWeight: 700, fontSize: "1rem" }}
          >
            Just for today
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,.65)", mt: 1, fontSize: ".9rem" }}>
            Tell yourself:
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: ".95rem", lineHeight: 1.65 }}>
            Just for today my thoughts will be on my recovery, living and enjoying life without the use of drugs.
          </Typography>
          <Typography sx={{ mt: 1.2, fontSize: ".95rem", lineHeight: 1.65 }}>
            Just for today I will have faith in someone in NA who believes in me and wants to help me in my recovery.
          </Typography>
          <Typography sx={{ mt: 1.2, fontSize: ".95rem", lineHeight: 1.65 }}>
            Just for today I will have a program. I will try to follow it to the best of my ability. Just for today, through NA, I will try to get a better perspective on my life.
          </Typography>
          <Typography sx={{ mt: 1.2, fontSize: ".95rem", lineHeight: 1.65 }}>
            Just for today I will be unafraid, my thoughts will be on my new associations, people who are not using and who have found a new way of life. So long as I follow that way, I have nothing to fear.
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          backgroundColor: "transparent"
        }}
      >
        <TextField
          fullWidth
          label="Screen Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          autoFocus
          error={Boolean(error)}
          helperText={error || "You can change this later in your profile."}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          disabled={saving}
          sx={{
            mt: 1,
          }}
        >
          {saving ? "Saving…" : "Continue"}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateScreenName;
