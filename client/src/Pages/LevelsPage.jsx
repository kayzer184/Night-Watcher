import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'
import '../Sass/LevelsPage.scss';
import Background from "../Components/Background";

import level1Screenshot from "../Assets/ScreenShots/level1.jpg";
import level2Screenshot from "../Assets/ScreenShots/level2.jpg";
import level3Screenshot from "../Assets/ScreenShots/level3.jpg";


const levelData = [
  {
    id: 1,
    name: "Уровень 1",
    description: "Это первый уровень, где вы познакомитесь с основами.",
    screenshot: level1Screenshot,
  },
  {
    id: 2,
    name: "Уровень 2",
    description: "Сложность повышается. Осторожно!",
    screenshot: level2Screenshot,
  },
  {
    id: 3,
    name: "Уровень 3",
    description: "Приготовьтесь к настоящему вызову!",
    screenshot: level3Screenshot,
  },
];

function LevelsPage() {
  const { user } = useAuth();
  const [startAnimation, setStartAnimation] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null); // Для выбранного уровня
  const navigate = useNavigate();
  console.log(user)

  function handleBack() {
    setStartAnimation(true);
    setTimeout(() => navigate("/"), 1000);
  }

  function handleLevelSelect(level) {
    setSelectedLevel(level); // Устанавливаем выбранный уровень
  }

  function closeModal() {
    setSelectedLevel(null); // Закрываем модальное окно
  }

  return (
    <div className={`LevelsPage ${startAnimation ? "animate" : ""}`}>
      <h1 className="title">Выберите уровень</h1>
      <div className="levels-container">
        {levelData.map((level) => (
          <button
            key={level.id}
            className="level-button"
            onClick={() => handleLevelSelect(level)}
          >
            {level.name}
          </button>
        ))}
      </div>
      <button onClick={handleBack} className="back-button">Назад</button>
      <Background />

      {selectedLevel && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedLevel.name}</h2>
            <img
              src={selectedLevel.screenshot}
              alt={`Скриншот ${selectedLevel.name}`}
              className="level-screenshot"
            />
            <p>{selectedLevel.description}</p>
            <button
              className="play-button"
              onClick={() => navigate(`/game?level=${selectedLevel.id}`)}
            >
              Играть
            </button>
            <button className="close-button" onClick={closeModal}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LevelsPage;
