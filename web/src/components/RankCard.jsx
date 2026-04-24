import React from "react";
import { useState, useEffect } from "react";
import "./rankCard.css";

const getRankEmblem = (tier) => {
  if (!tier) return null;
  return `https://opgg-static.akamaized.net/images/medals_new/${tier.toLowerCase()}.png`;
};

export const RankCard = ({ region, gameName, tagLine }) => {
  const [ranked, setRanked] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:3000/${region}/summoner/${gameName}/${tagLine}/ranked`)
      .then(res => {
        if (!res.ok) throw new Error(`Virhe ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => setRanked(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [gameName, tagLine]);

  if (loading) return <div>Ladataan rankit...</div>;
  if (error) return <div>Virhe: {error}</div>;
  if (!ranked) return null;

  const queues = [
    { label: "Ranked Solo/Duo", data: ranked.soloQueue },
    { label: "Ranked Flex", data: ranked.flexQueue },
  ];

  return (
    <div className="rank-card">
      {queues.map(({ label, data }) => (
        <div className="rank-entry" key={label}>
          {data ? (
            <>
              
              <div className="rank-info">
                <div className="rank-header">
                  <span className="queue-label">{label}</span>
                  <img className="rank-emblem" src={getRankEmblem(data.tier)} alt={data.tier} />
                </div>
                <div className="rank-tier-and-lp">
                  <span className="rank-tier">{data.tier} {data.rank}</span>
                  <span className="lp">{data.leaguePoints} LP</span>
                </div>
                <div className="wr">
                  <span className="rank-wins-losses">{data.wins}W / {data.losses}L</span>
                  <span className="rank-winrate">Win rate {Math.round(data.winRate * 100)}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="rank-info rank-info-unranked">
              <span className="queue-label">{label}</span>
              <span className="rank-unranked">Unranked</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};