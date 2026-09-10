import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import CreateScreenName from "./components/CreateScreenName";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Meetings from "./pages/Meetings";
import Meditation from "./pages/Meditation";
import Chatroom from "./pages/ChatRoom";
import PhoneList from "./pages/PhoneList";
import StmGsrReportPage from "./pages/StmGsrReportPage";
import Audiobooks from "./pages/Audiobooks";
import MembersList from "./pages/MembersList";
import SponsorChat from "./pages/SponsorChat"; // ✅ Import SponsorChat
import AppShell from "./components/AppShell";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CircularProgress, CssBaseline } from "@mui/material";
import theme from "./theme";

const ProtectedRoute = ({ children }) => {
  const { user, loading, screenName } = useAuth();

  if (loading) return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress size={32} /></Box>;
  if (!user) return <Navigate to="/" />;
  if (!screenName && window.location.pathname !== "/create-screen-name") {
    return <Navigate to="/create-screen-name" />;
  }

  return <AppShell>{children}</AppShell>;
};

const ScreenNameRoute = ({ children }) => {
  const { user, loading, screenName } = useAuth();
  if (loading) return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress size={32} /></Box>;
  if (!user) return <Navigate to="/" replace />;
  if (screenName) return <Navigate to="/home" replace />;
  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/create-screen-name" element={<ScreenNameRoute><CreateScreenName /></ScreenNameRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
          <Route path="/meditation" element={<ProtectedRoute><Meditation /></ProtectedRoute>} />
          <Route path="/chatroom" element={<ProtectedRoute><Chatroom /></ProtectedRoute>} />
          <Route path="/gsr-report" element={<ProtectedRoute><StmGsrReportPage /></ProtectedRoute>} />
          <Route path="/phone-list" element={<ProtectedRoute><PhoneList /></ProtectedRoute>} />
          <Route path="/audiobooks" element={<ProtectedRoute><Audiobooks /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
          <Route path="/sponsor-chat" element={<ProtectedRoute><SponsorChat /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
