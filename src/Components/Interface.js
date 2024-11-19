import React, { useState, useEffect } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
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
  Energy,
  onPause,
  onRestart,
  isPaused,
  timeLeft,
  isWin,
}) {
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isWin !== null) {
      setModalVisible(true); // Показываем модальное окно, если таймер достиг 0
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
            <li>Оставшееся энергия: {Energy}%</li>
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
            <li>Оставшееся энергия: {Energy}%</li>
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
