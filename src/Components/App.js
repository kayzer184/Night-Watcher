import React from "react";
import "../Sass/App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuPage from "../Pages/MenuPage";
import LeadersPage from "../Pages/LeadersPage";
import SettingsPage from "../Pages/SettingsPage";
import GamePage from "../Pages/GamePage";
import NotFoundPage from "../Pages/NotFoundPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/leaders" element={<LeadersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
