import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import LoginGoogleButton from "../Components/LoginGoogleButton";

import Background from "../Components/Background";
import "../Sass/SettingsPage.scss";
import Card from "../Components/Notification";

function SettingsPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const [showModal, setShowModal] = useState(false); // Показывать модальное окно?
  const [inputValue, setInputValue] = useState("");
  const [accessToken, setAccessToken] = useState(""); // Сохраняем access_token
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Google login successful:", response);
      setAccessToken(response.access_token); // Сохраняем токен

      // Отправляем токен на сервер
      fetch("https://api-night-watcher.vercel.app/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: response.access_token,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Server response:", data);

          // Логика показа модального окна в зависимости от статуса ответа
          if (data.status === "registration") {
            setShowModal(true); // Показываем модальное окно для регистрации
          } else if (data.status === "login") {
            console.log("Login successful!");
            setShowModal(false); // Модальное окно не нужно
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    onError: (error) => {
      console.error(error);
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

    // Отправляем запрос на сервер для завершения регистрации
    fetch("https://api-night-watcher.vercel.app/register", {
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
        console.log("Registration response:", data);
        setShowModal(false); // Закрываем модальное окно после успешной регистрации
      })
      .catch((error) => {
        console.error("Error sending registration request:", error);
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

      {/* Модальное окно для регистрации */}
      {showModal && (
        <div className="modal">
          <span className="modal__title">Регистрация</span>
          <p className="modal__content">
            Введите своё имя, под которым попадёте в таблицу лидеров
          </p>
          <div className="modal__form">
            <input
              type="text"
              name="username"
              className="modal-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите ваш никнейм"
            />
            <button className="modal__sign-up" onClick={handleSendRequest}>
              Зарегистрироваться
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
