import React, { useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Container, InputAdornment, Link, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

const m = (time, name, location, details = "", online = false) => ({ time, name, location, details, online });
const schedule = {
  Sunday: [
    m("8:30 AM", "Men's Stag", "420 Soares Ave., Orcutt"),
    m("9:00 AM", "Central Coast Breakfast", "Zoom 676 712 4068 · Destiny", "First Sunday is a speaker meeting", true),
    m("9:00 AM", "Destiny Group", "119 N. D St., Lompoc"),
    m("9:00 AM", "New Attitudes Men's Stag", "129 N. I St. #E, Lompoc"),
    m("9:00 AM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("12:00 PM", "Cambria New Attitudes", "1069 Main St. (upstairs), Cambria · Zoom 833 1106 2708", "Hybrid meeting", true),
    m("12:00 PM", "Santa Maria Survivors Men's Stag", "605 E. Chapel St., Santa Maria"),
    m("6:00 PM", "The Hope Circle", "3850 Ramada Dr. #D4, Paso Robles", "Last Sunday birthday meeting · No smoking"),
    m("6:00 PM", "Sunday Night Serenity", "5318 Palma Ave., Atascadero"),
    m("6:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria"),
    m("7:00 PM", "New Attitudes", "129 N. I St. #E, Lompoc"),
    m("7:00 PM", "SPAD Flip Meeting of the JFT Group", "3075 Broad St., San Luis Obispo"),
    m("7:00 PM", "Five Cities Group", "900 N. Oak Park Blvd., Arroyo Grande"),
    m("7:00 PM", "Hedgehog Group - Flip Tag", "Zoom 829 6898 6495 · hedgehog", "First Sunday speaker meeting", true),
    m("8:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available")
  ],
  Monday: [
    m("9:00 AM", "Central Coast Breakfast", "Zoom 676 712 4068 · Destiny", "", true),
    m("9:00 AM", "Destiny Group", "119 N. D St., Lompoc"),
    m("12:00 PM", "Five Cities Group", "Calvary Chapel, 1133 Maple St., Arroyo Grande"),
    m("12:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("12:00 PM", "Paso Robles Noon", "600 Nickerson Dr., White Oak Room, Paso Robles"),
    m("12:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria"),
    m("6:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria", "Book study"),
    m("6:30 PM", "Give It Away Men's", "5850 Rosario Ave., Atascadero"),
    m("6:30 PM", "SOS Women's Meeting", "7770 Morro Rd., Suite 108, Atascadero"),
    m("6:30 PM", "Tuesday Hard Knocks", "530 12th St., Paso Robles"),
    m("7:00 PM", "Young and Cool", "8600 Atascadero Ave., Atascadero"),
    m("7:00 PM", "New Attitudes", "129 N. I St. #E, Lompoc", "Book study"),
    m("7:00 PM", "Just for Today", "3075 Broad St., San Luis Obispo"),
    m("7:00 PM", "Five Cities Group", "990 Dolliver St., Pismo Beach", "Book study"),
    m("7:00 PM", "Orcutt Reconnections", "420 Soares Ave., Orcutt", "Closed meeting"),
    m("7:00 PM", "Hedgehog Group - Flip Tag", "Zoom 829 6898 6495 · hedgehog", "", true),
    m("8:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available")
  ],
  Tuesday: [
    m("9:00 AM", "Central Coast Breakfast", "Zoom 676 712 4068 · Destiny", "", true),
    m("9:00 AM", "Destiny Group", "119 N. D St., Lompoc"),
    m("12:00 PM", "Paso Robles Noon", "600 Nickerson Dr., Paso Robles", "Meeting outside"),
    m("12:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria"),
    m("12:00 PM", "New Attitudes", "129 N. I St. #E, Lompoc"),
    m("12:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria"),
    m("6:00 PM", "Five Cities Women's Meeting", "990 Dolliver St., Pismo Beach"),
    m("6:00 PM", "Simple Recovery", "5850 Rosario Ave., Atascadero", "Birthday speaker meeting on the third Tuesday"),
    m("6:00 PM", "Santa Maria Survivors Women's Meeting", "605 E. Chapel St., Santa Maria"),
    m("6:30 PM", "Sharing the Message Men's", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("6:30 PM", "Tuesday Hard Knocks", "530 12th St., Paso Robles"),
    m("7:00 PM", "New Attitudes", "129 N. I St. #E, Lompoc"),
    m("7:00 PM", "Five Cities Birthday Speaker Meeting", "Hope Church, 900 N. Oak Park, Arroyo Grande", "Last Tuesday only"),
    m("7:00 PM", "No Nonsense", "1701 Fredericks St., San Luis Obispo", "Closed stick meeting"),
    m("7:00 PM", "Hedgehog Group - Flip Tag", "Zoom 829 6898 6495 · hedgehog", "", true),
    m("7:30 PM", "Five Cities Group Men's", "Hope Church, 900 N. Oak Park, Arroyo Grande"),
    m("8:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("8:00 PM", "Addicts With Options", "605 E. Chapel St., Santa Maria")
  ],
  Wednesday: [
    m("9:00 AM", "Central Coast Breakfast", "Zoom 676 712 4068 · Destiny", "", true),
    m("9:00 AM", "Destiny Group", "119 N. D St., Lompoc"),
    m("12:00 PM", "Five Cities Group", "Calvary Chapel, 1133 Maple St., Arroyo Grande"),
    m("12:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("12:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria"),
    m("12:00 PM", "Paso Robles Noon", "600 Nickerson Dr., White Oak Room, Paso Robles"),
    m("6:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria", "Last Wednesday birthday speaker meeting"),
    m("6:30 PM", "Hard Knocks Sweets & Treats", "530 12th St., Paso Robles"),
    m("7:00 PM", "Guad Squad's Greatest Hits", "4635 6th St., Guadalupe"),
    m("7:00 PM", "Men's Gryphon Meeting", "1825 San Ramon Rd., Atascadero"),
    m("7:00 PM", "New Attitudes", "129 N. I St. #E, Lompoc", "Book study"),
    m("7:00 PM", "Hedgehog Group - Flip Tag", "Zoom 829 6898 6495 · hedgehog", "", true),
    m("7:00 PM", "Rockstar Recovery", "2939 Augusta St., San Luis Obispo", "Last Wednesday birthday meeting"),
    m("8:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available")
  ],
  Thursday: [
    m("9:00 AM", "Central Coast Breakfast", "Zoom 676 712 4068 · Destiny", "", true),
    m("9:00 AM", "Destiny Group", "119 N. D St., Lompoc"),
    m("12:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("12:00 PM", "Paso Robles Noon", "600 Nickerson Dr., Paso Robles", "Meeting outside"),
    m("12:00 PM", "Paso Hard Knocks", "Zoom 863 895 38108 · Hardknocks", "", true),
    m("12:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria"),
    m("6:00 PM", "Moment of Silence Women's Meeting", "915 Creston Rd., Paso Robles", "Candlelight · Closed meeting"),
    m("6:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria"),
    m("7:00 PM", "Five Cities Group", "933 Ramona Ave., Grover Beach"),
    m("7:00 PM", "New Attitudes", "129 N. I St. #E, Lompoc"),
    m("7:00 PM", "Hedgehog Group - Flip Tag", "Zoom 829 6898 6495 · hedgehog", "", true),
    m("7:15 PM", "NA Stick Meeting", "Hope Lutheran Church, 8005 San Gabriel Rd., Atascadero", "First Thursday potluck bonfire at 4545 Miramon Ave., Atascadero"),
    m("7:30 PM", "Off the Rock", "710 Harbor St., Morro Bay", "Closed · Candlelight · No smoking"),
    m("8:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("8:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria")
  ],
  Friday: [
    m("9:00 AM", "Central Coast Breakfast", "Zoom 676 712 4068 · Destiny", "", true),
    m("9:00 AM", "Destiny Group", "119 N. D St., Lompoc"),
    m("12:00 PM", "Paso Robles Noon", "600 Nickerson Dr., White Oak Room, Paso Robles"),
    m("12:00 PM", "New Attitudes", "129 N. I St. #E, Lompoc"),
    m("12:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("12:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria"),
    m("12:00 PM", "Five Cities Group", "Calvary Chapel, 1133 Maple St., Arroyo Grande"),
    m("12:00 PM", "Alcohol Is a Drug", "1609 Main St., Cambria · Zoom 839 9812 4616", "Virtual · No password", true),
    m("5:30 PM", "The Rainbow Connection Group", "Universalist Church of SLO, 2201 Lawton Ave., San Luis Obispo", "LGBTQ+"),
    m("6:00 PM", "Just for Today", "Plymouth Church, 1301 Oak St., Paso Robles", "Enter on 13th St. · Dark on the third Friday"),
    m("6:00 PM", "New Attitudes Women's Meeting", "Solutions in Recovery, 129 N. I St. #E, Lompoc", "Last Friday birthday meeting"),
    m("7:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria", "Closed meeting"),
    m("7:00 PM", "Friday Night Freedom", "8600 Atascadero Ave., Atascadero", "Third Friday birthday meeting"),
    m("7:00 PM", "Just for Today", "3075 Broad St., San Luis Obispo"),
    m("7:00 PM", "Hedgehog JFT Flip Tag", "Zoom 829 6898 6495 · hedgehog", "", true),
    m("8:00 PM", "Sharing the Message - Candlelight", "209 W. Main St., Suite D, Santa Maria", "Literature discussion · Behind the thrift store upstairs; elevator available"),
    m("8:00 PM", "New Attitudes", "129 N. I St. #E, Lompoc")
  ],
  Saturday: [
    m("7:00 AM", "New Attitudes", "129 N. I St. #E, Lompoc"),
    m("7:30 AM", "Saturday Wakeup", "5318 Palma Ave., Atascadero", "Meets in the undercroft room"),
    m("8:00 AM", "Santa Maria Survivors Morning Wake Up Call", "605 E. Chapel St., Santa Maria"),
    m("9:00 AM", "Central Coast Breakfast", "Zoom 676 712 4068 · Destiny", "", true),
    m("9:00 AM", "Santa Maria Survivors Stick Meeting", "605 E. Chapel St., Santa Maria"),
    m("9:00 AM", "Destiny Group", "119 N. D St., Lompoc"),
    m("12:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("4:00 PM", "Sharing the Message Women's Meeting", "209 W. Main St., Suite D, Santa Maria", "Behind the thrift store upstairs; elevator available"),
    m("6:00 PM", "Santa Maria Survivors", "605 E. Chapel St., Santa Maria", "Third Saturday birthday speaker meeting"),
    m("6:00 PM", "New Attitudes", "129 N. I St. #E, Lompoc"),
    m("6:30 PM", "Saturday Hard Knocks", "530 12th St., Paso Robles"),
    m("7:00 PM", "Keep It Simple", "3075 Broad St., San Luis Obispo", "Speaker meeting"),
    m("7:00 PM", "Hedgehog JFT Flip Tag", "Zoom 829 6898 6495 · hedgehog", "", true),
    m("8:00 PM", "Sharing the Message", "209 W. Main St., Suite D, Santa Maria", "Speaker on the last Saturday · Behind the thrift store upstairs; elevator available")
  ]
};

const days = Object.keys(schedule);
const todayIndex = () => new Date().getDay();
const csvEscape = (value) => `"${String(value || "").replace(/"/g, '""')}"`;

export default function Meetings() {
  const [dayIndex, setDayIndex] = useState(todayIndex());
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("all");
  const day = days[dayIndex];
  const meetings = useMemo(() => schedule[day].filter((meeting) => {
    const matchesText = `${meeting.name} ${meeting.location} ${meeting.details}`.toLowerCase().includes(search.toLowerCase());
    const matchesFormat = format === "all" || (format === "online" ? meeting.online : !meeting.online);
    return matchesText && matchesFormat;
  }), [day, search, format]);

  const downloadSchedule = () => {
    const rows = [["Day", "Time", "Meeting", "Location", "Details"], ...days.flatMap(d => schedule[d].map(x => [d, x.time, x.name, x.location, x.details]))];
    const blob = new Blob([rows.map(row => row.map(csvEscape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "central-coast-na-meetings-2026.csv"; link.click(); URL.revokeObjectURL(link.href);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "flex-end" }} spacing={2} sx={{ mb: 3 }}>
        <Box><Typography variant="overline" color="secondary.dark" sx={{ fontWeight: 800, letterSpacing: ".12em" }}>CENTRAL COAST AREA</Typography><Typography variant="h4">Find a meeting</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Current schedule · Updated August 20, 2026</Typography></Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Button variant="outlined" startIcon={<TodayRoundedIcon />} onClick={() => setDayIndex(todayIndex())}>Today</Button><Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={downloadSchedule}>Download</Button></Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2 }, mb: 2.5, border: "1px solid rgba(21,63,58,.1)" }}>
        <Tabs value={dayIndex} onChange={(_, value) => setDayIndex(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Meeting days" sx={{ mb: 2 }}>
          {days.map((item, index) => <Tab key={item} label={index === todayIndex() ? `${item} · Today` : item} />)}
        </Tabs>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField fullWidth size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search meeting or city" InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }} />
          <Stack direction="row" spacing={1}>
            {["all", "in-person", "online"].map(value => <Chip key={value} label={value === "all" ? "All" : value === "online" ? "Online" : "In person"} clickable color={format === value ? "primary" : "default"} variant={format === value ? "filled" : "outlined"} onClick={() => setFormat(value)} sx={{ height: 40 }} />)}
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 2 }}>
        <Typography variant="h5">{day}</Typography><Typography variant="body2" color="text.secondary">{meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}</Typography>
      </Stack>

      {meetings.length ? <Box sx={{ display: "grid", gap: 1.25 }}>
        {meetings.map((meeting, index) => (
          <Paper key={`${meeting.time}-${meeting.name}-${index}`} elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: "1px solid rgba(21,63,58,.1)", display: "grid", gridTemplateColumns: { xs: "1fr", sm: "112px 1fr auto" }, gap: { xs: 1, sm: 2 }, alignItems: "center", transition: "border-color .2s, transform .2s", "&:hover": { borderColor: "primary.main", transform: "translateY(-1px)" } }}>
            <Stack direction="row" spacing={.75} alignItems="center"><AccessTimeRoundedIcon sx={{ fontSize: 18, color: "secondary.dark" }} /><Typography sx={{ fontWeight: 800, color: "primary.dark" }}>{meeting.time}</Typography></Stack>
            <Box><Typography sx={{ fontWeight: 750 }}>{meeting.name}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .35 }}><PlaceRoundedIcon sx={{ fontSize: 16, verticalAlign: "-3px", mr: .45 }} />{meeting.location}</Typography>{meeting.details && <Typography variant="caption" sx={{ display: "block", mt: .5, color: "text.secondary" }}>{meeting.details}</Typography>}</Box>
            <Chip icon={meeting.online ? <VideocamRoundedIcon /> : <PlaceRoundedIcon />} label={meeting.online ? "Online / hybrid" : "In person"} size="small" variant="outlined" sx={{ justifySelf: { sm: "end" }, width: "fit-content" }} />
          </Paper>
        ))}
      </Box> : <Alert severity="info">No meetings match your search. Try another day or clear a filter.</Alert>}

      <Paper elevation={0} sx={{ mt: 3, p: 2.5, bgcolor: "primary.dark", color: "#fff", display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <PhoneRoundedIcon /><Box sx={{ flex: 1, minWidth: 220 }}><Typography sx={{ fontWeight: 800 }}>Need help finding a meeting?</Typography><Typography variant="body2" sx={{ color: "rgba(255,255,255,.68)" }}>Central Coast NA bilingual hotline</Typography></Box><Link href="tel:18005497730" color="inherit" underline="none" sx={{ fontSize: "1.08rem", fontWeight: 800 }}>800-549-7730</Link>
      </Paper>
    </Container>
  );
}
