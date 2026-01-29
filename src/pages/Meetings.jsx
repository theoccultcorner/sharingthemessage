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
  Dialog,
  IconButton,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

/**
 * ✅ WHAT THIS DOES
 * - Keeps your existing STM Hosts + All NA Meetings tabs
 * - Adds the "previous meeting info" (the official schedule pages) INSIDE this same component:
 *    1) "Official Schedule (Page 1)" zoomable image
 *    2) "Official Schedule (Page 2)" zoomable image
 *    3) Optional link to official PDF
 * - Adds a Full Screen viewer for the schedule pages
 *
 * ✅ FILES YOU NEED (place in /public/na/):
 * - /public/na/meeting-schedule-1.jpg
 * - /public/na/meeting-schedule-2.jpg
 *
 * Optional:
 * - If you have the official PDF, set officialPdfUrl below.
 */

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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function ZoomableImage({ src, alt }) {
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragStart = React.useRef({ x: 0, y: 0 });
  const posStart = React.useRef({ x: 0, y: 0 });

  const zoomIn = () => setScale((s) => clamp(Number((s + 0.2).toFixed(2)), 1, 4));
  const zoomOut = () => setScale((s) => clamp(Number((s - 0.2).toFixed(2)), 1, 4));
  const reset = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => clamp(Number((s + delta).toFixed(2)), 1, 4));
  };

  const onPointerDown = (e) => {
    if (scale <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...pos };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({ x: posStart.current.x + dx, y: posStart.current.y + dy });
  };

  const onPointerUp = () => setDragging(false);

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
        <Button variant="outlined" size="small" onClick={zoomOut} startIcon={<ZoomOutIcon />}>
          Zoom out
        </Button>
        <Button variant="outlined" size="small" onClick={zoomIn} startIcon={<ZoomInIcon />}>
          Zoom in
        </Button>
        <Button variant="text" size="small" onClick={reset}>
          Reset
        </Button>
        <Typography variant="body2" sx={{ ml: { xs: 0, sm: "auto" } }}>
          {Math.round(scale * 100)}%
        </Typography>
      </Stack>

      <Box
        onWheel={onWheel}
        sx={{
          width: "100%",
          height: { xs: "60vh", md: "70vh" },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          touchAction: "none",
          backgroundColor: "background.paper",
        }}
      >
        <Box
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          sx={{
            width: "100%",
            height: "100%",
            cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transformOrigin: "center center",
              transition: dragging ? "none" : "transform 120ms ease-out",
              display: "block",
            }}
          />
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        Tip: Zoom in, then drag to move around the schedule.
      </Typography>
    </Box>
  );
}

const Meetings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ Schedule pages (place these in /public/na/)
  const schedulePages = useMemo(
    () => [
      {
        label: "Official Schedule (Page 1)",
        src: "/na/meeting-schedule-1.jpg",
        alt: "Central Coast NA Meeting Schedule - Page 1",
      },
      {
        label: "Official Schedule (Page 2)",
        src: "/na/meeting-schedule-2.jpg",
        alt: "Central Coast NA Meeting Schedule - Page 2",
      },
    ],
    []
  );

  // Optional: change this if your exact PDF URL differs
  const officialPdfUrl =
    "https://centralcoastna.org/wp-content/uploads/2026/01/MeetingSchedule.pdf";

  const daysOfWeek = Object.keys(existingMeetings); // Sunday..Saturday
  const todayIndexRaw = new Date().getDay(); // 0..6
  const safeTodayIndex = Number.isInteger(todayIndexRaw)
    ? Math.min(Math.max(todayIndexRaw, 0), daysOfWeek.length - 1)
    : 0;

  const [selectedTab, setSelectedTab] = useState(safeTodayIndex);
  const [openFull, setOpenFull] = useState(false);
  const [scheduleTab, setScheduleTab] = useState(0);

  const handleTabChange = (_event, newValue) => {
    setSelectedTab(newValue);
  };

  const dayKey = daysOfWeek[selectedTab];

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
        upstairs in back of thrift store suite D<br />
        209 W. Main St, Santa Maria, CA, 93458
      </Typography>

      {/* Day Tabs */}
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        {daysOfWeek.map((day) => (
          <Tab key={day} label={day} />
        ))}
      </Tabs>

      <Stack spacing={3}>
        {/* STM Hosts */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1F3F3A", mb: 1 }}>
            STM Hosts
          </Typography>

          {existingMeetings[dayKey]?.map(({ time, host }, idx) => (
            <Box key={`${dayKey}-host-${idx}`} sx={{ mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                ⏰ {time}
              </Typography>
              <Typography variant="body2" sx={{ ml: 2 }}>
                👤 {host}
              </Typography>
              {idx < existingMeetings[dayKey].length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>

        {/* All NA Meetings */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1F3F3A", mb: 1 }}>
            All NA Meetings
          </Typography>

          {extraMeetings[dayKey]?.map((entry, idx) => (
            <Box key={`${dayKey}-extra-${idx}`} sx={{ mb: 1 }}>
              <Typography variant="body2">📍 {entry}</Typography>
              {idx < extraMeetings[dayKey].length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>

        {/* ✅ Added: Official Schedule Pages (previous meeting info) */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1F3F3A" }}>
              Official Central Coast Schedule
            </Typography>

            <Box sx={{ ml: { xs: 0, sm: "auto" } }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setOpenFull(true)}
                  endIcon={<OpenInNewIcon />}
                >
                  Full screen
                </Button>

                {officialPdfUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    href={officialPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open PDF
                  </Button>
                )}
              </Stack>
            </Box>
          </Stack>

          <Tabs
            value={scheduleTab}
            onChange={(_, v) => setScheduleTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ mb: 2 }}
          >
            {schedulePages.map((p) => (
              <Tab key={p.label} label={p.label} />
            ))}
          </Tabs>

          <ZoomableImage
            src={schedulePages[scheduleTab].src}
            alt={schedulePages[scheduleTab].alt}
          />
        </Paper>
      </Stack>

      {/* Fullscreen dialog for official schedule */}
      <Dialog fullScreen open={openFull} onClose={() => setOpenFull(false)}>
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {schedulePages[scheduleTab].label}
            </Typography>

            <Box sx={{ ml: "auto" }}>
              <IconButton onClick={() => setOpenFull(false)} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Box>
          </Stack>

          <Tabs
            value={scheduleTab}
            onChange={(_, v) => setScheduleTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ mb: 2 }}
          >
            {schedulePages.map((p) => (
              <Tab key={p.label} label={p.label} />
            ))}
          </Tabs>

          <ZoomableImage
            src={schedulePages[scheduleTab].src}
            alt={schedulePages[scheduleTab].alt}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default Meetings;
  ],
  Friday: [
    { time: "12 PM", host: "Cierra" },
    { time: "8 PM", host: "Joseph / Candle-light" }
  ],
  Saturday: [
    { time: "12 PM", host: "Felicia" },
    { time: "8 PM", host: "Michael B." }
  ]
};

const extraMeetings = {
  Sunday: [
    "8:30 am - 9:30 am – Men's Stag – 420 Soares Ave, Orcutt, CA",
    "9:00 am - 10:00 am – Destiny Group – 119 N. D St, Lompoc, CA",
    "12:00 pm - 1:00 pm – Cambria New Attitude – 1069 Main St, Cambria, CA (Virtual + In-Person)",
    "4:00 pm - 5:00 pm – Ladies Night (Zoom) – Central Coast, CA – Zoom ID: 761 398 5501, Passcode: warrior",
    "6:00 pm - 7:00 pm – Sunday Night Serenity – 5318 Palma Ave., Atascadero, CA",
    "7:00 pm - 8:00 pm – Lompoc New Attitudes – 129 N. I st, Lompoc, CA",
    "7:00 pm - 8:00 pm – Five Cities Group – Hope Church, 900 N. Oak Park, Arroyo Grande, CA"
  ],
  Monday: [
    "9:00 am - 10:00 am – Destiny Group – 119 N. D St, Lompoc, CA",
    "9:00 am - 10:00 am – Central Coast Breakfast Club (Zoom) – Lompoc, CA",
    "6:30 pm - 7:30 pm – Give it Away Men's – 5850 Rosario Ave, Atascadero, CA",
    "6:30 pm - 7:30 pm – Women's Hard Knocks – 530 12th St., Paso Robles, CA",
    "7:00 pm - 8:00 pm – Orcutt Reconnections – 420 Soares Ave, Orcutt, CA"
  ],
  Tuesday: [
    "9:00 am - 10:00 am – Destiny Group – 119 N. D St, Lompoc, CA",
    "6:00 pm - 7:00 pm – Five Cities Group – 990 Dolliver, Pismo Beach, CA",
    "6:30 pm - 7:30 pm – Tuesday Hard Knocks – 530 12th St., Paso Robles, CA",
    "7:30 pm - 8:30 pm – Five Cities Men's Group – Hope Church, Arroyo Grande, CA"
  ],
  Wednesday: [
    "9:00 am - 10:00 am – Breakfast Club – Lompoc, CA",
    "6:30 pm - 7:30 pm – Hard Knocks Sweets and Treats – 530 12th St., Paso Robles, CA",
    "7:00 pm - 8:00 pm – Gryphon Men's Group – 1825 San Ramon, Atascadero, CA"
  ],
  Thursday: [
    "9:00 am - 10:00 am – Spiritual Principles – Central Coast Breakfast Club (Zoom)",
    "7:15 pm - 8:15 pm – NA Stick Meeting – Hope Lutheran Church, Atascadero, CA",
    "7:30 pm - 8:30 pm – Off the Rock – 710 Harbor Way, Morro Bay, CA"
  ],
  Friday: [
    "12:00 pm - 1:00 pm – Alcohol is a Drug – 1069 Main St, Cambria, CA",
    "7:00 pm - 8:00 pm – Friday Night Freedom – 8600 Atascadero Ave, Atascadero, CA",
    "8:00 pm - 9:15 pm – Candlelight – Lompoc New Attitudes, Lompoc, CA"
  ],
  Saturday: [
    "7:30 am - 8:30 am – Saturday Wakeup! – 5318 Palma Ave., Atascadero, CA",
    "6:00 pm - 7:00 pm – New Attitudes – 129 N I Street, Lompoc, CA",
    "6:30 pm - 7:30 pm – Saturday Hard Knocks – 530 12th St., Paso Robles, CA",
    "7:00 pm - 8:00 pm – Keep it Simple – Alano Club, 3075 Broad St., SLO, CA"
  ]
};

const Meetings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const daysOfWeek = Object.keys(existingMeetings); // expects Sunday..Saturday
  const todayIndexRaw = new Date().getDay(); // 0..6
  const safeTodayIndex = Number.isInteger(todayIndexRaw)
    ? Math.min(Math.max(todayIndexRaw, 0), daysOfWeek.length - 1)
    : 0;

  const [selectedTab, setSelectedTab] = useState(safeTodayIndex);

  const handleTabChange = (_event, newValue) => {
    setSelectedTab(newValue);
  };

  const dayKey = daysOfWeek[selectedTab];

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
        upstairs in back of thrift store suite D<br />
        209 W. Main St, Santa Maria, CA, 93458
      </Typography>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        {daysOfWeek.map((day) => (
          <Tab key={day} label={day} />
        ))}
      </Tabs>

      <Stack spacing={3}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1F3F3A", mb: 1 }}>
            STM Hosts
          </Typography>
          {existingMeetings[dayKey].map(({ time, host }, idx) => (
            <Box key={`${dayKey}-host-${idx}`} sx={{ mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                ⏰ {time}
              </Typography>
              <Typography variant="body2" sx={{ ml: 2 }}>
                👤 {host}
              </Typography>
              {idx < existingMeetings[dayKey].length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1F3F3A", mb: 1 }}>
            All NA Meetings
          </Typography>
          {extraMeetings[dayKey]?.map((entry, idx) => (
            <Box key={`${dayKey}-extra-${idx}`} sx={{ mb: 1 }}>
              <Typography variant="body2">📍 {entry}</Typography>
              {idx < extraMeetings[dayKey].length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>
      </Stack>
    </Container>
  );
};

export default Meetings;
