import React from 'react'
import "./championStats.css";

const getChampionIcon = (championName) => {
    return `https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${championName}.png`
}

export const ChampionStats = ({ champions }) => {
    

    return (
        <div className="champion-stats">
            {champions.champions.slice(0, 5).map((champion, index) => (
             <div key={index}>
                <div className="champion-entry" >

                    <div className="name-and-cs">   
                    <span className="champion-name">{champion.championName}</span>
                    <span className="champion-cs">{champion.avgCs} CS</span>
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
                {index < 4 && <div className="champ-divider"></div>}
                </div>
            ))}
            
        </div>
    )
}