// Additions are marked with ✅ comments

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth, rtdb } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref as rtdbRef, remove as rtdbRemove } from "firebase/database";
import { signOut, deleteUser } from "firebase/auth";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  Container,
  Stack,
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Chip,
  Link,
  Card,
  CardContent,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import MessageIcon from "@mui/icons-material/Message";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"; // ✅
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, screenName, setScreenName } = useAuth();
  const navigate = useNavigate();
  const [navValue, setNavValue] = useState(2);

  const [profileData, setProfileData] = useState({
    screenName: screenName || "",
    cleanDate: "",
    sponsorName: "",
    bio: "",
    phone: "",
    meetingRole: "",
    serviceCommitment: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ✅ Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setProfileData({
          screenName: data.screenName || "",
          cleanDate: data.cleanDate || "",
          sponsorName: data.sponsorName || "",
          bio: data.bio || "",
          phone: data.phone || "",
          meetingRole: data.meetingRole || "",
          serviceCommitment: data.serviceCommitment || ""
        });
      }
    };
    loadProfile();
  }, [user]);

  // ✅ Countdown calculation
  useEffect(() => {
    if (!profileData.cleanDate) return;
    const nextMilestone = getNextYearMilestone(profileData.cleanDate);
    const interval = setInterval(() => {
      const now = new Date();
      const remainingTime = nextMilestone - now;
      setCountdown(formatCountdown(remainingTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [profileData.cleanDate]);

  const getNextYearMilestone = (cleanDateString) => {
    const cleanDate = new Date(cleanDateString);
    const today = new Date();
    let nextAnniversary = new Date(cleanDate);
    nextAnniversary.setFullYear(cleanDate.getFullYear() + 1);
    while (nextAnniversary <= today) {
      nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1);
    }
    return nextAnniversary;
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return "0d 0h 0m 0s";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleChange = (field) => (e) => {
    setProfileData({ ...profileData, [field]: e.target.value });
  };

  const handleSave = async () => {
    if (!profileData.screenName.trim()) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, profileData);
      setScreenName(profileData.screenName);
      setEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const getDaysClean = (cleanDateString) => {
    const cleanDate = new Date(cleanDateString);
    const today = new Date();
    return Math.max(0, Math.floor((today - cleanDate) / (1000 * 60 * 60 * 24)));
  };

  const renderMilestones = (days) =>
    [30, 60, 90, 180, 365, ...Array.from({ length: 10 }, (_, i) => (i + 1) * 365)]
      .filter((m) => days >= m)
      .map((m) => (
        <Chip
          key={m}
          label={m < 365 ? `${m} Days Clean` : `${Math.floor(m / 365)} Year${m >= 730 ? "s" : ""} Clean`}
          color="success"
          variant="outlined"
          sx={{ mr: 1, mb: 1 }}
        />
      ));

  // ✅ Delete confirmation
  const openDeleteDialog = () => setConfirmOpen(true);
  const closeDeleteDialog = () => setConfirmOpen(false);

  const confirmDeleteAccount = async () => {
    setDeleteError("");
    setLoading(true);
    try {
      // delete chat data
      await rtdbRemove(rtdbRef(rtdb, `na_chats/${user.uid}`)).catch(() => {});
      // delete Firestore user
      await deleteDoc(doc(db, "users", user.uid)).catch(() => {});
      // delete user auth
      await deleteUser(auth.currentUser);
      navigate("/");
    } catch (err) {
      console.error(err);
      setDeleteError("Please log out and log in again, then retry.");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bgcolor="#f0f0f0">
      <AppBar position="static" sx={{ backgroundColor: "#1F3F3A" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>My NA Profile</Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4, mb: 10, flexGrow: 1 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={2}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: "#1F3F3A" }}>
                {profileData.screenName?.[0]?.toUpperCase() || "U"}
              </Avatar>

              {deleteError && <Alert severity="error">{deleteError}</Alert>}

              {editMode ? (
                <Stack spacing={2} width="100%">
                  <TextField
                    label="Screen Name"
                    value={profileData.screenName}
                    onChange={handleChange("screenName")}
                    fullWidth
                  />
                  {/* ... other fields */}
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={handleSave} disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={2} width="100%">
                  <Typography><strong>Screen Name:</strong> {profileData.screenName}</Typography>
                  {/* ... other info */}
                  <Divider />
                  <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Button
                      variant="contained"
                      onClick={() => setEditMode(true)}
                      startIcon={<EditIcon />}
                      sx={{ backgroundColor: "#1F3F3A" }}
                    >
                      Edit Profile
                    </Button>

                    {/* ✅ Delete Account Button */}
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteForeverIcon />}
                      onClick={openDeleteDialog}
                    >
                      Delete Account
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* Bottom Navigation */}
      <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={navValue}
          onChange={(e, newValue) => {
            setNavValue(newValue);
            if (newValue === 0) navigate("/meetings");
            if (newValue === 1) navigate("/chatroom");
            if (newValue === 2) navigate("/profile");
          }}
        >
          <BottomNavigationAction label="Meetings" icon={<GroupIcon />} />
          <BottomNavigationAction label="Message Board" icon={<MessageIcon />} />
          <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
        </BottomNavigation>
      </Paper>

      {/* ✅ Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <Typography>Deleting your account will remove your data permanently. This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>No</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteAccount} disabled={loading}>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
