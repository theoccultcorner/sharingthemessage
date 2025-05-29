import React from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  useTheme,
  useMediaQuery
} from "@mui/material";

const meetings = {
  Sunday: [
    
    { time: "8 PM", host: "GREGORY" }
  ],
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

const Meetings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Weekly Meetings
      </Typography>

      <Grid container spacing={3}>
        {Object.entries(meetings).map(([day, slots]) => (
          <Grid item xs={12} sm={6} md={4} key={day}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {day}
              </Typography>

              {slots.map(({ time, host }, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {host}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Meetings;
