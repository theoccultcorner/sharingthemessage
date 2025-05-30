import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

const CreateScreenName = () => {
  const { user, setScreenName } = useAuth();
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const green = "#1F3F3A";

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { screenName: name, role: "member" }, { merge: true });
    setScreenName(name);
    navigate("/home");
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 2,
        display: "flex",
        flexDirection: "column",
        height: "100vh"
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
        <Typography variant="h5" sx={{ color: green, fontWeight: 600, mb: 2 }}>
          Create Your Screen Name
        </Typography>

        <Box sx={{ backgroundColor: "#f1f1f1", p: 2, borderRadius: 2, mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ color: green, fontWeight: 600, fontSize: "1rem" }}
          >
            Just for today
          </Typography>
          <Typography sx={{ color: green, mt: 1, fontSize: "0.8rem" }}>
            Tell yourself:
          </Typography>
          <Typography sx={{ color: green, mt: 1, fontSize: "0.8rem" }}>
            Just for today my thoughts will be on my recovery, living and enjoying life without the use of drugs.
          </Typography>
          <Typography sx={{ color: green, mt: 1, fontSize: "0.8rem" }}>
            Just for today I will have faith in someone in NA who believes in me and wants to help me in my recovery.
          </Typography>
          <Typography sx={{ color: green, mt: 1, fontSize: "0.8rem" }}>
            Just for today I will have a program. I will try to follow it to the best of my ability. Just for today, through NA, I will try to get a better perspective on my life.
          </Typography>
          <Typography sx={{ color: green, mt: 1, fontSize: "0.8rem" }}>
            Just for today I will be unafraid, my thoughts will be on my new associations, people who are not using and who have found a new way of life. So long as I follow that way, I have nothing to fear.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "#fff",
          pb: 2,
          pt: 1
        }}
      >
        <TextField
          fullWidth
          label="Screen Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          sx={{ input: { color: green }, label: { color: green } }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          sx={{
            backgroundColor: green,
            color: "#fff",
            mt: 1,
            "&:hover": { backgroundColor: "#16302D" }
          }}
        >
          Continue
        </Button>
      </Box>
    </Container>
  );
};

export default CreateScreenName;
