import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  AppBar, Avatar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Tooltip, Typography, useMediaQuery,
  BottomNavigation, BottomNavigationAction, Paper
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import ContactPhoneRoundedIcon from "@mui/icons-material/ContactPhoneRounded";
import HeadphonesRoundedIcon from "@mui/icons-material/HeadphonesRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useTheme } from "@mui/material/styles";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import naLogo from "../assets/images.gif";

const drawerWidth = 272;
const navItems = [
  ["Today", "/home", DashboardRoundedIcon],
  ["Meetings", "/meetings", GroupsRoundedIcon],
  ["Daily meditation", "/meditation", AutoStoriesRoundedIcon],
  ["Phone list", "/phone-list", ContactPhoneRoundedIcon],
  ["Audiobooks", "/audiobooks", HeadphonesRoundedIcon],
  ["Members", "/members", PersonRoundedIcon],
  ["GSR report", "/gsr-report", DescriptionRoundedIcon],
  ["Message board", "/chatroom", ForumRoundedIcon],
  ["M.A.T.T. sponsor", "/sponsor-chat", PsychologyRoundedIcon],
];

const pageTitles = Object.fromEntries(navItems.map(([label, path]) => [path, label]));

export default function AppShell({ children }) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { screenName, user } = useAuth();
  const current = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleNavigate = (path) => { navigate(path); setMobileMenuOpen(false); };

  const navigation = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1, py: 1.5 }}>
        <Box component="img" src={naLogo} alt="" sx={{ width: 46, height: 46, objectFit: "contain", filter: "grayscale(1) brightness(3)" }} />
        <Box>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.15 }}>Sharing the Message</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,.62)" }}>Recovery community</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,.1)", my: 1.5 }} />
      <List sx={{ display: "grid", gap: .35 }}>
        {navItems.map(([label, path, Icon]) => (
          <ListItemButton
            key={path}
            selected={current === path}
            onClick={() => handleNavigate(path)}
            sx={{ borderRadius: 2.5, minHeight: 46, color: "rgba(255,255,255,.78)", "& .MuiListItemIcon-root": { color: "inherit", minWidth: 40 }, "&.Mui-selected": { color: "#fff", bgcolor: "rgba(255,255,255,.13)", "&:hover": { bgcolor: "rgba(255,255,255,.17)" } } }}
          >
            <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: current === path ? 700 : 550 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: "auto", p: 1 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,.1)", mb: 2 }} />
        <Button onClick={() => handleNavigate("/profile")} fullWidth sx={{ color: "#fff", justifyContent: "flex-start", px: 1, gap: 1.25 }}>
          <Avatar src={user?.photoURL || undefined} sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontSize: 14 }}>{screenName?.[0]?.toUpperCase()}</Avatar>
          <Box sx={{ textAlign: "left", minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{screenName || "My profile"}</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,.58)" }}>View profile</Typography>
          </Box>
        </Button>
      </Box>
    </Box>
  );

  const mobilePrimary = navItems.slice(0, 3);
  return (
    <Box sx={{ minHeight: "100vh" }}>
      {desktop ? (
        <Drawer variant="permanent" sx={{ width: drawerWidth, "& .MuiDrawer-paper": { width: drawerWidth, border: 0, color: "#fff", bgcolor: "primary.dark", backgroundImage: "radial-gradient(circle at 20% 0%, rgba(75,142,126,.32), transparent 36%)" } }}>{navigation}</Drawer>
      ) : (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: "rgba(243,245,241,.92)", color: "text.primary", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(21,63,58,.08)" }}>
          <Toolbar>
            <IconButton onClick={() => setMobileMenuOpen(true)} aria-label="Open all sections" sx={{ mr: .5 }}><MenuRoundedIcon /></IconButton>
            <Box component="img" src={naLogo} alt="" sx={{ width: 36, height: 36, objectFit: "contain", mr: 1.25 }} />
            <Box sx={{ flex: 1 }}><Typography variant="caption" color="text.secondary">Sharing the Message</Typography><Typography sx={{ fontWeight: 750, lineHeight: 1.15 }}>{pageTitles[current] || "Community"}</Typography></Box>
            <Tooltip title="Sign out"><IconButton onClick={() => signOut(auth)} aria-label="Sign out"><LogoutRoundedIcon /></IconButton></Tooltip>
          </Toolbar>
        </AppBar>
      )}

      {!desktop && (
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: "min(86vw, 300px)", border: 0, color: "#fff", bgcolor: "primary.dark", backgroundImage: "radial-gradient(circle at 20% 0%, rgba(75,142,126,.32), transparent 36%)" } }}
        >
          {navigation}
        </Drawer>
      )}

      <Box component="main" sx={{ ml: desktop ? `${drawerWidth}px` : 0, pb: desktop ? 4 : 11, minHeight: "100vh" }}>
        {desktop && (
          <Box sx={{ height: 72, px: { md: 4, lg: 6 }, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(21,63,58,.08)", bgcolor: "rgba(255,255,255,.55)" }}>
            <Typography variant="h6">{pageTitles[current] || "Sharing the Message"}</Typography>
            <Tooltip title="Sign out"><IconButton onClick={() => signOut(auth)} aria-label="Sign out"><LogoutRoundedIcon /></IconButton></Tooltip>
          </Box>
        )}
        {children}
      </Box>

      {!desktop && (
        <Paper elevation={8} sx={{ position: "fixed", inset: "auto 0 0", zIndex: 1200, borderRadius: "18px 18px 0 0", overflow: "hidden" }}>
          <BottomNavigation showLabels value={[...mobilePrimary.map(x => x[1]), "/profile", "/sponsor-chat"].includes(current) ? current : false} onChange={(_, value) => navigate(value)} sx={{ height: 72 }}>
            {mobilePrimary.map(([label, path, Icon]) => <BottomNavigationAction key={path} value={path} label={label === "Daily meditation" ? "Meditate" : label} icon={<Icon />} />)}
            <BottomNavigationAction value="/sponsor-chat" label="Sponsor" icon={<PsychologyRoundedIcon />} />
            <BottomNavigationAction value="/profile" label="Profile" icon={<PersonRoundedIcon />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
