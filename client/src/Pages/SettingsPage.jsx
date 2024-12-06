import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "../Components/GoogleButton";

import Background from "../Components/Background";
import '../Sass/SettingsPage.scss';

function SettingsPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess:(response) => {
      console.log(response)
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
      <GoogleButton onClick={handleGoogleLogin} />
      <button onClick={handleBack} className="back-button">Назад</button>
      <Background />
    </div>
  );
}

export default SettingsPage;