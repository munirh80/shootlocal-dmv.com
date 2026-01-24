import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DefaultSEO } from "./components/SEO";
import HomePage from "./pages/HomePage";
import RangeDetailPage from "./pages/RangeDetailPage";
import SubmitRangePage from "./pages/SubmitRangePage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <div className="App">
          <DefaultSEO />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/range/:id" element={<RangeDetailPage />} />
              <Route path="/submit" element={<SubmitRangePage />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
            <Toaster position="top-right" />
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;