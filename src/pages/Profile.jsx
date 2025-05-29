import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
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
  Chip
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import MessageIcon from "@mui/icons-material/Message";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, screenName, setScreenName } = useAuth();
  const navigate = useNavigate();
  const [navValue, setNavValue] = useState(2);

  const [profileData, setProfileData] = useState({
    screenName: screenName || "",
    cleanDate: "",
    sponsorName: "",
    bio: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

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
          bio: data.bio || ""
        });
      }
    };
    loadProfile();
  }, [user]);

  const handleChange = (field) => (e) => {
    setProfileData({ ...profileData, [field]: e.target.value });
  };

  const handleSave = async () => {
    if (!profileData.screenName.trim()) return;
    setLoading(true);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, profileData);
    setScreenName(profileData.screenName);
    setLoading(false);
    setEditMode(false);
    alert("Profile updated.");
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const getDaysClean = (cleanDateString) => {
    const cleanDate = new Date(cleanDateString);
    const today = new Date();
    const diffTime = today - cleanDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const renderMilestones = (days) => {
    const dayMilestones = [30, 60, 90, 180, 365];
    const yearMilestones = Array.from({ length: 10 }, (_, i) => (i + 1) * 365);
    const allMilestones = [...dayMilestones, ...yearMilestones];

    return allMilestones
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
  };

  return (
    <Box>
      {/* Top AppBar */}
      <AppBar position="static"sx={{ backgroundColor: "#1F3F3A" }} >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My NA Profile
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: 4, mb: 10 }}>
        {editMode ? (
          <Stack spacing={2} mt={3}>
            <TextField
              label="Screen Name"
              value={profileData.screenName}
              onChange={handleChange("screenName")}
              fullWidth
            />
            <TextField
              label="Clean Date"
              type="date"
              value={profileData.cleanDate}
              onChange={handleChange("cleanDate")}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Sponsor Name"
              value={profileData.sponsorName}
              onChange={handleChange("sponsorName")}
              fullWidth
            />
            <TextField
              label="Personal Motto / Bio"
              value={profileData.bio}
              onChange={handleChange("bio")}
              fullWidth
              multiline
              minRows={3}
            />
       <Stack direction="row" spacing={2}>
  <Button
    variant="contained"
    onClick={handleSave}
    disabled={loading}
    sx={{
      backgroundColor: "#1F3F3A",
      "&:hover": {
        backgroundColor: "#16302D"
      }
    }}
  >
    {loading ? "Saving..." : "Save"}
  </Button>
  <Button
    variant="outlined"
    onClick={() => setEditMode(false)}
    sx={{
      color: "#1F3F3A",
      borderColor: "#1F3F3A",
      "&:hover": {
        backgroundColor: "#f1f1f1",
        borderColor: "#16302D",
        color: "#16302D"
      }
    }}
  >
    Cancel
  </Button>
</Stack>

          </Stack>
        ) : (
          <Stack spacing={2} mt={3}>
            <Typography><strong>Screen Name:</strong> {profileData.screenName}</Typography>
            <Typography>
              <strong>Clean Date:</strong>{" "}
              {profileData.cleanDate
                ? `${profileData.cleanDate} (${getDaysClean(profileData.cleanDate)} days clean)`
                : "Not set"}
            </Typography>
            {profileData.cleanDate && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {renderMilestones(getDaysClean(profileData.cleanDate))}
              </Stack>
            )}
            <Typography><strong>Sponsor:</strong> {profileData.sponsorName || "Not set"}</Typography>
            <Typography><strong>Bio:</strong> {profileData.bio || "No bio provided"}</Typography>
           <Button
  variant="contained"
  onClick={() => setEditMode(true)}
  sx={{
    backgroundColor: "#1F3F3A",
    "&:hover": {
      backgroundColor: "#16302D"
    }
  }}
>
  Edit Profile
</Button>
          </Stack>
        )}
      </Container>

      {/* Bottom Navigation */}
      <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={navValue}
          
          onChange={(event, newValue) => {
            setNavValue(newValue);
            if (newValue === 0) navigate("/meetings");
            if (newValue === 1) alert("Messaging not implemented yet");
            if (newValue === 2) navigate("/profile");
          }}
        >
          <BottomNavigationAction label="Meetings" icon={<GroupIcon />} />
          <BottomNavigationAction label="Messages" icon={<MessageIcon />} />
          <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default Profile;
