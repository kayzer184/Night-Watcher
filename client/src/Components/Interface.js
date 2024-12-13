import React, { useState, useEffect } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import createDevTools from './DevTools';
import Modal from "./Modal";
import "../Sass/Interface.scss";
import reset from "../Assets/Icons/ResetButton.svg";

// Helper function to determine mood color
function getMoodColor(mood) {
  const red = Math.max(255 - mood * 2.55, 0);
  const green = Math.max(mood * 2.55, 0);
  return `rgb(${red}, ${green}, 0)`;
}

function Interface({
  NPCObjects,
  NPCMood,
  setNPCMood,
  Energy,
  setEnergy,
  timeLeft,
  setTimeLeft,
  NPCMoodDecayRate,
  setNPCMoodDecayRate,
  energyDecayRate,
  setEnergyDecayRate,
  onPause,
  onRestart,
  isPaused,
  isWin,
}) {
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const { stats, gui } = createDevTools();
  
    const Settings = {
      fps: false,
    };

    const setNPCSpeed = (newSpeed) => {
      if (Array.isArray(NPCObjects.current)) {
        NPCObjects.current.forEach(npc => {
          npc.speed = newSpeed; 
          npc.mixer.timeScale = newSpeed * 2;
        });
      } else {
        console.error('NPCObjects.current не является массивом');
      }
    };  
  
    const toggleFPS = () => {
      if (Settings.fps) {
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
      } else {
        stats.dom?.parentNode?.removeChild(stats.dom);
      }
    };
  
    // GUI setup
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
  
    PlayerStats.add({ NPCSpeed: 0.33 }, "NPCSpeed")
      .min(0)
      .max(1)
      .step(0.01)
      .name("Скорость NPC")
      .onChange(setNPCSpeed);

    PlayerStats.add({ NPCMoodDecayRate: 0.005 }, "NPCMoodDecayRate")
      .min(0)
      .max(1)
      .step(0.001)
      .name("Скорость расхода настроения")
      .onChange(setNPCMoodDecayRate);

    PlayerStats.add({ energyDecayRate: 1 }, "energyDecayRate")
      .min(0)
      .max(10)
      .step(0.01)
      .name("Скорость расхода энергии")
      .onChange(setEnergyDecayRate);
  
    GameSettings.add(Settings, "fps")
      .name("Показывать FPS")
      .onChange(toggleFPS);
  
    const animationFrame = () => {
      if (Settings.fps) {
        stats.begin();
        stats.end();
      }
      requestAnimationFrame(animationFrame); // Recursive call
    };
  
    requestAnimationFrame(animationFrame); // Start the loop
  
    toggleFPS(); // Initialize FPS state
  
    return () => {
      // Cleanup
      gui.destroy();
      stats.dom?.parentNode?.removeChild(stats.dom); // Remove FPS panel
    };
  }, []);   

  useEffect(() => {
    if (isWin !== null) {
      setModalVisible(true); // Show modal
    }
  }, [isWin]);

  const closeModal = () => setModalVisible(false);

  return (
    <div className="Interface">
      {/* Mood Progress Bar */}
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

      {/* Energy Progress Bar */}
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

      {/* Timer */}
      <div className="Timer">
        <h3>Осталось времени</h3>
        <div className="Timer-Display">{timeLeft}</div>
      </div>

      {/* Pause and Reset Buttons */}
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

      {/* Modal for Win or Lose */}
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
              onRestart(); // Restart game
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
              onRestart(); // Restart game
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
