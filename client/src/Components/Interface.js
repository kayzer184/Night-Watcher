import React, { useState, useEffect } from "react";
import ProgressBar from "@ramonak/react-progress-bar";

import createDevTools from './DevTools';
import Modal from "./Modal";
import "../Sass/Interface.scss";
import reset from "../Assets/Icons/ResetButton.svg";

function getMoodColor(mood) {
  const red = Math.max(255 - mood * 2.55, 0);
  const green = Math.max(mood * 2.55, 0);
  return `rgb(${red}, ${green}, 0)`;
}

function Interface({
  NPCMood,
  setNPCMood,
  Energy,
  setEnergy,
  onPause,
  onRestart,
  isPaused,
  timeLeft,
  setTimeLeft,
  isWin,
}) {
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const { stats, gui } = createDevTools();
  
    const Settings = {
      fps: false,
    };
  
    const toggleFPS = () => {
      if (Settings.fps) {
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
      } else {
        stats.dom?.parentNode?.removeChild(stats.dom);
      }
    };
  
    // Инициализация GUI папок
    const GameEvents = gui.addFolder("Game Events");
    const PlayerStats = gui.addFolder("Player Stats");
    const GameSettings = gui.addFolder("Game Settings");
  
    GameEvents.add({ pause: onPause }, "pause").name("Пауза");
    GameEvents.add({ reset: onRestart }, "reset").name("Сбросить");
  
    PlayerStats.add({ NPCMood }, "NPCMood")
      .min(0)
      .max(100)
      .step(1)
      .name("Настроение")
      .onChange(setNPCMood);
    PlayerStats.add({ Energy }, "Energy")
      .min(0)
      .max(100)
      .step(1)
      .name("Энергия")
      .onChange(setEnergy);
    PlayerStats.add({ timeLeft }, "timeLeft")
      .min(0)
      .max(300)
      .step(1)
      .name("Время")
      .onChange(setTimeLeft);
  
    GameSettings.add(Settings, "fps")
      .name("Показывать FPS")
      .onChange(toggleFPS);
  
    const animationFrame = () => {
      if (Settings.fps) {
        stats.begin();
        stats.end();
      }
      requestAnimationFrame(animationFrame); // Рекурсивный вызов
    };
  
    requestAnimationFrame(animationFrame); // Запуск цикла
  
    toggleFPS(); // Инициализация состояния FPS
  
    return () => {
      // Очистка
      gui.destroy();
      stats.dom?.parentNode?.removeChild(stats.dom); // Удаляем FPS-панель
    };
  }, []);   

  useEffect(() => {
    if (isWin !== null) {
      setModalVisible(true); // Показываем модальное окно
    }
  }, [isWin]);

  const closeModal = () => setModalVisible(false);

  return (
    <div className="Interface">
      <div className="ProgressBar-Wrapper">
        <h3>Настроение пешеходов</h3>
        <ProgressBar
          completed={NPCMood}
          bgColor={getMoodColor(NPCMood)}
          labelColor="#ffffff"
          height="20px"
          borderRadius="5px"
          baseBgColor="#e0e0e0"
          labelAlignment="center"
        />
      </div>
      <div className="ProgressBar-Wrapper">
        <h3>Запас энергии</h3>
        <ProgressBar
          completed={Energy}
          bgColor="#FFD700"
          labelColor="#333333"
          height="20px"
          borderRadius="5px"
          baseBgColor="#333333"
          labelAlignment="center"
        />
      </div>

      {/* Таймер */}
      <div className="Timer">
        <h3>Осталось времени</h3>
        <div className="Timer-Display">{timeLeft}</div>
      </div>

      <button onClick={onPause} className="pause-button interface-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          {!isPaused ? (
            <g>
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </g>
          ) : (
            <polygon points="5,3 19,12 5,21" />
          )}
        </svg>
      </button>
      <button onClick={onRestart} className="reset-button interface-button">
        <img src={reset} alt="reset" />
      </button>
      {isWin ? (
        <Modal isVisible={isModalVisible} onClose={closeModal}>
          <h2>Уровень пройден!</h2>
          <p>Статистика за уровень:</p>
          <ul>
            <li>Настроение пешеходов: {NPCMood}%</li>
            <li>Оставшаяся энергия: {Energy}%</li>
          </ul>
          <button
            className="reset-modal-button interface-button"
            onClick={() => {
              closeModal();
              onRestart(); // Перезапуск игры
            }}
          >
            <img src={reset} alt="reset" />
          </button>
        </Modal>
      ) : (
        <Modal isVisible={isModalVisible} onClose={closeModal}>
          <h2 className="lose-text">Поражение!</h2>
          <p>Статистика за уровень:</p>
          <ul>
            <li>Настроение пешеходов: {NPCMood}%</li>
            <li>Оставшаяся энергия: {Energy}%</li>
          </ul>
          <button
            className="reset-modal-button interface-button"
            onClick={() => {
              closeModal();
              onRestart(); // Перезапуск игры
            }}
          >
            <img src={reset} alt="reset" />
          </button>
        </Modal>
      )}
    </div>
  );
}

export default Interface;
