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

const defaultText = `
Positions Available

• STM GROUP Vice-Chair, Secretary, Literature & GSR needed.
• Thursday 8pm & Men's Stag Meeting, Tuesday 6:30 Secretary Positions Open.
• Greeters, Coffee Persons & Meeting Service Reps (MSRs) needed for ALL STM Meetings.

Meeting News

• STM Men's Stag Meeting: Tuesdays @ 6:30pm needs support.
• STM Women's Meeting: Thursdays @ 6:30pm needs support.
• Guad Squad: Wednesdays @ 7pm, 950A Guadalupe St.
• STM Activities Committee Meeting: June 14th @ 9am.
• STM Group Service Committee Meeting: June 14th @ 10am. Meeting Representatives required.

Activities Flyers Posted

• Fun in the Sun @ Avila Beach: June 7th 10–2pm. Free Hamburgers & Hotdogs.
• Survivors Hard Knocks @ 530 12th St, Paso Robles: June 7th 6:30pm.
• Father’s Day Campout @ Nacimiento Lake: June 12–15th.
• Gold Coast Campout @ Cachuma Lake: June 20–22nd. $40 for 3 days w/3 meals or $10 a day w/o meals.
• STM Day at the Park: June 28th @ 4:30pm. $5 a plate & $3 entry for Ping Pong Tournament @ 5:30pm. Speakers: T & Nellie P. @ 8pm.

Other NA Announcements

• STM Spanish NA Literature for sale now.
• STM Venmo & CashApp: 7th donations, Literature Sales & Activities (tag $ with info).
• STM gear for sale: hoodies, t-shirts, caps, beanies, coffee cups, stickers. Order sheet posted.
• Celebrating a milestone? Add your name & clean date to the board.
• PR, H&I & Behind the Walls Sponsorship needs volunteers. Info posted.
• NA Area Info: https://centralcoastna.org
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
      <Typography variant="h4" gutterBottom>
        STM GSR Report – May 2025
      </Typography>

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
