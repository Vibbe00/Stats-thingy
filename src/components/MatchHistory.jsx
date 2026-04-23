import React, { use } from 'react'
import { useState, useEffect } from 'react'
import './matchHistory.css'

export const MatchHistory = ({region,gameName, tagLine}) => {
    const [summoner, setSummoner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`http://localhost:3000/${region}/summoner/${gameName}/${tagLine}/matches`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch match history');
                }
                return response.json();
            })
            .then(data => {
                setSummoner(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, [gameName, tagLine]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const getQueueLabel = (queueId) => {
    switch(queueId) {
        case 420: return "Ranked Solo/Duo"
        case 440: return "Ranked Flex"
        case 400: return "Normal Draft"
        default: return "Unknown"
    }
}

const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

    return (
        <div className="match-history">
            {summoner.matches.map((match) => (
                    <div className={`match-entry ${match.player.win ? 'victory' : 'defeat'}`} key={match.matchId}>
                    <img className="champion-icon" src={match.player.championIcon} alt={match.player.championName}></img>
                    
                    <div className="match-header">
                    <span className={`game-mode ${match.player.win ? 'victory' : 'defeat'}`}>{getQueueLabel(match.queueId)}</span>
                    <span className="champion">{match.player.championName}</span>
                    <span className={"match-result"}>{match.player.win ? 'Victory' : 'Defeat'}</span>
                    <span className="match-duration">{formatDuration(match.gameDuration)}</span>
                    </div>

                    <div className="items-and-stats">
                    <div className="items">
                    {match.player.items.map((item, index) => (
                        item.icon
                        ?<img key={index} className="item-icon" src={item.icon} alt={item.id}></img>
                        :<div key={index} className="empty-item" ></div>
                    ))}
                    </div>

                   <div className="match-stats">
                    <span className="stats">{match.player.kills}/{match.player.deaths}/{match.player.assists}</span>
                    <span className="kda">KDA: {match.player.kda}</span>
                    <span className="cs">CS: {match.player.cs}</span>
                    </div>
                    </div>
                    <span className="divider">|</span>
                    
                    
                </div>
                ))}
            
        </div>
    )
}
