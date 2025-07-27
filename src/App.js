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

const ProtectedRoute = ({ children }) => {
  const { user, loading, screenName } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (!screenName && window.location.pathname !== "/create-screen-name") {
    return <Navigate to="/create-screen-name" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/create-screen-name" element={<CreateScreenName />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
          <Route path="/meditation" element={<ProtectedRoute><Meditation /></ProtectedRoute>} />
          <Route path="/chatroom" element={<ProtectedRoute><Chatroom /></ProtectedRoute>} />
          <Route path="/gsr-report" element={<ProtectedRoute><StmGsrReportPage /></ProtectedRoute>} />
          <Route path="/phone-list" element={<ProtectedRoute><PhoneList /></ProtectedRoute>} />
          <Route path="/audiobooks" element={<ProtectedRoute><Audiobooks /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
          <Route path="/sponsor-chat" element={<ProtectedRoute><SponsorChat /></ProtectedRoute>} /> {/* ✅ New route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
