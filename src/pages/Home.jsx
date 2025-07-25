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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GroupIcon from "@mui/icons-material/Group";
import MessageIcon from "@mui/icons-material/Message";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ArticleIcon from "@mui/icons-material/Article";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, screenName, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (path) => {
    setAnchorEl(null);
    if (path) {
      navigate(path);
    }
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
        <MenuItem component="a" href="https://na.org/daily-meditations/spad/" target="_blank">
          <ListItemIcon><OpenInNewIcon /></ListItemIcon>
          <ListItemText primary="SPAD Meditation" />
        </MenuItem>
        <MenuItem onClick={() => handleCloseMenu("/gsr-report")}>
          <ListItemIcon><ArticleIcon /></ListItemIcon>
          <ListItemText primary="STM GSR Report" />
        </MenuItem>
        <MenuItem onClick={() => handleCloseMenu("/audiobooks")}>
          <ListItemIcon><ArticleIcon /></ListItemIcon>
          <ListItemText primary="Audiobooks" />
        </MenuItem>
      </Menu>

      <Container sx={{ marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          STM NA Home
        </Typography>
        <Typography variant="body1">
          Use the menu to navigate through the STM NA app.
        </Typography>
      </Container>
    </>
  );
};

export default Home;
