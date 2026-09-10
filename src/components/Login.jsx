import React, { useState } from "react";
import { auth, provider, db } from "../firebase";
import { signInWithPopup, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Alert, Box, Button, CircularProgress, Container, Divider, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import naLogo from "../assets/images.gif";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const finishLogin = async (result) => {
    const userRef = doc(db, "users", result.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) await setDoc(userRef, { screenName: "", email: result.user.email, photoURL: result.user.photoURL || "", role: "member" });
    else if (result.user.photoURL && snap.data().photoURL !== result.user.photoURL) await setDoc(userRef, { photoURL: result.user.photoURL }, { merge: true });
    const screenName = snap.exists() ? snap.data().screenName : "";
    navigate(screenName?.trim() ? "/home" : "/create-screen-name");
  };

  const run = async (action) => {
    setBusy(true); setError("");
    try { await setPersistence(auth, browserLocalPersistence); await action(); }
    catch (err) { setError(err?.message?.replace("Firebase: ", "") || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };
  const handleGoogle = () => run(async () => finishLogin(await signInWithPopup(auth, provider)));
  const handleEmail = () => run(async () => {
    if (!email || !password) throw new Error("Enter your email and password.");
    if (isSignup) { const result = await createUserWithEmailAndPassword(auth, email, password); await setDoc(doc(db, "users", result.user.uid), { screenName: "", email: result.user.email, photoURL: "", role: "member" }); navigate("/create-screen-name"); }
    else await finishLogin(await signInWithEmailAndPassword(auth, email, password));
  });

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: { xs: 2, md: 4 }, bgcolor: "primary.dark", backgroundImage: "radial-gradient(circle at 12% 8%, rgba(81,151,132,.42), transparent 32%), radial-gradient(circle at 90% 90%, rgba(201,130,50,.16), transparent 30%)" }}>
      <Container maxWidth="lg" disableGutters>
        <Paper sx={{ overflow: "hidden", borderRadius: { xs: 4, md: 5 }, boxShadow: "0 28px 80px rgba(0,0,0,.28)", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr .95fr" } }}>
          <Box sx={{ p: { xs: 3, sm: 5, md: 7 }, color: "#fff", bgcolor: "primary.main", display: { xs: "none", md: "flex" }, flexDirection: "column", minHeight: 650, position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", width: 420, height: 420, border: "1px solid rgba(255,255,255,.09)", borderRadius: "50%", right: -180, bottom: -170 }} />
            <Stack direction="row" spacing={1.5} alignItems="center"><Box component="img" src={naLogo} alt="Narcotics Anonymous" sx={{ width: 58, height: 58, objectFit: "contain", filter: "grayscale(1) brightness(3)" }} /><Typography sx={{ fontWeight: 800, fontSize: 18 }}>Sharing the Message</Typography></Stack>
            <Box sx={{ my: "auto", maxWidth: 470 }}><Typography variant="h2" sx={{ fontSize: "3.4rem", lineHeight: 1.02 }}>Recovery grows through connection.</Typography><Typography sx={{ mt: 3, fontSize: "1.08rem", color: "rgba(255,255,255,.72)", maxWidth: 420 }}>Meetings, fellowship, daily readings, and support from the Sharing the Message community.</Typography></Box>
            <Typography sx={{ color: "rgba(255,255,255,.58)", fontFamily: "Georgia, serif" }}>“The only requirement for membership is a desire to stop using.”</Typography>
          </Box>
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleEmail(); }} sx={{ p: { xs: 3, sm: 5, md: 7 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ display: { md: "none" }, mb: 4 }}><Box component="img" src={naLogo} alt="" sx={{ width: 44, height: 44 }} /><Typography sx={{ fontWeight: 800 }}>Sharing the Message</Typography></Stack>
            <Typography variant="h4">{isSignup ? "Join the community" : "Welcome back"}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3.5 }}>{isSignup ? "Create a private member account." : "Sign in to continue your recovery journey."}</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Stack spacing={2}>
              <TextField label="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField label="Password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} fullWidth InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(v => !v)} edge="end" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment> }} />
              <Button type="submit" variant="contained" size="large" endIcon={busy ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />} disabled={busy}>{isSignup ? "Create account" : "Sign in"}</Button>
            </Stack>
            <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">OR CONTINUE WITH</Typography></Divider>
            <Button variant="outlined" size="large" startIcon={<GoogleIcon />} onClick={handleGoogle} disabled={busy}>Google</Button>
            <Typography align="center" variant="body2" color="text.secondary" sx={{ mt: 3 }}>{isSignup ? "Already a member?" : "New to the community?"} <Button size="small" onClick={() => { setIsSignup(v => !v); setError(""); }}>{isSignup ? "Sign in" : "Create an account"}</Button></Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
