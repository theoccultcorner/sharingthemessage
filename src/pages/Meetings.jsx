import React, { useState, useEffect } from "react";
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
  Tab
} from "@mui/material";

const existingMeetings = {
  Sunday: [[{ time: "12 PM", host: "Jon T." }],
    { time: "8 PM", host: "GREGORY" }
  
  ],
  Monday: [
    { time: "12 PM", host: "MARK" },
    { time: "8 PM", host: "Daniel M." }
  ],
  Tuesday: [
    { time: "12 PM", host: "Cierra" },
    { time: "6:30 PM", host: "Men’s Stag – OPEN." },
    { time: "8 PM", host: "LORENZO" }
  ],
  Wednesday: [
    { time: "12 PM", host: "Bart" },
    { time: "8 PM", host: "Daniel"}
  ],
  Thursday: [
    { time: "12 PM", host: "Cambria" },
    { time: "6:30 PM", host: "Women’s Meeting – Jaclyn" },
    { time: "8 PM", host: "Bobby" }
  ],
  Friday: [
    { time: "12 PM", host: "Jaunita" },
    { time: "8 PM", host: "Joseph / Candle-light" }
  ],
  Saturday: [
    { time: "12 PM", host: "T" },
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
  const daysOfWeek = Object.keys(existingMeetings);
  const todayIndex = new Date().getDay(); // Sunday = 0, Monday = 1, etc.
  const [selectedTab, setSelectedTab] = useState(todayIndex);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container sx={{ mt: 4, mb: 10 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        Daily NA Meetings
        <p>upstairs in back of thrift store suite D<br/>209 W. Main St, Santa Maria, CA, 93458</p>
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
          {existingMeetings[daysOfWeek[selectedTab]].map(({ time, host }, idx) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>⏰ {time}</Typography>
              <Typography variant="body2" sx={{ ml: 2 }}>👤 {host}</Typography>
              {idx < existingMeetings[daysOfWeek[selectedTab]].length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1F3F3A", mb: 1 }}>
            All NA Meetings
          </Typography>
          {extraMeetings[daysOfWeek[selectedTab]]?.map((entry, idx) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="body2">📍 {entry}</Typography>
              {idx < extraMeetings[daysOfWeek[selectedTab]].length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>
      </Stack>
    </Container>
  );
};

export default Meetings;
