import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, Button, Card, CardActionArea, CardContent, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import ContactPhoneRoundedIcon from "@mui/icons-material/ContactPhoneRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";

const actions = [
  { title: "Find a meeting", detail: "Today's local and regional schedule", path: "/meetings", icon: GroupsRoundedIcon, tone: "#dcece6" },
  { title: "Daily meditation", detail: "A quiet moment for today", path: "/meditation", icon: AutoStoriesRoundedIcon, tone: "#f7e8d2" },
  { title: "Call the fellowship", detail: "Reach someone in your community", path: "/phone-list", icon: ContactPhoneRoundedIcon, tone: "#e2e8f4" },
  { title: "Talk with M.A.T.T.", detail: "Private AI-powered recovery support", path: "/sponsor-chat", icon: PsychologyRoundedIcon, tone: "#e9e2f3" },
];

export default function Home() {
  const { screenName, user } = useAuth();
  const navigate = useNavigate();
  const firstName = (screenName || user?.displayName || "friend").split(" ")[0];
  const date = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const todayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: { xs: 3, md: 5 } }}>
      <Box sx={{ mb: 4 }}>
        <Chip label={date} size="small" sx={{ mb: 1.5, bgcolor: "primary.light", color: "primary.dark", fontWeight: 700 }} />
        <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "2.75rem" } }}>Welcome back, {firstName}.</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: "1rem", md: "1.08rem" } }}>Everything you need for today, in one place.</Typography>
      </Box>
      <Grid container spacing={2.25} sx={{ mb: 3 }}>
        {actions.map(({ title, detail, path, icon: Icon, tone }) => (
          <Grid item xs={12} sm={6} lg={3} key={path}>
            <Card sx={{ height: "100%", transition: "transform .2s ease, box-shadow .2s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 18px 42px rgba(25,55,49,.13)" } }}>
              <CardActionArea onClick={() => navigate(path)} sx={{ height: "100%", p: .5 }}>
                <CardContent>
                  <Box sx={{ width: 48, height: 48, display: "grid", placeItems: "center", bgcolor: tone, borderRadius: 3, color: "primary.dark", mb: 2.5 }}><Icon /></Box>
                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: .6 }}>{detail}</Typography>
                  <ArrowForwardRoundedIcon sx={{ mt: 2.5, color: "primary.main" }} />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.25}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
                <Box><Typography variant="overline" color="secondary.dark" sx={{ fontWeight: 800, letterSpacing: ".12em" }}>TODAY</Typography><Typography variant="h5">{todayName} at STM</Typography></Box>
                <Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/meetings")}>Full schedule</Button>
              </Stack>
              {["12:00 PM", "8:00 PM"].map((time) => (
                <Stack key={time} direction="row" spacing={2} alignItems="center" sx={{ py: 2, borderTop: "1px solid rgba(21,63,58,.09)" }}>
                  <Typography sx={{ minWidth: 88, fontWeight: 800, color: "primary.main" }}>{time}</Typography>
                  <Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 700 }}>Sharing the Message</Typography><Typography variant="body2" color="text.secondary"><PlaceRoundedIcon sx={{ fontSize: 15, verticalAlign: "-2px", mr: .4 }} />Suite D · Santa Maria</Typography></Box>
                  <Button variant="outlined" size="small" onClick={() => navigate("/meetings")}>Details</Button>
                </Stack>
              ))}
              <Box sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: "#f4f7f5", display: "flex", gap: 1.5, alignItems: "center" }}>
                <ForumRoundedIcon color="primary" /><Typography variant="body2" sx={{ flex: 1 }}>Need to connect? The fellowship phone list is one tap away.</Typography><Button size="small" onClick={() => navigate("/phone-list")}>Open</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%", color: "#fff", bgcolor: "primary.dark", backgroundImage: "radial-gradient(circle at 90% 0%, rgba(81,151,132,.38), transparent 42%)" }}>
            <CardContent sx={{ p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="overline" sx={{ color: "#e9bd7f", fontWeight: 800, letterSpacing: ".13em" }}>NA SERVICE PRAYER</Typography>
              <Typography variant="h5" sx={{ mt: 2, fontFamily: "Georgia, serif", fontWeight: 500, lineHeight: 1.5 }}>“God, grant us knowledge that we may serve according to Your Divine precepts.”</Typography>
              <Typography sx={{ mt: 2, color: "rgba(255,255,255,.68)", lineHeight: 1.75 }}>Instill in us a sense of Your purpose. Make us servants of Your will and grant us a bond of selflessness that this may truly be Your work, not ours, in order that no addict, anywhere, need die from the horrors of addiction.</Typography>
              <Typography variant="caption" sx={{ mt: "auto", pt: 3, color: "rgba(255,255,255,.48)", letterSpacing: ".08em" }}>JUST FOR TODAY</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
