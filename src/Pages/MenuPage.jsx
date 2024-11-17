import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Sass/MenuPage.scss";

function MenuPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = () => {
    setStartAnimation(true);
    setTimeout(() => navigate("/game"), 1000);
  };

  return (
    <div className={`MenuPage ${startAnimation ? "animate" : ""}`}>
      <h1 className="title">Night Watcher 👁️ 👁️</h1>
      <button className="start-button" onClick={handleStartGame}>
        Начать игру
      </button>
    </div>
  );
}

export default MenuPage;
