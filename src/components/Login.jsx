import React, { useState } from "react";
import { auth, provider, db } from "../firebase";
import {
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Button,
  Container,
  Typography,
  TextField,
  Stack,
  Box
} from "@mui/material";

import naLogo from "../assets/images.gif";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const green = "#1F3F3A";

  const handleGoogleLogin = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);

      const userRef = doc(db, "users", result.user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          screenName: "",
          email: result.user.email,
          photoURL: result.user.photoURL || "",
          role: "member"
        });
      } else {
        const userData = snap.data();
        if (userData.photoURL !== result.user.photoURL) {
          await setDoc(
            userRef,
            { photoURL: result.user.photoURL || "" },
            { merge: true }
          );
        }
      }

      const screenName = snap.exists() ? snap.data().screenName : null;
      navigate(
        screenName && screenName.trim() !== ""
          ? "/home"
          : "/create-screen-name"
      );
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Google login failed: " + err.message);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);

      const docRef = doc(db, "users", result.user.uid);
      const snap = await getDoc(docRef);

      const screenName = snap.exists() ? snap.data().screenName : null;
      navigate(
        screenName && screenName.trim() !== ""
          ? "/home"
          : "/create-screen-name"
      );
    } catch (err) {
      console.error(err);
      alert("Login failed: " + err.message);
    }
  };

  const handleEmailSignup = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", result.user.uid), {
        screenName: "",
        email: result.user.email,
        photoURL: "",
        role: "member"
      });

      navigate("/create-screen-name");
    } catch (err) {
      console.error(err);
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
      {/* Title */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: green }}>
        Sharing the Message Group of Narcotics Anonymous
      </Typography>

      {/* NA LOGO UNDER "NARCOTICS ANONYMOUS" */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box
          component="img"
          src={naLogo}
          alt="Narcotics Anonymous Logo"
          sx={{
            height: 90,
            width: "auto",
            opacity: 0.9
          }}
        />
      </Box>

      <Typography variant="h4" gutterBottom sx={{ color: green }}>
        {isSignup ? "Sign Up" : "Login"}
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ input: { color: green }, label: { color: green } }}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ input: { color: green }, label: { color: green } }}
        />

        {isSignup ? (
          <>
            <Button
              variant="contained"
              onClick={handleEmailSignup}
              sx={{
                backgroundColor: green,
                "&:hover": { backgroundColor: "#16302D" }
              }}
            >
              Sign Up
            </Button>

            <Button
              variant="text"
              onClick={() => setIsSignup(false)}
              sx={{ color: green }}
            >
              Already have an account? Login
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              onClick={handleEmailLogin}
              sx={{
                backgroundColor: green,
                "&:hover": { backgroundColor: "#16302D" }
              }}
            >
              Login
            </Button>

            <Button
              variant="text"
              onClick={() => setIsSignup(true)}
              sx={{ color: green }}
            >
              Don’t have an account? Sign Up
            </Button>
          </>
        )}

        <Button
          variant="contained"
          onClick={handleGoogleLogin}
          sx={{
            backgroundColor: green,
            color: "#fff",
            "&:hover": { backgroundColor: "#16302D" }
          }}
        >
          Sign in with Google
        </Button>
      </Stack>

      <Typography
        variant="h5"
        sx={{ mt: 4, fontWeight: 600, color: green }}
      >
        The only requirement for membership is a desire to stop using.
      </Typography>
    </Container>
  );
};

export default Login;
