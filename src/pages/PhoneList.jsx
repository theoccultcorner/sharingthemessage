import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { womenContacts, menContacts } from "../data/phoneData";

const PHONE_EDITOR_EMAIL = "nmsaucedapalacios@gmail.com";
const PHONE_LIST_REF = doc(db, "phoneLists", "main");

const formatContacts = (contacts) =>
  contacts.map((entry) => `${entry.name} | ${entry.phone}`).join("\n");

const parseContacts = (value) =>
  value
    .split("\n")
    .map((line) => {
      const [name, ...phoneParts] = line.split("|");
      return {
        name: name?.trim() || "",
        phone: phoneParts.join("|").trim(),
      };
    })
    .filter((entry) => entry.name && entry.phone);

export default function PhoneList() {
  const { user } = useAuth();

  const canEdit =
    user?.email?.toLowerCase() === PHONE_EDITOR_EMAIL.toLowerCase();

  const [contacts, setContacts] = useState({
    women: womenContacts,
    men: menContacts,
  });

  const [view, setView] = useState("women");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const snapshot = await getDoc(PHONE_LIST_REF);

        if (snapshot.exists()) {
          const data = snapshot.data();

          setContacts({
            women: data.women || womenContacts,
            men: data.men || menContacts,
          });
        }
      } catch (err) {
        console.error("Unable to load phone list:", err);
        setError("Unable to load the phone list.");
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  useEffect(() => {
    setDraft(formatContacts(contacts[view]));
  }, [contacts, view]);

  const filteredContacts = useMemo(() => {
    return contacts[view].filter((entry) =>
      `${entry.name} ${entry.phone}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [contacts, search, view]);

  const handleSave = async () => {
    if (!canEdit) return;

    const updatedContacts = {
      ...contacts,
      [view]: parseContacts(draft),
    };

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await setDoc(PHONE_LIST_REF, {
        women: updatedContacts.women,
        men: updatedContacts.men,
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
      });

      setContacts(updatedContacts);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      console.error("Unable to save phone list:", err);
      setError("Unable to save the phone list.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", py: { xs: 3, md: 5 }, px: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "flex-end" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="overline"
            color="secondary.dark"
            sx={{ fontWeight: 800, letterSpacing: ".12em" }}
          >
            FELLOWSHIP
          </Typography>

          <Typography variant="h4">Phone list</Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Tap a member to call. Use search to find someone quickly.
          </Typography>
        </Box>

        {canEdit && (
          <Button
            variant={editing ? "contained" : "outlined"}
            startIcon={editing ? <SaveRoundedIcon /> : <EditRoundedIcon />}
            onClick={editing ? handleSave : () => setEditing(true)}
            disabled={saving}
          >
            {saving ? "Saving…" : editing ? "Save list" : "Edit list"}
          </Button>
        )}
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {saved && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          Phone list updated successfully.
        </Typography>
      )}

      <ToggleButtonGroup
        value={view}
        exclusive
        fullWidth
        onChange={(event, newView) => {
          if (newView !== null) setView(newView);
        }}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="women">Women</ToggleButton>
        <ToggleButton value="men">Men</ToggleButton>
      </ToggleButtonGroup>

      {editing && canEdit ? (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <TextField
              label="Phone contacts"
              multiline
              minRows={12}
              fullWidth
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              helperText="Enter one contact per line using: Name | Phone number"
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <TextField
            label="Search by name or number"
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ mb: 2 }}
          />

          <Paper sx={{ p: 2 }}>
            <List>
              {filteredContacts.length === 0 ? (
                <Typography variant="body2" align="center">
                  No contacts found.
                </Typography>
              ) : (
                filteredContacts.map((entry, index) => (
                  <React.Fragment key={`${entry.name}-${entry.phone}-${index}`}>
                    <ListItem
                      component="a"
                      href={`tel:${entry.phone.replace(/[^0-9]/g, "")}`}
                      sx={{ cursor: "pointer" }}
                    >
                      <ListItemText
                        primary={entry.name}
                        secondary={entry.phone}
                      />
                    </ListItem>

                    {index < filteredContacts.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </>
      )}
    </Box>
  );
}
