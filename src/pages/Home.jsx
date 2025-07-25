import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Container,
  Button,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GroupIcon from "@mui/icons-material/Group";
import MessageIcon from "@mui/icons-material/Message";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ArticleIcon from "@mui/icons-material/Article";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChatIcon from "@mui/icons-material/Chat";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, screenName, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [navValue, setNavValue] = useState("home");

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (path) => {
    setAnchorEl(null);
    if (path) {
      navigate(path);
    }
  };

  const handleBottomNavChange = (event, newValue) => {
    setNavValue(newValue);
    if (newValue === "home") navigate("/home");
    else if (newValue === "chat") navigate("/chatroom");
    else if (newValue === "profile") navigate("/profile");
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Welcome, {screenName || "Friend"}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

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
      </Menu>

      <Container sx={{ marginTop: 4, marginBottom: 8 }}>
        <Typography variant="h4" gutterBottom>
          STM NA Home
        </Typography>
        <Typography variant="h6" gutterBottom>
          “One day at a time, one step at a time.” – NA Wisdom
        </Typography>
        <Typography variant="body1">
          Use the menu to navigate through the STM NA app.
        </Typography>
      </Container>

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation value={navValue} onChange={handleBottomNavChange}>
          <BottomNavigationAction
            label="Home"
            value="home"
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label="Chat"
            value="chat"
            icon={<ChatIcon />}
          />
          <BottomNavigationAction
            label="Profile"
            value="profile"
            icon={<AccountCircleIcon />}
          />
        </BottomNavigation>
      </Paper>
    </>
  );
};

export default Home;
