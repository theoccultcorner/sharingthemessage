import React from "react";
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
  Stack
} from "@mui/material";
import GroupIcon from '@mui/icons-material/Group';
import MessageIcon from '@mui/icons-material/Message';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const Home = () => {
  const { user, screenName } = useAuth();
  const navigate = useNavigate();
  const [navValue, setNavValue] = React.useState(0);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <Box>
    <AppBar position="static" sx={{ backgroundColor: "#1F3F3A" }}>
  <Toolbar>
    <Typography variant="h6" sx={{ flexGrow: 1 }}>
      Sharing the Message - NA Group
    </Typography>
    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
      Logout
    </Button>
  </Toolbar>
</AppBar>


      <Container maxWidth="sm" sx={{ mt: 4, mb: 10 }}>
        <Typography variant="h4" gutterBottom>Welcome, {screenName || user?.displayName}!</Typography>
        <Typography variant="body1" gutterBottom>
          This is the home of the "Sharing the Message" group of Narcotics Anonymous.
        </Typography>

        <Stack spacing={2} sx={{ mt: 4 }}>
         <Button
  variant="contained"
  startIcon={<GroupIcon />}
  onClick={() => navigate("/meetings")}
  sx={{
    backgroundColor: "#1F3F3A",
    "&:hover": {
      backgroundColor: "#16302D"
    }
  }}
>
  Find a Meeting
</Button>

<Button
  variant="contained"
  startIcon={<MessageIcon />}
  sx={{
    backgroundColor: "#1F3F3A",
    "&:hover": {
      backgroundColor: "#16302D"
    }
  }}
>
  Message a Sponsor
</Button>

<Button
  variant="contained"
  startIcon={<AccountCircleIcon />}
  onClick={() => navigate("/profile")}
  sx={{
    backgroundColor: "#1F3F3A",
    "&:hover": {
      backgroundColor: "#16302D"
    }
  }}
>
  My Profile
</Button>

        </Stack>
      </Container>

 <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
  <BottomNavigation
    showLabels
    value={navValue}
    onChange={(event, newValue) => {
      setNavValue(newValue);
      if (newValue === 0) navigate("/meetings");
      if (newValue === 1) alert("Messaging not implemented yet");
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
    <BottomNavigationAction label="Messages" icon={<MessageIcon />} />
    <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
  </BottomNavigation>
</Paper>

    </Box>
  );
};

export default Home;
