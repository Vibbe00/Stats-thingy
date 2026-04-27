import { useParams } from "react-router-dom";
import { SummonerCard } from "../components/SummonerCard";
import { RankCard } from "../components/RankCard";
import { MatchHistory } from "../components/MatchHistory";
import { ChampionStats } from "../components/ChampionStats";
import { useState, useEffect } from "react";
import "./profile.css";

export default function Profile() {
  const {region, gameName, tagLine} = useParams();
  const [summoner, setSummoner] = useState(null);
  const [ranked, setRanked] = useState(null);
  const [matches, setMatches] = useState(null);
  const [champions, setChampions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(
        `http://localhost:3000/${region}/summoner/${gameName}/${tagLine}`,
      ).then((r) => r.json()),
      fetch(
        `http://localhost:3000/${region}/summoner/${gameName}/${tagLine}/ranked`,
      ).then((r) => r.json()),
      fetch(
        `http://localhost:3000/${region}/summoner/${gameName}/${tagLine}/champions`,
      ).then((r) => r.json()),
      fetch(
        `http://localhost:3000/${region}/summoner/${gameName}/${tagLine}/matches`,
      ).then((r) => r.json()),
    ])

      .then(([summonerData, rankedData, championsData, matchesData]) => {
        setSummoner(summonerData);
        setRanked(rankedData);
        setChampions(championsData);
        setMatches(matchesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [gameName, tagLine]);

    if (loading) return <div className="loading">Loading profile...</div>;
    if (error) return <div>Error: {error}</div>;

   
  return (
    <div className="profile-layout">
      <div className="profile-header">
        <SummonerCard summoner={summoner} region={region}/>
      </div>
      <div className="profile-main">
        <div className="sidebar">
          <RankCard ranked={ranked} />
          <ChampionStats champions={champions}/>
        </div>
        <MatchHistory matches={matches} region={region} gameName={gameName} tagLine={tagLine} />
      </div>
    </div>
  );
}
