import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import CreateScreenName from "./components/CreateScreenName";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Meetings from "./pages/Meetings";
import Meditation from "./pages/Meditation"; // ✅ New import

const ProtectedRoute = ({ children }) => {
  const { user, loading, screenName } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (!screenName && window.location.pathname !== "/create-screen-name") {
    return <Navigate to="/create-screen-name" />;
  }
  return children;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-screen-name" element={<CreateScreenName />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <ProtectedRoute>
              <Meetings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meditation"
          element={
            <ProtectedRoute>
              <Meditation />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
