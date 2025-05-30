import React, { useState } from "react";
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
  Sunday: [{ time: "8 PM", host: "GREGORY" }],
  Monday: [
    { time: "12 PM", host: "MARK" },
    { time: "8 PM", host: "Daniel M." }
  ],
  Tuesday: [
    { time: "12 PM", host: "Peanut" },
    { time: "6:30 PM", host: "Men’s Stag – John T." },
    { time: "8 PM", host: "LORENZO" }
  ],
  Wednesday: [
    { time: "12 PM", host: "Cambria" },
    { time: "8 PM", host: "Hannah" }
  ],
  Thursday: [
    { time: "12 PM", host: "BART" },
    { time: "6:30 PM", host: "Women’s Meeting – Jaclyn" },
    { time: "8 PM", host: "Dinah R." }
  ],
  Friday: [
    { time: "12 PM", host: "SPAD / Joseph" },
    { time: "8 PM", host: "MICHAEL B." }
  ],
  Saturday: [
    { time: "12 PM", host: "T" },
    { time: "12 PM", host: "Juanita" }
  ]
};

const fullMeetings = {
  Sunday: [
    "8:30 am - 9:30 am – Men's Stag – 420 Soares Ave, Orcutt, CA",
    "9:00 am - 10:00 am – Destiny Group – 119 N. D St, Lompoc, CA",
    "12:00 pm - 1:00 pm – Cambria New Attitude – 1069 Main St, Cambria, CA (Virtual + In-Person)",
    "8:00 pm - 9:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA"
  ],
  Monday: [
    "12:00 pm - 1:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA",
    "6:30 pm - 7:30 pm – SOS Women's Meeting – 6717 Morro Rd, Atascadero, CA",
    "8:00 pm - 9:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA"
  ],
  Tuesday: [
    "12:00 pm - 1:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA",
    "6:30 pm - 7:30 pm – Sharing the Message - Men's Stag – 209 W. Main St, Santa Maria, CA",
    "8:00 pm - 9:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA"
  ],
  Wednesday: [
    "12:00 pm - 1:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA",
    "8:00 pm - 9:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA"
  ],
  Thursday: [
    "12:00 pm - 1:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA",
    "6:30 pm - 7:30 pm – Sharing the Message - Women's – 209 W. Main St, Santa Maria, CA",
    "8:00 pm - 9:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA"
  ],
  Friday: [
    "12:00 pm - 1:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA",
    "8:00 pm - 9:00 pm – Sharing the Message SPAD Book Study – 209 W. Main St, Santa Maria, CA"
  ],
  Saturday: [
    "12:00 pm - 1:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA",
    "8:00 pm - 9:00 pm – Sharing the Message – 209 W. Main St, Santa Maria, CA"
  ]
};

const Meetings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedTab, setSelectedTab] = useState(0);
  const daysOfWeek = Object.keys(existingMeetings);

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
        scrollButtons
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        {daysOfWeek.map((day, index) => (
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
            Full Schedule
          </Typography>
          {fullMeetings[daysOfWeek[selectedTab]].map((entry, idx) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="body2">📍 {entry}</Typography>
              {idx < fullMeetings[daysOfWeek[selectedTab]].length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>
      </Stack>
    </Container>
  );
};

export default Meetings;
