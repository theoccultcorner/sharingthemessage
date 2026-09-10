import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#153f3a", dark: "#0b2b28", light: "#d9ebe5", contrastText: "#ffffff" },
    secondary: { main: "#c98232", dark: "#955815", light: "#f7e4c8" },
    background: { default: "#f3f5f1", paper: "#ffffff" },
    text: { primary: "#172522", secondary: "#60706b" },
    success: { main: "#34785f" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, "Segoe UI", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 750, letterSpacing: "-0.045em" },
    h2: { fontWeight: 740, letterSpacing: "-0.035em" },
    h3: { fontWeight: 720, letterSpacing: "-0.025em" },
    h4: { fontWeight: 720, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 680 },
    button: { fontWeight: 700, textTransform: "none", letterSpacing: 0 },
    body1: { lineHeight: 1.65 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { minHeight: "100vh", background: "#f3f5f1" },
        "::selection": { background: "#cde3dc", color: "#0b2b28" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 44, borderRadius: 12, paddingInline: 18 } },
    },
    MuiCard: {
      styleOverrides: { root: { border: "1px solid rgba(21,63,58,.09)", boxShadow: "0 12px 34px rgba(25,55,49,.08)" } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiTextField: { defaultProps: { variant: "outlined" } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12, background: "#fff" } } },
    MuiAccordion: {
      styleOverrides: { root: { border: "1px solid rgba(21,63,58,.1)", boxShadow: "none", marginBottom: 10, borderRadius: "14px !important", overflow: "hidden", "&:before": { display: "none" } } },
    },
  },
});

export default theme;
