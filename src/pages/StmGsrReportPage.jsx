import React, { useEffect } from "react";
import { Alert, Box, Chip, Container, Grid, Link, List, ListItem, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

const sections = [
  { title: "Service positions", icon: WorkOutlineRoundedIcon, items: [
    "STM group positions open: Vice-Chair, GSR, and Literature.",
    "Thursday noon and Sunday 8 PM secretary positions are open.",
    "Greeters, coffee persons, and Meeting Service Representatives are needed for all STM meetings."
  ]},
  { title: "Meeting news", icon: CampaignRoundedIcon, items: [
    "Guad Squad: Wednesday at 7 PM, 4635 6th Street.",
    "Survivors Birthday/Speaker Meeting: Saturday, December 20 — Glenn S.",
    "STM Birthday/Speaker Meeting: December 27 at 8 PM — Kila.",
    "STM Activities Committee meets January 10 at 9 AM; Group Service meets at 10 AM. Meeting secretaries are asked to attend."
  ]},
  { title: "Activities", icon: CelebrationRoundedIcon, items: [
    "SBNA Deck the Halls: December 20, 3–10 PM at 235 E. Cota St., Santa Barbara. Presale tickets: $30.",
    "STM New Year Speaker Bash: December 31. Speakers begin at 1:30 PM, dinner and karaoke run 6–8 PM, the evening speaker begins at 8 PM, and dancing runs 9 PM–12:30 AM.",
    "The New Year event is free. Dinner plates are $10; children eat free."
  ]},
  { title: "Community announcements", icon: PublicRoundedIcon, items: [
    "Please donate new, unused toys for the STM toy drive.",
    "Spanish NA literature and STM gear are available; order information is posted at the meeting.",
    "Celebrating a milestone? Add your name, clean date, and clean time to the board.",
    "Public Relations, Hospitals & Institutions, and Behind the Walls Sponsorship need volunteers."
  ]}
];

export default function GSRReport() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-end" }} spacing={2} sx={{ mb: 3 }}>
        <Box><Typography variant="overline" color="secondary.dark" sx={{ fontWeight: 800, letterSpacing: ".12em" }}>GROUP SERVICE REPRESENTATIVE</Typography><Typography variant="h4">STM GSR report</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Group business, opportunities, events, and fellowship updates.</Typography></Box>
        <Chip label="December 2025" sx={{ bgcolor: "primary.light", color: "primary.dark", fontWeight: 750 }} />
      </Stack>
      <Alert severity="info" sx={{ mb: 3 }}>This is the latest report currently posted in the app. Confirm dates with the meeting before attending an event.</Alert>
      <Grid container spacing={2.5}>
        {sections.map(({ title, icon: Icon, items }) => (
          <Grid item xs={12} md={6} key={title}>
            <Paper component="section" elevation={0} sx={{ height: "100%", p: { xs: 2.5, md: 3.5 }, border: "1px solid rgba(21,63,58,.1)" }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}><Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 2.5, bgcolor: "primary.light", color: "primary.dark" }}><Icon /></Box><Typography variant="h5">{title}</Typography></Stack>
              <List disablePadding>
                {items.map((item) => <ListItem key={item} alignItems="flex-start" sx={{ px: 0, py: 1 }}><ListItemIcon sx={{ minWidth: 32, pt: .3 }}><CheckCircleOutlineRoundedIcon color="primary" sx={{ fontSize: 19 }} /></ListItemIcon><ListItemText primary={item} primaryTypographyProps={{ variant: "body2", lineHeight: 1.65 }} /></ListItem>)}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={0} sx={{ mt: 2.5, p: 2.5, border: "1px solid rgba(21,63,58,.1)", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <PublicRoundedIcon color="primary" /><Box sx={{ flex: 1, minWidth: 220 }}><Typography sx={{ fontWeight: 750 }}>Central Coast NA</Typography><Typography variant="body2" color="text.secondary">Find current regional information and announcements.</Typography></Box>
        <Link href="https://centralcoastna.org" target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 750, display: "inline-flex", alignItems: "center", gap: .5 }}>Visit website <OpenInNewRoundedIcon fontSize="small" /></Link>
      </Paper>
    </Container>
  );
}
