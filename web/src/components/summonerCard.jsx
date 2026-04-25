
import "./SummonerCard.css"

export const SummonerCard = ({ summoner, region, gameName, tagLine }) => {
 

  return (
    <div className="summoner-card">
      <div className="profile-icon-wrapper">
        <img className="profile-icon" src={summoner.summoner.profileIconUrl} alt="Summoner Icon" />
        <span className="summoner-level">{summoner.summoner.level}</span>
      </div>
      <div className="summoner-info-and-region">
        <div className="summoner-info">
          <h1 className="summoner-name">{summoner.account.gameName}</h1> 
          <span className="summoner-tagline">#{summoner.account.tagLine}</span>
        </div>
        <span className="summoner-region">{region.toUpperCase()}</span>
      </div>
    </div>
  );
}