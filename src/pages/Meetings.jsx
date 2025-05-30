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
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";

const meetings = {
  Sunday: [
    { time: "8 PM", host: "GREGORY" },
    { time: "8:30 am - 9:30 am", title: "Men's Stag", location: "420 Soares Ave, Orcutt, CA" },
    { time: "9:00 am - 10:00 am", title: "Destiny Group physical", location: "119 N. D St, Lompoc, CA" },
    // ... More entries as needed
  ],
  Monday: [
    { time: "12 PM", host: "MARK" },
    { time: "8 PM", host: "Daniel M." },
    { time: "9:00 am - 10:00 am", title: "keytag meeting", location: "Destiny Group physical, 119 N. D St, Lompoc, CA" },
    { time: "12:00 pm - 1:00 pm", title: "Five Cities Group", location: "Calvary Chapel, 1133 Maple St. Room 211, Arroyo Grande, CA" },
    // ... More entries as needed
  ],
  Tuesday: [
    { time: "12 PM", host: "Peanut" },
    { time: "6:30 PM", host: "Men’s Stag – John T." },
    { time: "8 PM", host: "LORENZO" },
    { time: "12:00 pm - 1:00 pm", title: "Paso Robles Noon NA", location: "White Oak room at centennial park, 600 Nickerson Drive, Paso Robles, CA" },
    // ... More entries as needed
  ],
  Wednesday: [
    { time: "12 PM", host: "Cambria" },
    { time: "8 PM", host: "Hannah" },
    { time: "12:00 pm - 1:00 pm", title: "chip meeting", location: "Five Cities Group, Calvary Chapel, 1133 Maple St. Room 211, Arroyo Grande, CA" },
    // ... More entries as needed
  ],
  Thursday: [
    { time: "12 PM", host: "BART" },
    { time: "6:30 PM", host: "Women’s Meeting – Jaclyn" },
    { time: "8 PM", host: "Dinah R." },
    { time: "12:00 pm - 1:00 pm", title: "Paso Robles Noon NA", location: "White Oak room at centennial park, 600 Nickerson Drive, Paso Robles, CA" },
    // ... More entries as needed
  ],
  Friday: [
    { time: "12 PM", host: "SPAD / Joseph" },
    { time: "8 PM", host: "MICHAEL B." },
    { time: "12:00 pm - 1:00 pm", title: "Five Cities Group", location: "Calvary Chapel, 1133 Maple St. Room 211, Arroyo Grande, CA" },
    // ... More entries as needed
  ],
  Saturday: [
    { time: "12 PM", host: "T" },
    { time: "12 PM", host: "Juanita" },
    { time: "7:00 am - 8:00 am", title: "New Attitudes", location: "129 N I Street, Lompoc, CA" },
    // ... More entries as needed
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
        <p>upstairs in back of thrift store suite D<br />209 W. Main St, Santa Maria, CA, 93458</p>
      </Typography>

      <Box sx={{ textAlign: "center", mb: 2 }}>
        <ToggleButtonGroup
          value={selectedDay}
          exclusive
          onChange={(e, newDay) => newDay && setSelectedDay(newDay)}
          color="primary"
        >
          {Object.keys(meetings).map((day) => (
            <ToggleButton key={day} value={day}>
              {day}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Stack spacing={3}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#1F3F3A", mb: 1 }}
          >
            {selectedDay}
          </Typography>
          <Divider sx={{ mb: 1 }} />

          {meetings[selectedDay].map((entry, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                ⏰ {entry.time}
              </Typography>
              {entry.host && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  👤 {entry.host}
                </Typography>
              )}
              {entry.title && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  📖 {entry.title}
                </Typography>
              )}
              {entry.location && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  📍 {entry.location}
                </Typography>
              )}
              {index < meetings[selectedDay].length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>
      </Stack>
    </Container>
  );
};

export default Meetings;