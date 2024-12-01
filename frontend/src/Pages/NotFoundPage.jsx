import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import '../Sass/NotFoundPage.scss';
import Background from "../Components/Background";

function NotFoundPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const navigate = useNavigate();

  function handleBack() {
    setStartAnimation(true);
    setTimeout(() => navigate("/"), 1000);
  }
  return (
    <div className={`NotFoundPage ${startAnimation ? "animate" : ""}`}>
      <h1 className="title">Страница не найдена</h1>
      <button className="back-button" onClick={handleBack}>Назад</button>
      <Background />
    </div>
  )
}

export default NotFoundPage;