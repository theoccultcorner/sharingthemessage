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
      <Typography
        variant="h4"
        sx={{ textAlign: "center", marginBottom: "20px", fontWeight: "bold" }}
      >
        STM GSR Report December 2025
      </Typography>

      <Divider sx={{ marginY: "20px" }} />

      <section>
        <Typography variant="h5" sx={{ marginBottom: "10px", fontWeight: "bold" }}>
          Positions Available
        </Typography>
        <List>
          <ListItem>STM GROUP POSITIONS OPEN: Vice-Chair, GSR & Literature</ListItem>
          <ListItem>
            Participate in Your Recovery: Thursday Noon &amp; Sunday 8pm Secretary Positions open.
          </ListItem>
          <ListItem>
            Greeters, Coffee Persons &amp; Meeting Service Reps (MSRs) needed for ALL STM Meetings.
          </ListItem>
        </List>
      </section>

      <Divider sx={{ marginY: "20px" }} />

      <section>
        <Typography variant="h5" sx={{ marginBottom: "10px", fontWeight: "bold" }}>
          Meeting News
        </Typography>
        <List>
          <ListItem>Guad Squad: Wednesday @ 7pm: 4635 6th Street.</ListItem>

          <ListItem>
            Survivors Bday/Speaker Mtg:
            <List sx={{ paddingLeft: "20px" }}>
              <ListItem>Sat. Dec. 20th - Glenn S.</ListItem>
            </List>
          </ListItem>

          <ListItem>STM Birthday/Speaker Meeting: December 27th @ 8pm - Kila</ListItem>

          <ListItem>STM Activities/Group Service Committee Meeting: January 10th @ 9am &amp; 10am.</ListItem>

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
            SBNA Deck the Halls @ 235 E. Cota St, SB: Saturday, Dec. 20th 3-10pm. Presale Tix $30.
          </ListItem>

          <ListItem>
            STM New Year Speaker Bash/Dinner/Karaoke/Dance: Dec. 31st
            <List sx={{ paddingLeft: "20px" }}>
              <ListItem>Speakers @ 1:30pm: Greggory W.</ListItem>
              <ListItem>2:30pm: Felicia H.</ListItem>
              <ListItem>3:30pm: Daniel M.</ListItem>
              <ListItem>4:30pm: Lorenzo N.</ListItem>
              <ListItem>Dinner/Karaoke @ 6-8pm.</ListItem>
              <ListItem>Speaker @ 8pm: “T”.</ListItem>
              <ListItem>Dance 9pm - 12:30am.</ListItem>
              <ListItem>Event is free. Plates $10. Kids eat free.</ListItem>
            </List>
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
            STM Toy Drive: Please donate new unused toys this Christmas for our STM kids. Thank you.
          </ListItem>
          <ListItem>STM Spanish NA Literature for sale now.</ListItem>
          <ListItem>STM Venmo &amp; CashApp: Please tag $ w/info.</ListItem>
          <ListItem>STM GEAR for sale. Order sheet posted.</ListItem>
          <ListItem>
            Celebrating a milestone in your recovery? Put your name, clean date &amp; time on board.
          </ListItem>
          <ListItem>PR, H&amp;I &amp; Behind the Walls Sponsorship needs volunteers. Info posted.</ListItem>
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
