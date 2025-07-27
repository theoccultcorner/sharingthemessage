import React, { useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
} from "@mui/material";
import { womenContacts, menContacts } from "../data/phoneData";

const PhoneList = () => {
  const [view, setView] = useState("women");
  const [search, setSearch] = useState("");

  const contacts = view === "women" ? womenContacts : menContacts;

  const filteredContacts = contacts.filter((entry) =>
    `${entry.name} ${entry.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        📞 Phone List
      </Typography>

      {/* Toggle between Men/Women */}
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(e, newView) => {
          if (newView !== null) setView(newView);
        }}
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="women">Women</ToggleButton>
        <ToggleButton value="men">Men</ToggleButton>
      </ToggleButtonGroup>

      {/* Search bar */}
      <TextField
        label="Search by name or number"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Contact List */}
      <Paper sx={{ p: 2 }}>
        <List>
          {filteredContacts.length === 0 ? (
            <Typography variant="body2" align="center">
              No contacts found.
            </Typography>
          ) : (
            filteredContacts.map((entry, index) => (
              <React.Fragment key={index}>
                <ListItem
                  component="a"
                  href={`tel:${entry.phone.replace(/[^0-9]/g, "")}`}
                  sx={{ cursor: "pointer" }}
                >
                  <ListItemText primary={entry.name} secondary={entry.phone} />
                </ListItem>
                {index < filteredContacts.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default PhoneList;
