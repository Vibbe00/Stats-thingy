import React from "react";
import { useState, useEffect } from "react";
import "./matchEntry.css";

const getQueueLabel = (queueId) => {
  switch (queueId) {
    case 420:
      return "Ranked Solo/Duo";
    case 440:
      return "Ranked Flex";
    case 400:
      return "Normal Draft";
    default:
      return "Unknown";
  }
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const MatchEntry = ({ match, region, gameName, tagLine }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetch(
      `http://localhost:3000/${region}/summoner/${gameName}/${tagLine}/matches/${match.matchId}`,
    )
      .then((response) => response.json())
      .then((data) => setDetails(data));
  }, [match.matchId]);

  return (
    <div className="match-history">
      <div
        className={`match-entry ${match.player.win ? "victory" : "defeat"}`}
        key={match.matchId}
      >
      <div className="champion-and-spells">
        <img
          className="champion-icon"
          src={match.player.championIcon}
          alt={match.player.championName}
        ></img>

        <div className="summoner-spells">
          {match.player.summonerSpells.map((spell, index) => (
            spell.icon
            ? <img key={index} className="spell-icon" src={spell.icon} alt={spell.id}/>
            : <div key={index} className="empty-spell"/>
            ))}
        </div>
      </div>
       

        <div className="match-header">
          <span
            className={`game-mode ${match.player.win ? "victory" : "defeat"}`}
          >
            {getQueueLabel(match.queueId)}
          </span>
          <span className="champion">{match.player.championName}</span>
          <span className={"match-result"}>
            {match.player.win ? "Victory" : "Defeat"}
          </span>
          <span className="match-duration">
            {formatDuration(match.gameDuration)}
          </span>
        </div>

        <div className="divider"></div>

        <div className="items-and-stats">
          <div className="items">
            {match.player.items.map((item, index) =>
              item.icon ? (
                <img
                  key={index}
                  className="item-icon"
                  src={item.icon}
                  alt={item.id}
                ></img>
              ) : (
                <div key={index} className="empty-item"></div>
              ),
            )}
          </div>

          <div className="match-stats">
            <span className="stats">
              {match.player.kills}/{match.player.deaths}/{match.player.assists}
            </span>
            <span className="kda">KDA: {match.player.kda}</span>
            <span className="cs">CS: {match.player.cs}</span>
          </div>
        </div>

        <div className="divider"></div>

        {details && (
          <div className="match-players">
            <div className="blue-team">
              {details.teams.blue.map((player, i) => (
                <div key={i} className="player-entry">
                  <img
                    className="player-champion-icon"
                    src={player.championIcon}
                    alt={player.championName}
                  />
                  <span className="player-name">
                    {player.gameName ?? "???"}
                  </span>
                </div>
              ))}
            </div>
            <div className="red-team">
              {details.teams.red.map((player, i) => (
                <div key={i} className="player-entry">
                  <img
                    className="player-champion-icon"
                    src={player.championIcon}
                    alt={player.championName}
                  />
                  <span className="player-name">
                    {player.gameName ?? "???"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
