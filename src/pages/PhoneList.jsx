import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box
} from "@mui/material";
import { womenContacts, menContacts } from "../data/phoneData"; // ✅ adjust path

const renderList = (title, contacts) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <Paper sx={{ p: 2 }}>
      <List>
        {contacts.map((entry, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText primary={entry.name} secondary={entry.phone} />
            </ListItem>
            {index < contacts.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  </Box>
);

const PhoneList = () => {
  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      {renderList("📞 Women (Available Anytime to Talk)", womenContacts)}
      {renderList("📞 Men (Available to Talk)", menContacts)}
    </Box>
  );
};

export default PhoneList;
