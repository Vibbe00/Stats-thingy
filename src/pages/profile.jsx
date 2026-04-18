import { SummonerCard } from "../components/SummonerCard";
import { RankCard } from "../components/RankCard";
import { MatchHistory } from "../components/MatchHistory";
import './profile.css'

export default function Profile() {
  return (
    <>
      <div className="profile-layout">
        <div className="profile-sidebar">
          <SummonerCard region="eune" gameName="Siisti Kissa" tagLine="MEOW" />
          <RankCard region="eune" gameName="Siisti Kissa" tagLine="MEOW" />
        </div>
        <div className="profile-main">
          <MatchHistory region="eune" gameName="Siisti Kissa" tagLine="MEOW" />
        </div>
      </div>
    </>
  );
}
