import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { DefaultSEO } from "./components/SEO";
import HomePage from "./pages/HomePage";
import RangeDetailPage from "./pages/RangeDetailPage";
import SubmitRangePage from "./pages/SubmitRangePage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AuthCallback from "./pages/AuthCallback";
import FavoritesPage from "./pages/FavoritesPage";
import "./App.css";

// Router component that handles session_id detection
function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id (Google OAuth callback)
  // This must be checked synchronously during render, not in useEffect
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/range/:id" element={<RangeDetailPage />} />
      <Route path="/submit" element={<SubmitRangePage />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/favorites" element={<FavoritesPage />} />
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <div className="App">
            <DefaultSEO />
            <BrowserRouter>
              <AppRouter />
              <Toaster position="top-right" />
            </BrowserRouter>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;