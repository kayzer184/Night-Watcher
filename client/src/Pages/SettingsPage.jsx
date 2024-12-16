
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import LoginGoogleButton from "../Components/LoginGoogleButton";

import Background from "../Components/Background";
import "../Sass/SettingsPage.scss";
import Card from "../Components/Notification";

function SettingsPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [accessToken, setAccessToken] = useState(""); // Сохраняем access_token
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Google login successful:", response);
      setAccessToken(response.access_token); // Сохраняем токен
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

  function handleSendRequest() {
    // Проверяем, что есть токен
    if (!accessToken) {
      console.error("Access token is missing!");
      return;
    }

    // Отправляем запрос на сервер
    fetch("https://api-night-watcher.vercel.app/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
        username: inputValue,
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
      <Card />
      <button onClick={handleBack} className="back-button">
        Назад
      </button>
      <Background />

      {/* Модальное окно */}
      {showModal && (
        <div class="modal__backdrop">
          <div class="modal">
            <span class="modal__title">Регистрация</span>
            <p class="modal__content">Введите своё имя, под которым попадёте в таблицу лидеров</p>
            <div class="modal__form">
              <input
                type="text"
                name="username"
                className="modal-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Введите ваш никнейм"
              />
              <button class="modal__sign-up">Зарегистрироваться</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
