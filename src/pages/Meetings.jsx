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
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";

const meetingsData = {
  Sunday: [
    { time: "8:30 AM - 9:30 AM", title: "Men's Stag", location: "420 Soares Ave, Orcutt, CA" },
    { time: "8:00 PM - 9:00 PM", title: "Sharing the Message", location: "209 W. Main St, Santa Maria, CA" }
  ],
  Monday: [
    { time: "12:00 PM - 1:00 PM", title: "Sharing the Message", location: "209 W. Main St, Santa Maria, CA" },
    { time: "8:00 PM - 9:00 PM", title: "Sharing the Message - Leaders Choice", location: "209 W. Main St, Santa Maria, CA" }
  ],
  Tuesday: [
    { time: "12:00 PM - 1:00 PM", title: "Sharing the Message - Leaders Choice", location: "209 W. Main St, Santa Maria, CA" },
    { time: "6:30 PM - 7:30 PM", title: "Men’s Stag", location: "209 W. Main St, Santa Maria, CA" },
    { time: "8:00 PM - 9:00 PM", title: "Sharing the Message - Leaders Choice", location: "209 W. Main St, Santa Maria, CA" }
  ],
  Wednesday: [
    { time: "12:00 PM - 1:00 PM", title: "Sharing the Message - Stick Meeting", location: "209 W. Main St, Santa Maria, CA" },
    { time: "8:00 PM - 9:00 PM", title: "Sharing the Message - Leaders Choice", location: "209 W. Main St, Santa Maria, CA" }
  ],
  Thursday: [
    { time: "12:00 PM - 1:00 PM", title: "Sharing the Message - Leaders Choice", location: "209 W. Main St, Santa Maria, CA" },
    { time: "6:30 PM - 7:30 PM", title: "Women’s Meeting", location: "209 W. Main St, Santa Maria, CA" },
    { time: "8:00 PM - 9:00 PM", title: "Sharing the Message - Leaders Choice", location: "209 W. Main St, Santa Maria, CA" }
  ],
  Friday: [
    { time: "12:00 PM - 1:00 PM", title: "Sharing the Message - SPAD Book Study", location: "209 W. Main St, Santa Maria, CA" },
    { time: "8:00 PM - 9:00 PM", title: "Sharing the Message - SPAD Book Study", location: "209 W. Main St, Santa Maria, CA" }
  ],
  Saturday: [
    { time: "12:00 PM - 1:00 PM", title: "Sharing the Message - Leaders Choice", location: "209 W. Main St, Santa Maria, CA" },
    { time: "8:00 PM - 9:00 PM", title: "Sharing the Message - Leaders Choice", location: "209 W. Main St, Santa Maria, CA" }
  ]
};

const Meetings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedDay, setSelectedDay] = useState("Monday");

  return (
    <Container sx={{ mt: 4, mb: 10 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        Daily NA Meetings
        <Typography variant="body1">
          Upstairs in back of thrift store suite D<br />209 W. Main St, Santa Maria, CA, 93458
        </Typography>
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
        <ToggleButtonGroup
          value={selectedDay}
          exclusive
          onChange={(e, value) => value && setSelectedDay(value)}
          size="small"
          color="primary"
        >
          {Object.keys(meetingsData).map((day) => (
            <ToggleButton key={day} value={day}>
              {day}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1F3F3A" }}>
          {selectedDay} Meetings
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={2}>
          {meetingsData[selectedDay].map((meeting, index) => (
            <Box key={index}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                ⏰ {meeting.time}
              </Typography>
              <Typography variant="body2" sx={{ ml: 2 }}>
                📌 {meeting.title} <br />📍 {meeting.location}
              </Typography>
              {index < meetingsData[selectedDay].length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default Meetings;
