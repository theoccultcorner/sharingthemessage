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
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
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
    } catch (e) {
      console.error("Profile update error:", e);
      alert("There was a problem saving your profile. Please try again.");
    } finally {
      setLoading(false);
    }
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
    return [...dayMilestones, ...yearMilestones]
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

  // Open confirmation dialog
  const openDeleteDialog = () => {
    setDeleteError("");
    setConfirmOpen(true);
  };

  const closeDeleteDialog = () => {
    setConfirmOpen(false);
  };

  // Perform account deletion: remove user doc + RTDB chats, then delete auth user
  const confirmDeleteAccount = async () => {
    setDeleteError("");
    setLoading(true);
    try {
      // 1) Remove RTDB chat history (optional, but recommended)
      await rtdbRemove(rtdbRef(rtdb, `na_chats/${user.uid}`)).catch(() => {});

      // 2) Remove Firestore user profile
      await deleteDoc(doc(db, "users", user.uid)).catch(() => {});

      // 3) Delete Auth user (may require recent login)
      await deleteUser(auth.currentUser);

      // If successful, user is removed; navigate to login (safety)
      navigate("/");
    } catch (err) {
      console.error("Delete account error:", err);
      if (err?.code === "auth/requires-recent-login") {
        setDeleteError("For your security, please log out and sign back in, then try deleting your account again.");
      } else {
        setDeleteError("We couldn’t delete your account. Please try again or contact support.");
      }
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bgcolor="#f0f0f0">
      <AppBar position="static" sx={{ backgroundColor: "#1F3F3A" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My NA Profile
          </Typography>

          {/* ✅ Delete button added in AppBar */}
          <Button 
            color="error" 
            variant="outlined"
            onClick={openDeleteDialog}
            startIcon={<DeleteForeverIcon />}
            sx={{ mr: 1 }}
          >
            Delete
          </Button>

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

              {/* Quick screen name edit shortcut when not in full edit mode */}
              {!editMode && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6">
                    {profileData.screenName || "Unnamed"}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    sx={{ color: "#1F3F3A", borderColor: "#1F3F3A" }}
                  >
                    Edit Screen Name
                  </Button>
                </Stack>
              )}

              {deleteError && (
                <Alert severity="error" sx={{ width: "100%" }}>
                  {deleteError}
                </Alert>
              )}

              {editMode ? (
                <Stack spacing={2} width="100%">
                  <TextField
                    label="Screen Name"
                    value={profileData.screenName}
                    onChange={handleChange("screenName")}
                    helperText="How others will see you"
                    fullWidth
                  />
                  <TextField
                    label="Clean Date"
                    type="date"
                    value={profileData.cleanDate}
                    onChange={handleChange("cleanDate")}
                    InputLabelProps={{ shrink: true }}
                    helperText="Your recovery start date"
                    fullWidth
                  />
                  <TextField
                    label="Sponsor Name"
                    value={profileData.sponsorName}
                    onChange={handleChange("sponsorName")}
                    helperText="Your NA sponsor's name"
                    fullWidth
                  />
                  <TextField
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={handleChange("phone")}
                    helperText="Tap-to-call contact info (optional)"
                    fullWidth
                  />
                  <TextField
                    label="Meeting Role"
                    value={profileData.meetingRole}
                    onChange={handleChange("meetingRole")}
                    helperText="E.g., Chairperson, Greeter, Secretary"
                    fullWidth
                  />
                  <TextField
                    label="Service Commitment"
                    value={profileData.serviceCommitment}
                    onChange={handleChange("serviceCommitment")}
                    helperText="E.g., Setup crew, Literature, Treasurer"
                    fullWidth
                  />
                  <TextField
                    label="Bio / Motto"
                    value={profileData.bio}
                    onChange={handleChange("bio")}
                    helperText="Personal message, motto, or quote"
                    fullWidth
                    multiline
                    minRows={3}
                  />

                  <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                        sx={{ backgroundColor: "#1F3F3A" }}
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditMode(false)}
                        sx={{ color: "#1F3F3A", borderColor: "#1F3F3A" }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={2} width="100%">
                  {profileData.screenName && (
                    <Typography>
                      <strong>Screen Name:</strong> {profileData.screenName}
                    </Typography>
                  )}

                  {profileData.cleanDate && (
                    <>
                      <Typography>
                        <strong>Clean Date:</strong>{" "}
                        {`${profileData.cleanDate} (${getDaysClean(profileData.cleanDate)} days clean)`}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {renderMilestones(getDaysClean(profileData.cleanDate))}
                      </Stack>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Next Anniversary in: {countdown}
                      </Typography>
                    </>
                  )}

                  {profileData.sponsorName && (
                    <Typography>
                      <strong>Sponsor:</strong> {profileData.sponsorName}
                    </Typography>
                  )}

                  {profileData.phone && (
                    <Typography>
                      <strong>Phone:</strong>{" "}
                      <Link href={`tel:${profileData.phone}`} underline="hover">
                        {profileData.phone}
                      </Link>
                    </Typography>
                  )}

                  {profileData.meetingRole && (
                    <Typography>
                      <strong>Meeting Role:</strong> {profileData.meetingRole}
                    </Typography>
                  )}

                  {profileData.serviceCommitment && (
                    <Typography>
                      <strong>Service Commitment:</strong> {profileData.serviceCommitment}
                    </Typography>
                  )}

                  {profileData.bio && (
                    <Typography>
                      <strong>Bio:</strong> {profileData.bio}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Button
                    variant="contained"
                    onClick={() => setEditMode(true)}
                    sx={{ backgroundColor: "#1F3F3A" }}
                    startIcon={<EditIcon />}
                  >
                    Edit Profile
                  </Button>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>

      <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={navValue}
          onChange={(event, newValue) => {
            setNavValue(newValue);
            if (newValue === 0) navigate("/meetings");
            if (newValue === 1) navigate("/chatroom");
            if (newValue === 2) navigate("/profile");
          }}
          sx={{
            backgroundColor: "#f5f5f5",
            "& .Mui-selected, & .Mui-selected > svg": {
              color: "#1F3F3A"
            }
          }}
        >
          <BottomNavigationAction label="Meetings" icon={<GroupIcon />} />
          <BottomNavigationAction label="Message Board" icon={<MessageIcon />} />
          <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
        </BottomNavigation>
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <Typography>
            Deleting your account will remove your profile and chat history. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={loading}>
            No
          </Button>
          <Button
            onClick={confirmDeleteAccount}
            color="error"
            variant="contained"
            startIcon={<DeleteForeverIcon />}
            disabled={loading}
          >
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
