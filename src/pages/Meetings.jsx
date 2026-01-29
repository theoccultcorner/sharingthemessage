import React, { useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  Stack,
  Tabs,
  Tab,
  Button,
  Chip,
  TextField,
} from "@mui/material";

/**
 * ✅ Vercel-safe (client-only export)
 * - No Node APIs
 * - No filesystem
 * - Uses Blob + URL.createObjectURL for downloads
 * - Clipboard copy is optional (falls back to manual copy)
 *
 * ✅ Bottom has "Meeting Export" with:
 * - Download JSON
 * - Download CSV
 * - Copy JSON
 */

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

function downloadTextFile(filename, text, mime) {
  // ✅ Browser-safe download (works on Vercel deployments)
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows) {
  const headers = ["day", "category", "time", "host", "details"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        escapeCsv(r.day),
        escapeCsv(r.category),
        escapeCsv(r.time),
        escapeCsv(r.host),
        escapeCsv(r.details),
      ].join(",")
    );
  }
  return lines.join("\n");
}

function DayCard({ day, stm, allMeetings }) {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        {day}
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        STM Hosts
      </Typography>

      {stm?.length ? (
        stm.map(({ time, host }, idx) => (
          <Box key={`${day}-stm-${idx}`} sx={{ mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              ⏰ {time}
            </Typography>
            <Typography variant="body2" sx={{ ml: 2 }}>
              👤 {host}
            </Typography>
            {idx < stm.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No STM host meetings listed.
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        All NA Meetings
      </Typography>

      {allMeetings?.length ? (
        allMeetings.map((entry, idx) => (
          <Box key={`${day}-all-${idx}`} sx={{ mb: 1 }}>
            <Typography variant="body2">📍 {entry}</Typography>
            {idx < allMeetings.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No meetings listed.
        </Typography>
      )}
    </Paper>
  );
}

export default function Meetings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const daysOfWeek = useMemo(() => Object.keys(existingMeetings), []);
  const todayIndex = new Date().getDay(); // 0..6
  const safeTodayIndex =
    Number.isInteger(todayIndex) && todayIndex >= 0 && todayIndex <= 6 ? todayIndex : 0;

  const [selectedTab, setSelectedTab] = useState(safeTodayIndex);

  const dayKey = daysOfWeek[selectedTab];

  // ✅ Build export rows (STM Hosts + All NA Meetings)
  const exportRows = useMemo(() => {
    const rows = [];
    for (const day of daysOfWeek) {
      for (const m of existingMeetings[day] || []) {
        rows.push({
          day,
          category: "STM Hosts",
          time: m.time,
          host: m.host,
          details: `${STM_LOCATION.name} — ${STM_LOCATION.address}`,
        });
      }
      for (const entry of extraMeetings[day] || []) {
        rows.push({
          day,
          category: "All NA Meetings",
          time: "",
          host: "",
          details: entry,
        });
      }
    }
    return rows;
  }, [daysOfWeek]);

  const exportJson = useMemo(
    () =>
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          stmLocation: STM_LOCATION,
          meetings: exportRows,
        },
        null,
        2
      ),
    [exportRows]
  );

  return (
    <Container sx={{ mt: 4, mb: 10 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
        component="div"
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
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        {daysOfWeek.map((day) => (
          <Tab key={day} label={day} />
        ))}
      </Tabs>

      <Stack spacing={2}>
        <DayCard day={dayKey} stm={existingMeetings[dayKey]} allMeetings={extraMeetings[dayKey]} />

        {/* ✅ EXPORT AT THE BOTTOM (VERCEL SAFE) */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Export Meetings
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download the full weekly list as JSON or CSV. (Works in Vercel because it runs in the
            browser.)
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={() =>
                downloadTextFile("meetings.json", exportJson, "application/json;charset=utf-8")
              }
            >
              Download JSON
            </Button>

            <Button
              variant="outlined"
              onClick={() =>
                downloadTextFile("meetings.csv", toCsv(exportRows), "text/csv;charset=utf-8")
              }
            >
              Download CSV
            </Button>

            <Button
              variant="outlined"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(exportJson);
                } catch (_e) {
                  // clipboard might be blocked; user can copy from preview
                }
              }}
            >
              Copy JSON
            </Button>

            <Chip label={`${exportRows.length} rows`} variant="outlined" sx={{ width: "fit-content" }} />
          </Stack>

          <TextField
            label="Export Preview (JSON)"
            value={exportJson}
            multiline
            minRows={8}
            fullWidth
            inputProps={{ readOnly: true }}
          />
        </Paper>
      </Stack>
    </Container>
  );
}
