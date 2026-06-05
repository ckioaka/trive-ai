import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
};

export default function App() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("trive-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(function(prev) {
      return prev === "dark" ? "light" : "dark";
    });
  };

  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to="/chat" /> : <Landing toggleTheme={toggleTheme} theme={theme} />
      } />
      <Route path="/auth" element={
        user ? <Navigate to="/chat" /> : <Auth />
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat toggleTheme={toggleTheme} theme={theme} />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}