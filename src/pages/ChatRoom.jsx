import React from "react";
import { Box, Typography } from "@mui/material";

const ChatRoom = () => {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          🚧 Under Construction
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page is being built. Please check back soon.
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatRoom;
