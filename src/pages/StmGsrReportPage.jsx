import React, { useState } from "react";
import { Box, Typography, List, ListItem, Divider, Button, TextField } from "@mui/material";
import { useAuth } from "../context/AuthContext"; // assuming your auth context provides `user`

const authorizedEmails = [
  "nmsaucedapalacios@gmail.com",
  "theoccultcorner@gmail.com"
];

const defaultContent = {
  positions: [
    "STM GROUP Vice-Chair, Secretary, Literature & GSR needed.",
    "Thursday 8pm & Men's Stag Meeting, Tuesday 6:30 Secretary Positions Open.",
    "Greeters, Coffee Persons & Meeting Service Reps (MSRs) needed for ALL STM Meetings."
  ],
  meetingNews: [
    "STM Men's Stag Meeting: Tuesdays @ 6:30pm needs support.",
    "STM Women's Meeting: Thursdays @ 6:30pm needs support.",
    "Guad Squad: Wednesdays @ 7pm, 950A Guadalupe St.",
    "STM Activities Committee Meeting: June 14th @ 9am.",
    "STM Group Service Committee Meeting: June 14th @ 10am. Meeting Representatives required."
  ],
  flyers: [
    "Fun in the Sun @ Avila Beach: June 7th 10–2pm. Free Hamburgers & Hotdogs.",
    "Survivors Hard Knocks @ 530 12th St, Paso Robles: June 7th 6:30pm.",
    "Father’s Day Campout @ Nacimiento Lake: June 12–15th.",
    "Gold Coast Campout @ Cachuma Lake: June 20–22nd. $40 for 3 days w/3 meals or $10 a day w/o meals.",
    "STM Day at the Park: June 28th @ 4:30pm. $5 a plate & $3 entry for Ping Pong Tournament @ 5:30pm. Speakers: T & Nellie P. @ 8pm."
  ],
  announcements: [
    "STM Spanish NA Literature for sale now.",
    "STM Venmo & CashApp: 7th donations, Literature Sales & Activities (tag $ with info).",
    "STM gear for sale: hoodies, t-shirts, caps, beanies, coffee cups, stickers. Order sheet posted.",
    "Celebrating a milestone? Add your name & clean date to the board.",
    "PR, H&I & Behind the Walls Sponsorship needs volunteers. Info posted.",
    "NA Area Info: https://centralcoastna.org"
  ]
};

const StmGsrReport = () => {
  const { user } = useAuth();
  const isAuthorized = authorizedEmails.includes(user?.email);
  const [content, setContent] = useState(defaultContent);
  const [editing, setEditing] = useState(false);

  const handleChange = (section, index, value) => {
    const updated = { ...content };
    updated[section][index] = value;
    setContent(updated);
  };

  const renderList = (title, key) => (
    <>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <List>
        {content[key].map((item, index) => (
          <ListItem key={index}>
            {editing ? (
              <TextField
                fullWidth
                value={item}
                onChange={(e) => handleChange(key, index, e.target.value)}
              />
            ) : (
              item.includes("http") ? (
                <a href={item} target="_blank" rel="noreferrer">{item}</a>
              ) : item
            )}
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
    </>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        STM GSR Report – May 2025
      </Typography>

      {renderList("Positions Available", "positions")}
      {renderList("Meeting News", "meetingNews")}
      {renderList("Activities Flyers Posted", "flyers")}
      {renderList("Other NA Announcements", "announcements")}

      {isAuthorized && (
        <Button
          variant="contained"
          onClick={() => setEditing(!editing)}
          sx={{ mt: 2, backgroundColor: "#1F3F3A", "&:hover": { backgroundColor: "#16302D" } }}
        >
          {editing ? "Done Editing" : "Edit Report"}
        </Button>
      )}
    </Box>
  );
};

export default StmGsrReport;
