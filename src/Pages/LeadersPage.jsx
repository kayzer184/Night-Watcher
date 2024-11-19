import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Background from "../Components/Background";
import '../Sass/LeadersPage.scss';

function LeadersPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const navigate = useNavigate();

  function handleBack() {
    setStartAnimation(true);
    setTimeout(() => navigate("/"), 1000);
  }

  function getLeaders() {
    return [
      { rate: 1, name: "kapcheni", left_energy: 1642 },
      { rate: 2, name: "Nikita", left_energy: 1620 },
      { rate: 3, name: "bomj", left_energy: 1580 },
    ];
  }

  const leaders = getLeaders();

  return (
    <div className={`LeadersPage ${startAnimation ? "animate" : ""}`}>
      <h1 className="title">Лидеры</h1>
      <table className="leaders-table">
        <thead>
          <tr>
            <th>Рейтинг</th>
            <th>Имя</th>
            <th>Энергия</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((leader, index) => (
            <tr key={index}>
              <td>{leader.rate}</td>
              <td>{leader.name}</td>
              <td>{leader.left_energy}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleBack} className="back-button">Назад</button>
      <Background />
    </div>
  );
}

export default LeadersPage;