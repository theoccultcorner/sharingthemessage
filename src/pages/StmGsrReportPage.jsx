import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Divider
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const authorizedEmails = [
  "nmsaucedapalacios@gmail.com",
  "theoccultcorner@gmail.com"
];

const defaultTitle = "STM GSR REPORT JULY 2025";

const defaultText = `
Positions Available
STM Group Service Elections: August 9th @ 11am. Chair, Vice-Chair, Secretary, GSR, Literature & Treasurer Positions Open. Please support STM.

Tuesday 6:30 Men’s Stag Secretary Position Open.

Greeters, Coffee Persons & Meeting Service Reps (MSRs) needed for ALL STM Meetings.

Meeting News
STM Women’s Meeting: Thursdays @ 6:30pm needs support. Keytags 1st Thursday.

STM Men’s Stag Meeting: Tuesdays @ 6:30pm needs support & a Meeting Secretary.

Guad Squad: Wednesday @ 7pm, 950A Guadalupe St.

Survivors Bday/Speaker Mtgs:

Saturday, July 19th – Vanessa R.

Wednesday, July 30th – Hilda R. @ 6pm

STM Birthday/Speaker Meeting: Saturday, July 26th @ 8pm. Speaker Gilbert AKA Peanut.

STM Activities Committee Meeting: August 9th @ 9am. Support upcoming STM Activities.

STM Group Service Committee Meeting: August 9th @ 10am. ALL Meeting Secretaries or Meeting Representatives required to attend. Come support STM & attend Group Service.

Activities Flyers Posted
New Attitudes Family Game Night, 129 N. I Street: July 26th 7:30pm. Free Event.

New Attitudes Campout @ Lopez Lake: August 8th–10th $50 per person. $15 Saturday only.

Hot Summer Nights @ Atascadero: August 9th 5–10pm. $20 a plate.

Men’s Retreat @ Lopez Lake: August 21st–24th $175 each – Campsite, T-shirt & Food.

SB Activities Campout @ Lopez Lake: September 4th–7th $75 per person. $50 for 12 & under.

Other NA Announcements
STM Spanish NA Literature for sale now.

STM Venmo & CashApp: Please tag $ w/info.

STM MERCH. for sale. Order sheet posted.

Celebrating a milestone in your recovery? Put your name & clean time on board.

PR, H&I & Behind the Walls Sponsorship needs volunteers. Info posted.

NA Area Information @ centralcoastna.org
`;

const knownHeaders = [
  "Positions Available",
  "Meeting News",
  "Activities Flyers Posted",
  "Other NA Announcements"
];

const StmGsrReport = () => {
  const { user } = useAuth();
  const isAuthorized = authorizedEmails.includes(user?.email);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [reportText, setReportText] = useState(defaultText);

  const renderFormattedText = (text) => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    return lines.map((line, index) => {
      const trimmed = line.trim();

      if (knownHeaders.includes(trimmed)) {
        return (
          <Typography key={index} variant="h6" sx={{ mt: 3 }}>
            {trimmed}
          </Typography>
        );
      }

      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = trimmed.split(urlRegex);

      return (
        <Typography key={index} variant="body1" sx={{ ml: 2 }}>
          {parts.map((part, i) =>
            urlRegex.test(part) ? (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1F3F3A" }}
              >
                {part}
              </a>
            ) : (
              <React.Fragment key={i}>{part}</React.Fragment>
            )
          )}
        </Typography>
      );
    });
  };

  return (
    <Box p={3}>
      {editing ? (
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          sx={{ backgroundColor: "#fff", mb: 2 }}
        />
      ) : (
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
      )}

      {editing ? (
        <TextField
          fullWidth
          multiline
          minRows={20}
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          variant="outlined"
          sx={{ backgroundColor: "#fff", mt: 2 }}
        />
      ) : (
        <Box sx={{ mt: 2 }}>{renderFormattedText(reportText)}</Box>
      )}

      <Divider sx={{ my: 3 }} />

      {isAuthorized && (
        <Button
          variant="contained"
          onClick={() => setEditing(!editing)}
          sx={{
            backgroundColor: "#1F3F3A",
            "&:hover": { backgroundColor: "#16302D" }
          }}
        >
          {editing ? "Done Editing" : "Edit GSR Report"}
        </Button>
      )}
    </Box>
  );
};

export default StmGsrReport;
