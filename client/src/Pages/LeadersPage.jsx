import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../Components/Loading";
import Background from "../Components/Background";
import '../Sass/LeadersPage.scss';

const getLeaderboard = async () => {
  try {
    const response = await fetch('https://api-night-watcher.vercel.app/getLeaderBoard');
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
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboard = await getLeaderboard();
        setLeaders(leaderboard);  // Update state with fetched data
      } catch (error) {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);  // Set loading to false after fetch completes
      }
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

      {/* Display error if there was an issue with the fetch */}
      {error && <div className="error-message">{error}</div>}

      {/* If loading, display the Loading component instead of the table */}
      {loading ? (
        <Loading />
      ) : (
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
                  <td>{index + 1}</td>
                  <td>{leader.username}</td>
                  <td>{leader.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">Ошибка загрузки данных</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <button onClick={handleBack} className="back-button">Назад</button>
      <Background />
    </div>
  );
}

export default LeadersPage;
