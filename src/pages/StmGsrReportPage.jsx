import React, { useEffect } from "react";
import { Box, Typography, List, ListItem, Link, Divider } from "@mui/material";

const GSRReport = () => {
  useEffect(() => {
    // Scroll to the top of the page when the component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box
      sx={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.6",
        backgroundColor: "#f9f9f9",
        color: "#333",
        marginBottom: "20px",
      }}
    >
      <Typography variant="h4" sx={{ textAlign: "center", marginBottom: "20px", fontWeight: "bold" }}>
        STM GSR Report December 2025
      </Typography>

      <Divider sx={{ marginY: "20px" }} />

      <section>
        <Typography variant="h5" sx={{ marginBottom: "10px", fontWeight: "bold" }}>
          Positions Available
        </Typography>
        <List>
          <ListItem>
            STM GROUP POSITIONS OPEN: Vice-Chair, GSR & Literature
          </ListItem>
          <ListItem>
            Participate in Your Recovery: Sunday 8pm Secretary Position open. Election on Dec. 14th.
          </ListItem>
          <ListItem>
            Greeters, Coffee Persons & Meeting Service Reps (MSRs) needed for ALL STM Meetings.
          </ListItem>
        </List>
      </section>

      <Divider sx={{ marginY: "20px" }} />

      <section>
        <Typography variant="h5" sx={{ marginBottom: "10px", fontWeight: "bold" }}>
          Meeting News
        </Typography>
        <List>
          <ListItem>
            STM Men’s Stag Meeting: Tuesdays @ 6:30pm needs support.
          </ListItem>
          <ListItem>
            STM Women’s Book Study Meeting: Thursdays @ 6:30pm needs support. Keytags 1st Thursday.
          </ListItem>
          <ListItem>
            Guad Squad: Wednesday @ 7pm: 4635 6th Street.
          </ListItem>
          <ListItem>
            Survivors Bday/Speaker Mtgs:
            <List sx={{ paddingLeft: "20px" }}>
              <ListItem>
                Sat. Dec. 20th – Glenn S. & Wed. Dec. 31st – Ralphie V. @ 6pm
              </ListItem>
            </List>
          </ListItem>
          <ListItem>
            STM Activities/Group Service Committee Meeting December 13th @ 9am & 10am.
          </ListItem>
          <ListItem sx={{ paddingLeft: "20px" }}>
            Come support STM Activities. All Meeting Secretaries required to attend Group Service @ 10.
          </ListItem>
        </List>
      </section>

      <Divider sx={{ marginY: "20px" }} />

      <section>
        <Typography variant="h5" sx={{ marginBottom: "10px", fontWeight: "bold" }}>
          Activities Flyers Posted
        </Typography>
        <List>
          <ListItem>
            New Attitudes Annual Men’s Brunch: Dec. 14th @ 11am. All Welcome. Donations accepted.
          </ListItem>
          <ListItem>
            SBNA Deck the Halls @ 235 E. Cota St, SB: Saturday, Dec. 20th 3–10pm. Presale Tix $30.
          </ListItem>
          <ListItem>
            STM New Year Speaker Bash/Dinner/Karaoke/Dance: Wed, Dec. 31st Speaker @ 1:30pm: Gregory W.
          </ListItem>
          <ListItem sx={{ paddingLeft: "20px" }}>
            Speakers Sign-ups for 2:30, 3:30, 4:30pm. Dinner/Karaoke @ 6–8pm. Speaker @ 8pm.
          </ListItem>
          <ListItem sx={{ paddingLeft: "20px" }}>
            Dance 9pm – 12:30am. Event is free. Plates $10. Kids eat free.
          </ListItem>
        </List>
      </section>

      <Divider sx={{ marginY: "20px" }} />

      <section>
        <Typography variant="h5" sx={{ marginBottom: "10px", fontWeight: "bold" }}>
          Other NA Announcements
        </Typography>
        <List>
          <ListItem>
            STM Spanish NA Literature for sale now.
          </ListItem>
          <ListItem>
            STM Venmo & CashApp: Please tag $ w/info.
          </ListItem>
          <ListItem>
            STM GEAR for sale. Order sheet posted.
          </ListItem>
          <ListItem>
            Celebrating a milestone in your recovery? Put your name, clean date & time on board.
          </ListItem>
          <ListItem>
            PR, H&I & Behind the Walls Sponsorship needs volunteers. Info posted.
          </ListItem>
          <ListItem>
            NA Area Information @{" "}
            <Link href="https://centralcoastna.org" target="_blank" rel="noopener">
              centralcoastna.org
            </Link>
          </ListItem>
        
        </List>
      </section>
    </Box>
  );
};

export default GSRReport;
