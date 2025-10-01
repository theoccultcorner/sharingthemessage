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

const defaultTitle = "STM GSR Report October 2025";

const defaultText = `

Positions Available   

Participate in your Recovery: Sunday 8pm, Wednesday 8pm & Women’s Meeting Thursday 6:30pm Secretary Positions OPEN.
Greeters, Coffee Persons & Meeting Service Reps (MSRs) needed for ALL STM Meetings.
Meeting News

STM Women’s Meeting: Thursdays@6:30pm needs support & Secretary. Keytags 1st Thurs.
STM Men’s Stag Meeting: Tuesdays @ 6:30pm needs support.
Guad Squad: Wednesday @ 7pm, NEW location: 4635 6th Street.
STM Birthday/Speaker Meeting Saturday, October 25th @ 8pm. Speaker Crystal E. 
Survivors Bday/Speaker Mtgs:
Sat. Oct. 18th - Bob F. & Wed. Oct. 29th - Danica A. @ 6pm
STM Activities Committee Meeting October 11th @ 9am. Help support STM Activities. 
STM Group Service Committee Meeting October 11th @ 10am. ALL Meeting Secretaries or Meeting Representatives required to attend. Come support STM & attend Group Service.
Activities Flyers Posted      

STM Spaghetti Feed: Friday Oct. 10 @ 6pm $10 plate. Meeting @ 8pm. Dance @ 9pm.
Freak Fest @ Odd Fellows Hall, Morro Bay: October 25th 5 - 10pm
Gold Coast Women’s Retreat @ Circle V Ranch Camp, SB: Oct. 3rd - 5th: $230. Text to register.
Central Coast Women’s Retreat @ Sea Crest: Nov. 7th - 9th: $100 Registration.  
Other NA Announcements

STM Phone Lists Sign-up sheets at desk.
STM Spanish NA Literature for sale now.
STM Venmo & CashApp: Please tag $ w/info.
STM GEAR for sale. Order sheet posted.
Celebrating a milestone in your recovery? Put your name & clean time on board.
PR, H&I & Behind the Walls Sponsorship needs volunteers. Info posted.
NA Area Information @centralcoastna.org
Are there any other NA Announcements from the floor?


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
