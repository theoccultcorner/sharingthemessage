import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Container, TextField, Button, Typography } from "@mui/material";

const CreateScreenName = () => {
  const { user, setScreenName } = useAuth();
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { screenName: name, role: "member" }, { merge: true });
    setScreenName(name); // ensure context updates immediately
    navigate("/home");
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
      <Typography variant="h5">Create Your Screen Name</Typography>
      <TextField
        fullWidth
        label="Screen Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" onClick={handleSubmit}>Continue</Button>
    </Container>
  );
};

export default CreateScreenName;
