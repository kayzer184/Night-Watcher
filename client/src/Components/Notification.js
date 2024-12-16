import React from "react";
import "../Sass/Notification.scss"; // Подключаем CSS файл для стилей

const Alert = ({ status, Notification__text }) => {
  return (
    <div className="alerts-container">
      {status === "success" && (
        <div role="alert" className="alert alert-success">
          <svg
            viewBox="0 0 24 24"
            className="alert-icon"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#38a169" // Зеленый цвет для success
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="alert-text">{Notification__text}</p>
        </div>
      )}

      {status === "error" && (
        <div role="alert" className="alert alert-error">
          <svg
            viewBox="0 0 24 24"
            className="alert-icon"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#e53e3e" // Красный цвет для error
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="alert-text">{Notification__text}</p>
        </div>
      )}
    </div>
  );
};

export default Alert;