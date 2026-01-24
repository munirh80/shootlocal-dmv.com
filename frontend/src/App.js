import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import HomePage from "./pages/HomePage";
import RangeDetailPage from "./pages/RangeDetailPage";
import SubmitRangePage from "./pages/SubmitRangePage";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/range/:id" element={<RangeDetailPage />} />
            <Route path="/submit" element={<SubmitRangePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;