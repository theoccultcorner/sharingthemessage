import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,

  Grid,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const GSR_EDITOR_EMAIL = "nmsaucedapalacios@gmail.com";
const REPORT_REF = doc(db, "reports", "gsr");

const defaultSections = [
  {
    title: "Service positions",
    icon: WorkOutlineRoundedIcon,
    items: [
      "STM group positions open: Vice-Chair, GSR, and Literature.",
      "Thursday noon and Sunday 8 PM secretary positions are open.",
      "Greeters, coffee persons, and Meeting Service Representatives are needed for all STM meetings.",
    ],
  },
  {
    title: "Meeting news",
    icon: CampaignRoundedIcon,
    items: [
      "Guad Squad: Wednesday at 7 PM, 4635 6th Street.",
      "Survivors Birthday/Speaker Meeting: Saturday, December 20 — Glenn S.",
      "STM Birthday/Speaker Meeting: December 27 at 8 PM — Kila.",
      "STM Activities Committee meets January 10 at 9 AM; Group Service meets at 10 AM. Meeting secretaries are asked to attend.",
    ],
  },
  {
    title: "Activities",
    icon: CelebrationRoundedIcon,
    items: [
      "SBNA Deck the Halls: December 20, 3–10 PM at 235 E. Cota St., Santa Barbara. Presale tickets: $30.",
      "STM New Year Speaker Bash: December 31. Speakers begin at 1:30 PM, dinner and karaoke run 6–8 PM, the evening speaker begins at 8 PM, and dancing runs 9 PM–12:30 AM.",
      "The New Year event is free. Dinner plates are $10; children eat free.",
    ],
  },
  {
    title: "Other NA announcements",
    icon: PublicRoundedIcon,
    items: [
      "Please donate new, unused toys for the STM toy drive.",
      "Spanish NA literature and STM gear are available; order information is posted at the meeting.",
      "Celebrating a milestone? Add your name, clean date, and clean time to the board.",
      "Public Relations, Hospitals & Institutions, and Behind the Walls Sponsorship need volunteers.",
    ],
  },
];

export default function GSRReport() {
  const { user } = useAuth();
  const canEdit =
    user?.email?.toLowerCase() === GSR_EDITOR_EMAIL.toLowerCase();

  const [sections, setSections] = useState(defaultSections);
  const [reportDate, setReportDate] = useState("December 2025");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadReport = async () => {
      try {
        const snapshot = await getDoc(REPORT_REF);

        if (snapshot.exists()) {
          const data = snapshot.data();

          setSections(
            (data.sections || defaultSections).map((section, index) => ({
              ...section,
              icon: defaultSections[index]?.icon || PublicRoundedIcon,
            }))
          );

          setReportDate(data.reportDate || "December 2025");
        }
      } catch (err) {
        console.error("Unable to load GSR report:", err);
        setError("Unable to load the latest report.");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  const updateSectionText = (sectionIndex, value) => {
    setSections((current) =>
      current.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              items: value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            }
          : section
      )
    );
  };

  const handleSave = async () => {
    if (!canEdit) return;

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await setDoc(REPORT_REF, {
        reportDate,
        sections: sections.map(({ title, items }) => ({
          title,
          items,
        })),
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
      });

      setEditing(false);
      setSaved(true);
    } catch (err) {
      console.error("Unable to save GSR report:", err);
      setError("Unable to save the report. Please try again.");
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
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
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
            GROUP SERVICE REPRESENTATIVE
          </Typography>

          <Typography variant="h4">STM GSR report</Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Group business, opportunities, events, and fellowship updates.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={reportDate}
            sx={{
              bgcolor: "primary.light",
              color: "primary.dark",
              fontWeight: 750,
            }}
          />

          {canEdit && (
            <Button
              variant={editing ? "contained" : "outlined"}
              startIcon={editing ? <SaveRoundedIcon /> : <EditRoundedIcon />}
              onClick={editing ? handleSave : () => setEditing(true)}
              disabled={saving}
            >
              {saving ? "Saving…" : editing ? "Save report" : "Edit report"}
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Report updated successfully.
        </Alert>
      )}

      {editing && canEdit && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Report settings</Typography>

              <TextField
                label="Report date"
                value={reportDate}
                onChange={(event) => setReportDate(event.target.value)}
                fullWidth
              />

              <Typography variant="body2" color="text.secondary">
                Edit each section below. Keep one announcement per line.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        This is the latest report currently posted in the app. Confirm dates
        with the meeting before attending an event.
      </Alert>

      <Grid container spacing={2.5}>
        {sections.map(({ title, icon: Icon, items }, sectionIndex) => (
          <Grid item xs={12} md={6} key={title}>
            <Paper
              component="section"
              elevation={0}
              sx={{
                height: "100%",
                p: { xs: 2.5, md: 3.5 },
                border: "1px solid rgba(21,63,58,.1)",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 2.5,
                    bgcolor: "primary.light",
                    color: "primary.dark",
                  }}
                >
                  <Icon />
                </Box>

                <Typography variant="h5">{title}</Typography>
              </Stack>

              {editing && canEdit ? (
                <TextField
                  multiline
                  minRows={7}
                  fullWidth
                  value={items.join("\n")}
                  onChange={(event) =>
                    updateSectionText(sectionIndex, event.target.value)
                  }
                  helperText="One announcement per line"
                />
              ) : (
                <List disablePadding>
                  {items.map((item) => (
                    <ListItem
                      key={item}
                      alignItems="flex-start"
                      sx={{ px: 0, py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, pt: 0.3 }}>
                        <CheckCircleOutlineRoundedIcon
                          color="primary"
                          sx={{ fontSize: 19 }}
                        />
                      </ListItemIcon>

                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: "body2",
                          lineHeight: 1.65,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          mt: 2.5,
          p: 2.5,
          border: "1px solid rgba(21,63,58,.1)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <PublicRoundedIcon color="primary" />

        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography sx={{ fontWeight: 750 }}>Central Coast NA</Typography>
          <Typography variant="body2" color="text.secondary">
            Find current regional information and announcements.
          </Typography>
        </Box>

        <Link
          href="https://centralcoastna.org"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontWeight: 750,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          Visit website
          <OpenInNewRoundedIcon fontSize="small" />
        </Link>
      </Paper>
    </Container>
  );
}
