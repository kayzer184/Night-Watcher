import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import LoginGoogleButton from "../Components/LoginGoogleButton";

import Background from "../Components/Background";
import '../Sass/SettingsPage.scss';

function SettingsPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess:(response) => {
      console.log(response.access_token)
    },
    onError: (error) => {
      console.log(error)
    }
  })

  function handleBack() {
    setStartAnimation(true);
    setTimeout(() => navigate("/"), 1000);
  }

  return (
    <div className={`SettingsPage ${startAnimation ? "animate" : ""}`}>
      <h1 className="title">Настройки</h1>
      <LoginGoogleButton onClick={handleGoogleLogin} />
      <button onClick={handleBack} className="back-button">Назад</button>
      <Background />
    </div>
  );
}

export default SettingsPage;