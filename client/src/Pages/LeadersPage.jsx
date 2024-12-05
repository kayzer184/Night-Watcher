import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Background from "../Components/Background";
import '../Sass/LeadersPage.scss';

const getLeaderboard = async () => {
  try {
    const response = await fetch('http://api.night-watcher.vercel.app/getLeaderBoard');
    console.log(response)
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return [];
  }
};


function LeadersPage() {
  const [startAnimation, setStartAnimation] = useState(false);
  const [leaders, setLeaders] = useState([]);  // State to hold the leaderboard data
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboard = await getLeaderboard();
      setLeaders(leaderboard);  // Update state with fetched data
    };
    fetchLeaderboard();
  }, []);  // This runs once when the component mounts

  function handleBack() {
    setStartAnimation(true);
    setTimeout(() => navigate("/"), 1000);
  }

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
          {leaders.length > 0 ? (
            leaders.map((leader, index) => (
              <tr key={index}>
                <td>{index + 1}</td> {/* Adjust field name if needed */}
                <td>{leader.username}</td> {/* Adjust field name if needed */}
                <td>{leader.score}</td> {/* Adjust field name if needed */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Загрузка...</td>
            </tr>
          )}
        </tbody>
      </table>
      <button onClick={handleBack} className="back-button">Назад</button>
      <Background />
    </div>
  );
}

export default LeadersPage;