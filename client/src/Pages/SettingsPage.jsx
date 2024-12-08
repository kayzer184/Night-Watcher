import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import LoginGoogleButton from "../Components/LoginGoogleButton";

import Background from "../Components/Background";
import "../Sass/SettingsPage.scss";

function SettingsPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Google login successful:", response);
      setShowModal(true); // Показываем модальное окно
    },
    onError: (error) => {
      console.log(error);
    },
  });

  function handleBack() {
    setStartAnimation(true);
    setTimeout(() => navigate("/"), 1000);
  }

  function handleSendRequest({ response }) {
    // Отправляем запрос на сервер
    fetch("https://api-night-watcher.vercel.app/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        access_token: response.access_token,
        username: inputValue
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Server response:", data);
        setShowModal(false); // Закрываем модальное окно
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
  }

  return (
    <div className={`SettingsPage ${startAnimation ? "animate" : ""}`}>
      <h1 className="title">Настройки</h1>
      <LoginGoogleButton onClick={handleGoogleLogin} />
      <button onClick={handleBack} className="back-button">
        Назад
      </button>
      <Background />

      {/* Модальное окно */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Введите данные</h2>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите значение"
            />
            <div className="modal-buttons">
              <button onClick={handleSendRequest}>Отправить</button>
              <button onClick={() => setShowModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;