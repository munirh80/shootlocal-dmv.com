import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import HomePage from "./pages/HomePage";
import RangeDetailPage from "./pages/RangeDetailPage";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/range/:id" element={<RangeDetailPage />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;