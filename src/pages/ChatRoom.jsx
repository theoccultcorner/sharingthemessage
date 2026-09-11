import React, { useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, Container, Divider, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { onValue, orderByChild, push, query, ref, remove, set } from "firebase/database";
import { rtdb } from "../firebase";
import { useAuth } from "../context/AuthContext";

const BOARD_PATH = "message_board";
const MAX_MESSAGE_LENGTH = 500;
const formatDate = (timestamp) => timestamp ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp)) : "Just now";

export default function ChatRoom() {
  const { user, screenName } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const boardQuery = query(ref(rtdb, BOARD_PATH), orderByChild("createdAt"));
    return onValue(boardQuery, (snapshot) => {
      const next = [];
      snapshot.forEach((child) => next.push({ id: child.key, ...child.val() }));
      setMessages(next);
      setLoading(false);
      setError("");
    }, () => {
      setLoading(false);
      setError("We couldn’t load the message board. Please try again.");
    });
  }, []);

  const remaining = MAX_MESSAGE_LENGTH - message.length;
  const canSend = useMemo(() => Boolean(user && message.trim() && !sending), [message, sending, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const body = message.trim();
    if (!user || !body || body.length > MAX_MESSAGE_LENGTH) return;
    setSending(true);
    setError("");
    try {
      const postRef = push(ref(rtdb, BOARD_PATH));
      await set(postRef, { body, authorId: user.uid, authorName: screenName?.trim() || user.displayName || "Member", authorPhotoURL: user.photoURL || "", createdAt: Date.now() });
      setMessage("");
    } catch {
      setError("Your message couldn’t be posted. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try { await remove(ref(rtdb, `${BOARD_PATH}/${id}`)); }
    catch { setError("That message couldn’t be removed. Please try again."); }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <ForumRoundedIcon color="secondary" />
            <Typography variant="overline" color="secondary.dark" sx={{ fontWeight: 800, letterSpacing: ".12em" }}>FELLOWSHIP</Typography>
          </Stack>
          <Typography variant="h3">Message board</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Share encouragement, ask a question, or let the fellowship know how you’re doing today.</Typography>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <Card component="form" onSubmit={handleSubmit}>
          <CardContent>
            <Stack spacing={1.5}>
              <TextField label="Write a message" multiline minRows={3} fullWidth value={message} onChange={(event) => setMessage(event.target.value.slice(0, MAX_MESSAGE_LENGTH))} placeholder="What would you like to share?" disabled={!user || sending} helperText={user ? `${remaining} characters remaining` : "Sign in to join the conversation."} />
              <Button type="submit" variant="contained" color="primary" endIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon />} disabled={!canSend} sx={{ alignSelf: { sm: "flex-end" } }}>{sending ? "Posting…" : "Post message"}</Button>
            </Stack>
          </CardContent>
        </Card>
        <Stack spacing={1.5}>
          {loading ? <Box sx={{ display: "grid", placeItems: "center", py: 6 }}><CircularProgress /></Box> : messages.length === 0 ? <Card><CardContent><Typography align="center" color="text.secondary">No messages yet. Start the conversation.</Typography></CardContent></Card> : messages.map((item) => (
            <Card key={item.id}><CardContent><Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar src={item.authorPhotoURL || undefined} sx={{ bgcolor: "secondary.main" }}>{(item.authorName || "M").charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                  <Box><Typography sx={{ fontWeight: 750 }}>{item.authorName || "Member"}</Typography><Typography variant="caption" color="text.secondary">{formatDate(item.createdAt)}</Typography></Box>
                  {item.authorId === user?.uid && <Tooltip title="Delete message"><IconButton size="small" onClick={() => handleDelete(item.id)} aria-label="Delete message"><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip>}
                </Stack>
                <Divider sx={{ my: 1.25 }} />
                <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.body}</Typography>
              </Box>
            </Stack></CardContent></Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

