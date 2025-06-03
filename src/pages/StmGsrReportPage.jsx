import React from "react";
import { Box, Typography, List, ListItem, Divider } from "@mui/material";

const StmGsrReport = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        STM GSR Report – May 2025
      </Typography>

      <Typography variant="h6" gutterBottom>
        Positions Available
      </Typography>
      <List>
        <ListItem>• STM GROUP Vice-Chair, Secretary, Literature & GSR needed.</ListItem>
        <ListItem>• Thursday 8pm & Men's Stag Meeting, Tuesday 6:30 Secretary Positions Open.</ListItem>
        <ListItem>• Greeters, Coffee Persons & Meeting Service Reps (MSRs) needed for ALL STM Meetings.</ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Meeting News
      </Typography>
      <List>
        <ListItem>• STM Men's Stag Meeting: Tuesdays @ 6:30pm needs support.</ListItem>
        <ListItem>• STM Women's Meeting: Thursdays @ 6:30pm needs support.</ListItem>
        <ListItem>• Guad Squad: Wednesdays @ 7pm, 950A Guadalupe St.</ListItem>
        <ListItem>• STM Activities Committee Meeting: June 14th @ 9am.</ListItem>
        <ListItem>• STM Group Service Committee Meeting: June 14th @ 10am. Meeting Representatives required.</ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Activities Flyers Posted
      </Typography>
      <List>
        <ListItem>• Fun in the Sun @ Avila Beach: June 7th 10–2pm. Free Hamburgers & Hotdogs.</ListItem>
        <ListItem>• Survivors Hard Knocks @ 530 12th St, Paso Robles: June 7th 6:30pm.</ListItem>
        <ListItem>• Father’s Day Campout @ Nacimiento Lake: June 12–15th.</ListItem>
        <ListItem>• Gold Coast Campout @ Cachuma Lake: June 20–22nd. $40 for 3 days w/3 meals or $10 a day w/o meals.</ListItem>
        <ListItem>• STM Day at the Park: June 28th @ 4:30pm. $5 a plate & $3 entry for Ping Pong Tournament @ 5:30pm. Speakers: T & Nellie P. @ 8pm.</ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Other NA Announcements
      </Typography>
      <List>
        <ListItem>• STM Spanish NA Literature for sale now.</ListItem>
        <ListItem>• STM Venmo & CashApp: 7th donations, Literature Sales & Activities (tag $ with info).</ListItem>
        <ListItem>• STM gear for sale: hoodies, t-shirts, caps, beanies, coffee cups, stickers. Order sheet posted.</ListItem>
        <ListItem>• Celebrating a milestone? Add your name & clean date to the board.</ListItem>
        <ListItem>• PR, H&I & Behind the Walls Sponsorship needs volunteers. Info posted.</ListItem>
        <ListItem>• NA Area Info: <a href="https://centralcoastna.org" target="_blank" rel="noreferrer">centralcoastna.org</a></ListItem>
       
      </List>
    </Box>
  );
};

export default StmGsrReport;
