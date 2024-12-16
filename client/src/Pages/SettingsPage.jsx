import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import LoginGoogleButton from "../Components/LoginGoogleButton";
import Background from "../Components/Background";
import "../Sass/SettingsPage.scss";
import Card from "../Components/Notification";

function SettingsPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const [showModal, setShowModal] = useState(false); // Показывать модальное окно
  const [inputValue, setInputValue] = useState(""); // Поле для ввода ника
  const [accessToken, setAccessToken] = useState(""); // Сохраняем access_token
  const [errorMessage, setErrorMessage] = useState(""); // Для ошибок
  const navigate = useNavigate();

  // Авторизация через Google
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

          // Обработка статусов
          if (data.status === "registration") {
            setShowModal(true); // Показываем модальное окно для регистрации
          } else if (data.status === "login") {
            console.log("Login successful!");
            setShowModal(false); // Модальное окно не нужно
            navigate("/dashboard"); // Перенаправляем пользователя
          } else {
            setErrorMessage("Неизвестный статус ответа от сервера.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setErrorMessage("Ошибка при обращении к серверу.");
        });
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
      setErrorMessage("Ошибка авторизации через Google.");
    },
  });

  // Обработчик кнопки "Назад"
  function handleBack() {
    setStartAnimation(true);
    setTimeout(() => navigate("/"), 1000);
  }

  // Обработка завершения регистрации
  function handleSendRequest() {
    if (!accessToken) {
      console.error("Access token is missing!");
      setErrorMessage("Access token отсутствует. Попробуйте снова авторизоваться.");
      return;
    }

    if (!inputValue.trim()) {
      setErrorMessage("Поле имени не может быть пустым.");
      return;
    }

    // Отправляем запрос на завершение регистрации
    fetch("https://api-night-watcher.vercel.app/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
        username: inputValue.trim(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Registration response:", data);
        if (data.success) {
          setShowModal(false); // Закрываем модальное окно
          navigate("/dashboard"); // Перенаправляем пользователя
        } else {
          setErrorMessage(data.message || "Ошибка регистрации.");
        }
      })
      .catch((error) => {
        console.error("Error sending registration request:", error);
        setErrorMessage("Ошибка сети при отправке данных.");
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

      {/* Ошибки */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

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