import React from 'react'
import "./championStats.css";



export const ChampionStats = ({ champions }) => {
    

    return (
        <>
        <div className="champion-stats">
            
            {champions.champions.map((champion, index) => (
             <div key={index}>
                <div className="champion-entry" >
                    <div className="champ-icon-name-cs">
                    <img className="champ-icon" src={champion.championIcon} alt ={champion.championName}/>
                    <div className="name-and-cs">   
                    <span className="champion-name">{champion.championName}</span>
                    <span className="champion-cs">{champion.avgCs} CS</span>
                    </div>
                    </div>

                    <div className="stats-and-kda">
                    <span className="champion-kda">{champion.avgKda} KDA</span>
                    <span className="champ-stats">{champion.avgKills}/{champion.avgDeaths}/{champion.avgAssists}</span>
                    </div>
                    <div className="games-and-winrate">
                    <span className="champion-winrate">{Math.round(champion.winRate * 100)}% WR</span>
                    <span className="champion-games">{champion.gamesPlayed} games</span>
                    </div>
                </div>
                {index >= 0 && <div className="champ-divider"></div>}
                </div>
            ))}
            
        </div>
        </>
    )
}