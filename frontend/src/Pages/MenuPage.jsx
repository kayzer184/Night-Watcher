import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Sass/MenuPage.scss";
import Background from "../Components/Background";

function MenuPage() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = () => {
    setStartAnimation(true);
    setTimeout(() => navigate("/levels"), 1000);
  };

  const handleOpenLeaders = () => {
    setStartAnimation(true);
    setTimeout(() => navigate("/leaders"), 1000);
  }

  const handleOpenSettings = () => {
    setStartAnimation(true);
    setTimeout(() => navigate("/settings"), 1000);
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
      <h1 className="title">Ночной смотритель 💡</h1>
      <button className="start-button" onClick={handleStartGame}>Начать игру</button>
      <button className="leaders-button" onClick={handleOpenLeaders}>Лидеры</button>
      <button className="settings-button" onClick={handleOpenSettings}>Настройки</button>
      <button className="fullscreen-button" onClick={isFullScreen ? handleExitFullscreen : handleOpenFullScreen}>Полноэкранный режим</button>
      <Background />
    </div>
  );
}

export default MenuPage;
