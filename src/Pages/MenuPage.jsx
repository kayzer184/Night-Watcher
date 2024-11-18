import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Sass/MenuPage.scss";
import Background from "../Components/Background";

function MenuPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = () => {
    setStartAnimation(true);
    setTimeout(() => navigate("/game"), 1000);
  };

  function handleOpenFullScreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(); // Для Safari
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen(); // Для IE/Edge
    }
    setIsFullScreen(true);
  };

  function handleExitFullscreen() {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Для Safari
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // Для IE/Edge
      }
      setIsFullScreen(false);
    }
    handleOpenFullScreen();
  };

  return (
    <div className={`MenuPage ${startAnimation ? "animate" : ""}`}>
      <h1 className="title">Night Watcher 💡</h1>
      <button className="start-button" onClick={handleStartGame}>Начать игру</button>
      <button className="fullscreen-button" onClick={isFullScreen ? handleExitFullscreen : handleOpenFullScreen}>Fullscreen</button>
      <Background />
    </div>
  );
}

export default MenuPage;
