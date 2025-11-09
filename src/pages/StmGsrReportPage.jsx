import React, { useState } from "react";
import { Box, Typography, Button, TextField, Divider } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const authorizedEmails = [
  "nmsaucedapalacios@gmail.com",
  "theoccultcorner@gmail.com",
];

const defaultTitle = "STM GSR REPORT NOVEMBER 2025";

const defaultText = `

 Positions Available

STM GROUP POSITIONS OPEN:** Vice-Chair, GSR & Literature
Greeters, Coffee Persons & Meeting Service Reps (MSRs) needed for ALL STM Meetings

---

## Meeting News

STM Men’s Stag Meeting: Tuesdays @ 6:30pm — needs support.
STM Women’s Book Study Meeting: Thursdays @ 6:30pm — needs support.
Guad Squad: Wednesday @ 7pm, NEW location: 4635 6th Street.
Survivors Bday/Speaker Mtgs:

  Sat. Nov. 15th – Angel L.
  Wed. Nov. 26th – Chris M. & Rachel M. @ 6pm
  STM Activities/Group Service Committee Meeting** November 8th @ 9am & 10am.
  All Meeting Secretaries required to attend Group Service @ 10am.

---

Activities Flyers Posted

STM Thanksgiving Potluck/Karaoke/Birthday & Speaker Meeting

Saturday, November 29th @ 6pm
Sign-Up Sheets Posted
Speakers: Jon T. & Kurt S.

SBNA Turkey Bash

@ 305 Anapamu St.
Friday, November 21st — 6–8:30pm
$5 Donation

STM New Year Speaker Bash/Dinner/Karaoke/Dance

Wednesday, December 31st
Speakers @ 1:30pm, 2:30, 3:30, 4:30pm
Dinner/Karaoke @ 6–8pm
Speaker @ 8pm: “T”
Dance 9pm – 12:30am
Event is free. Plates $10. Kids eat free.
Sign-up sheets coming soon…

---

Other NA Announcements

NA Literature price increase. New Prices posted.
STM Spanish NA Literature for sale now.
STM Venmo & CashApp: Please tag $ w/info.
STM GEAR for sale. Order sheet posted.
Celebrating a milestone in your recovery? Put your name & clean time on board.
PR, H&I & Behind the Walls Sponsorship needs volunteers. Info posted.
NA Area Information: @centralcoastna.org
Are there any other NA Announcements from the floor?

`;

const knownHeaders = [
  "Positions Available",
  "Meeting News",
  "Activities Flyers Posted",
  "Other NA Announcements",
];

const StmGsrReport = () => {
  const { user } = useAuth();
  const isAuthorized = authorizedEmails.includes(user?.email || "");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [reportText, setReportText] = useState(defaultText);

  // Normalize a line to detect headers robustly
  const normalizeHeader = (s) =>
    s.trim().replace(/^#+\s*/, "").replace(/:$/, "");

  const renderFormattedText = (text) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    // Keep blank lines out but preserve structural lines like '---'
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    return lines.map((rawLine, index) => {
      const line = rawLine.trim();

      // Divider line support (markdown style)
      if (/^-{3,}$/.test(line)) {
        return <Divider key={`div-${index}`} sx={{ my: 2 }} />;
        }

      // Header detection: either known headers, or markdown "## Heading"
      const normalized = normalizeHeader(line);
      if (knownHeaders.includes(normalized) || /^#{1,6}\s+/.test(line)) {
        return (
          <Typography key={`h-${index}`} variant="h6" sx={{ mt: 3 }}>
            {normalized}
          </Typography>
        );
      }

      // Split by URL and render anchors for captured parts.
      const parts = line.split(urlPattern);

      return (
        <Typography key={`p-${index}`} variant="body1" sx={{ ml: 2 }}>
          {parts.map((part, i) => {
            // Because split used a *capturing* group, matched URLs appear at odd indices
            const isCapturedUrl = i % 2 === 1 && part.startsWith("http");
            if (isCapturedUrl) {
              return (
                <a
                  key={`a-${index}-${i}`}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1F3F3A" }}
                >
                  {part}
                </a>
              );
            }
            return <React.Fragment key={`t-${index}-${i}`}>{part}</React.Fragment>;
          })}
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
          onClick={() => setEditing((v) => !v)}
          sx={{
            backgroundColor: "#1F3F3A",
            "&:hover": { backgroundColor: "#16302D" },
          }}
        >
          {editing ? "Done Editing" : "Edit GSR Report"}
        </Button>
      )}
    </Box>
  );
};

export default StmGsrReport;

