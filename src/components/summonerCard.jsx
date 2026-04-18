
import React, { useState, useEffect } from 'react'
import "./SummonerCard.css"

export const SummonerCard = ({ region, gameName, tagLine }) => {
  const [summoner, setSummoner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:3000/${region}/summoner/${gameName}/${tagLine}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Virhe ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => setSummoner(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [gameName, tagLine]);

  if (loading) return <div className="loading">Ladataan...</div>;
  if (error) return <div className="error">Virhe: {error}</div>;
  if (!summoner) return null;

  return (
    <div className="summoner-card">
      <div className="profile-icon-wrapper">
        <img className="profile-icon" src={summoner.summoner.profileIconUrl} alt="Summoner Icon" />
        <span className="summoner-level">{summoner.summoner.level}</span>
      </div>
      <div className="summoner-info">
        <h1 className="summoner-name">{summoner.account.gameName}</h1> 
        <span className="summoner-tagline">#{summoner.account.tagLine}</span>
      </div>
    </div>
  );
}