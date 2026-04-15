
import React, { useState, useEffect } from 'react'
import "./SummonerCard.css"

export const SummonerCard = ({ gameName, tagLine }) => {
  const [summoner, setSummoner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:3000/summoner/${gameName}/${tagLine}`)
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

  if (loading) return <div>Ladataan...</div>;
  if (error) return <div>Virhe: {error}</div>;
  if (!summoner) return null;

  return (
    <div className="summoner-card">
      <img className = "profile-icon" src={summoner.summoner.profileIconUrl} alt="Summoner Icon" />
      <h1 className = "summoner-name">{summoner.account.gameName}#{summoner.account.tagLine}</h1>
    </div>
  );
}