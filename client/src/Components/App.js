import React from "react";
import "../Sass/App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import MenuPage from "../Pages/MenuPage";
import LevelsPage from "../Pages/LevelsPage";
import LeadersPage from "../Pages/LeadersPage";
import SettingsPage from "../Pages/SettingsPage";
import GamePage from "../Pages/GamePage";
import NotFoundPage from "../Pages/NotFoundPage";

function App() {
  return (
    <GoogleOAuthProvider clientId="208385145027-2rrf39t2f0f9fb0d03mrm2epjnlf1bgf.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/levels" element={<LevelsPage />} />
          <Route path="/leaders" element={<LeadersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;