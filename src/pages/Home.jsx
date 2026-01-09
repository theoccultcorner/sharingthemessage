import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GroupIcon from "@mui/icons-material/Group";
import MessageIcon from "@mui/icons-material/Message";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ArticleIcon from "@mui/icons-material/Article";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import PeopleIcon from "@mui/icons-material/People"; // Icon for Members

const Home = () => {
  const { user, screenName } = useAuth();
  const navigate = useNavigate();
  const [navValue, setNavValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    signOut(auth);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (path) => {
    setAnchorEl(null);
    if (path) navigate(path);
  };

  return (
<Box>
  <AppBar position="static" sx={{ backgroundColor: "#1F3F3A" }}>
    <Toolbar>
      {/* NA Logo */}
      <Box
        component="img"
        src={naLogo}
        alt="Narcotics Anonymous Logo"
        sx={{
          height: 40,
          width: "auto",
          mr: 2,
        }}
      />

      {/* Title */}
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Sharing the Message
      </Typography>

      {/* Logout */}
      <Button
        color="inherit"
        onClick={handleLogout}
        startIcon={<LogoutIcon />}
      >
        Logout
      </Button>
    </Toolbar>
  </AppBar>
</ 


      <Container maxWidth="sm" sx={{ mt: 4, mb: 10 }}>
        <Stack spacing={2} sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {screenName || user?.displayName}!
          </Typography>
          <Typography variant="body1" gutterBottom>
            To the "Sharing the Message" group of Narcotics Anonymous Community Homepage.
          </Typography>
          <Typography variant="h5" gutterBottom>
            NA Service Prayer
          </Typography>
          <Typography variant="body1" gutterBottom>
            GOD, grant us knowledge that we may serve according to Your Divine precepts.
            Instill in us a sense of Your purpose.
            Make us servants of Your will and grant us a bond of selflessness that this may truly
            be Your work, not ours, in order that no addict, anywhere, need die from the horrors
            of addiction.
          </Typography>

          <Button
            variant="contained"
            onClick={handleOpenMenu}
            sx={{ backgroundColor: "#1F3F3A", "&:hover": { backgroundColor: "#16302D" } }}
          >
            Navigate
          </Button>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleCloseMenu(null)}>
            <MenuItem onClick={() => handleCloseMenu("/meetings")}>
              <ListItemIcon><GroupIcon /></ListItemIcon>
              <ListItemText primary="Find a Meeting" />
            </MenuItem>
            <MenuItem onClick={() => handleCloseMenu("/phone-list")}>
              <ListItemIcon><MessageIcon /></ListItemIcon>
              <ListItemText primary="Phone List" />
            </MenuItem>
            <MenuItem onClick={() => handleCloseMenu("/service")}>
              <ListItemIcon><VolunteerActivismIcon /></ListItemIcon>
              <ListItemText primary="Service Opportunities" />
            </MenuItem>
            <MenuItem onClick={() => handleCloseMenu("/meditation")}>
              <ListItemIcon><ArticleIcon /></ListItemIcon>
              <ListItemText primary="JFT Meditation" />
            </MenuItem>
            <MenuItem
              component="a"
              href="https://na.org/daily-meditations/spad/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemIcon><OpenInNewIcon /></ListItemIcon>
              <ListItemText primary="SPAD Meditation" />
            </MenuItem>
            <MenuItem onClick={() => handleCloseMenu("/gsr-report")}>
              <ListItemIcon><ArticleIcon /></ListItemIcon>
              <ListItemText primary="STM GSR Report" />
            </MenuItem>
            <MenuItem onClick={() => handleCloseMenu("/audiobooks")}>
              <ListItemIcon><HeadphonesIcon /></ListItemIcon>
              <ListItemText primary="Audiobooks" />
            </MenuItem>
            <MenuItem onClick={() => handleCloseMenu("/members")}>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Members" />
            </MenuItem>
            <MenuItem onClick={() => handleCloseMenu("/sponsor-chat")}> {/* ✅ New Route */}
              <ListItemIcon><VolunteerActivismIcon /></ListItemIcon>
              <ListItemText primary="Sponsor Chat" />
            </MenuItem>
          </Menu>
        </Stack>
      </Container>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={navValue}
          onChange={(event, newValue) => {
            setNavValue(newValue);
            if (newValue === 0) navigate("/meetings");
            if (newValue === 1) navigate("/chatroom");
            if (newValue === 2) navigate("/profile");
            if (newValue === 3) navigate("/sponsor-chat"); // ✅ Optional Bottom Tab
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
          <BottomNavigationAction label="A.I. Sponsor" icon={<VolunteerActivismIcon />} /> {/* ✅ */}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default Home;
