import React, { useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Divider,
  Stack,
  Tabs,
  Tab,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";

/* =========================
   DATA
========================= */

const STM_LOCATION = {
  name: "upstairs in back of thrift store suite D",
  address: "209 W. Main St, Santa Maria, CA, 93458",
};

const existingMeetings = {
  Sunday: [
    { time: "12 PM", host: "Jon T." },
    { time: "8 PM", host: "Mark P." },
  ],
  Monday: [
    { time: "12 PM", host: "MARK" },
    { time: "8 PM", host: "Julia (SPAD)" },
  ],
  Tuesday: [
    { time: "12 PM", host: "Juan" },
    { time: "6:30 PM", host: "Men’s Stag – Andre" },
    { time: "8 PM", host: "LORENZO" },
  ],
  Wednesday: [
    { time: "12 PM", host: "Angie (Stick Meeting)" },
    { time: "8 PM", host: "Daniel M." },
  ],
  Thursday: [
    { time: "12 PM", host: "Bob S." },
    { time: "8 PM", host: "Sandie K." },
  ],
  Friday: [
    { time: "12 PM", host: "Cierra" },
    { time: "8 PM", host: "Joseph / Candle-light" },
  ],
  Saturday: [
    { time: "12 PM", host: "Felicia" },
    { time: "8 PM", host: "Michael B." },
  ],
};

const extraMeetings = {
  Sunday: [
    "8:30 am - 9:30 am – Men's Stag – 420 Soares Ave, Orcutt, CA",
    "9:00 am - 10:00 am – Destiny Group – 119 N. D St, Lompoc, CA",
    "12:00 pm - 1:00 pm – Cambria New Attitude – 1069 Main St, Cambria, CA (Virtual + In-Person)",
    "4:00 pm - 5:00 pm – Ladies Night (Zoom) – Central Coast, CA – Zoom ID: 761 398 5501, Passcode: warrior",
    "6:00 pm - 7:00 pm – Sunday Night Serenity – 5318 Palma Ave., Atascadero, CA",
    "7:00 pm - 8:00 pm – Lompoc New Attitudes – 129 N. I st, Lompoc, CA",
    "7:00 pm - 8:00 pm – Five Cities Group – Hope Church, 900 N. Oak Park, Arroyo Grande, CA",
  ],
  Monday: [
    "9:00 am - 10:00 am – Destiny Group – 119 N. D St, Lompoc, CA",
    "9:00 am - 10:00 am – Central Coast Breakfast Club (Zoom) – Lompoc, CA",
    "6:30 pm - 7:30 pm – Give it Away Men's – 5850 Rosario Ave, Atascadero, CA",
    "6:30 pm - 7:30 pm – Women's Hard Knocks – 530 12th St., Paso Robles, CA",
    "7:00 pm - 8:00 pm – Orcutt Reconnections – 420 Soares Ave, Orcutt, CA",
  ],
  Tuesday: [
    "9:00 am - 10:00 am – Destiny Group – 119 N. D St, Lompoc, CA",
    "6:00 pm - 7:00 pm – Five Cities Group – 990 Dolliver, Pismo Beach, CA",
    "6:30 pm - 7:30 pm – Tuesday Hard Knocks – 530 12th St., Paso Robles, CA",
    "7:30 pm - 8:30 pm – Five Cities Men's Group – Hope Church, Arroyo Grande, CA",
  ],
  Wednesday: [
    "9:00 am - 10:00 am – Breakfast Club – Lompoc, CA",
    "6:30 pm - 7:30 pm – Hard Knocks Sweets and Treats – 530 12th St., Paso Robles, CA",
    "7:00 pm - 8:00 pm – Gryphon Men's Group – 1825 San Ramon, Atascadero, CA",
  ],
  Thursday: [
    "9:00 am - 10:00 am – Spiritual Principles – Central Coast Breakfast Club (Zoom)",
    "7:15 pm - 8:15 pm – NA Stick Meeting – Hope Lutheran Church, Atascadero, CA",
    "7:30 pm - 8:30 pm – Off the Rock – 710 Harbor Way, Morro Bay, CA",
  ],
  Friday: [
    "12:00 pm - 1:00 pm – Alcohol is a Drug – 1069 Main St, Cambria, CA",
    "7:00 pm - 8:00 pm – Friday Night Freedom – 8600 Atascadero Ave, Atascadero, CA",
    "8:00 pm - 9:15 pm – Candlelight – Lompoc New Attitudes, Lompoc, CA",
  ],
  Saturday: [
    "7:30 am - 8:30 am – Saturday Wakeup! – 5318 Palma Ave., Atascadero, CA",
    "6:00 pm - 7:00 pm – New Attitudes – 129 N I Street, Lompoc, CA",
    "6:30 pm - 7:30 pm – Saturday Hard Knocks – 530 12th St., Paso Robles, CA",
    "7:00 pm - 8:00 pm – Keep it Simple – Alano Club, 3075 Broad St., SLO, CA",
  ],
};

/* =========================
   HELPERS
========================= */

function downloadCSV(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCSV(value) {
  const v = String(value ?? "");
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function toCSV(rows) {
  const headers = ["Day", "Category", "Time", "Host", "Details"];
  const lines = [headers.join(",")];

  rows.forEach((r) => {
    lines.push(
      [
        escapeCSV(r.day),
        escapeCSV(r.category),
        escapeCSV(r.time),
        escapeCSV(r.host),
        escapeCSV(r.details),
      ].join(",")
    );
  });

  return lines.join("\n");
}

/* =========================
   COMPONENT
========================= */

export default function Meetings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const daysOfWeek = Object.keys(existingMeetings);
  const today = new Date().getDay();
  const [selectedTab, setSelectedTab] = useState(today);

  const dayKey = daysOfWeek[selectedTab];

  const exportRows = useMemo(() => {
    const rows = [];

    daysOfWeek.forEach((day) => {
      existingMeetings[day]?.forEach((m) => {
        rows.push({
          day,
          category: "STM Hosts",
          time: m.time,
          host: m.host,
          details: `${STM_LOCATION.name} — ${STM_LOCATION.address}`,
        });
      });

      extraMeetings[day]?.forEach((entry) => {
        rows.push({
          day,
          category: "All NA Meetings",
          time: "",
          host: "",
          details: entry,
        });
      });
    });

    return rows;
  }, [daysOfWeek]);

  return (
    <Container sx={{ mt: 4, mb: 10 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        align="center"
        fontWeight="bold"
        gutterBottom
      >
        Daily NA Meetings
      </Typography>

      <Typography align="center" variant="body2" sx={{ mb: 2 }}>
        {STM_LOCATION.name}
        <br />
        {STM_LOCATION.address}
      </Typography>

      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {daysOfWeek.map((day) => (
          <Tab key={day} label={day} />
        ))}
      </Tabs>

      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          STM Hosts
        </Typography>

        {existingMeetings[dayKey].map((m, i) => (
          <Box key={i} sx={{ mb: 1 }}>
            <Typography>⏰ {m.time}</Typography>
            <Typography sx={{ ml: 2 }}>👤 {m.host}</Typography>
            {i < existingMeetings[dayKey].length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700}>
          All NA Meetings
        </Typography>

        {extraMeetings[dayKey].map((m, i) => (
          <Box key={i} sx={{ mb: 1 }}>
            <Typography variant="body2">📍 {m}</Typography>
            {i < extraMeetings[dayKey].length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </Paper>

      {/* ✅ CSV EXPORT (BOTTOM) */}
      <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          Export Meetings (CSV)
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Download the full weekly meeting list as a CSV file.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="contained"
            onClick={() =>
              downloadCSV("na-meetings.csv", toCSV(exportRows))
            }
          >
            Download CSV
          </Button>

          <Chip label={`${exportRows.length} rows`} variant="outlined" />
        </Stack>
      </Paper>
    </Container>
  );
}
