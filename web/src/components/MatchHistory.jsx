import React from 'react'
import { useState, useEffect } from 'react'
import { MatchEntry } from './MatchEntry'
import { getQueueLabel } from './utils'
import './matchHistory.css'


export const MatchHistory = ({ region, gameName, tagLine }) => {
    const [summoner, setSummoner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`http://localhost:3000/${region}/summoner/${gameName}/${tagLine}/matches`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch match history');
                return response.json();
            })
            .then(data => setSummoner(data))
            .catch(error => setError(error.message))
            .finally(() => setLoading(false));
    }, [gameName, tagLine]);

    if (loading) return <div className="loading">Loading match history...</div>;
    if (error) return <div>Error: {error}</div>;

    const filteredMatches = filter
        ? summoner.matches.filter(match => match.queueId === filter)
        : summoner.matches;

    const noMatches = filteredMatches.length === 0;

    return (
        <div className="match-history">
            <div className="filter-buttons">
                <button onClick={() => setFilter(null)}>All</button>
                <button onClick={() => setFilter(400)}>Normal Draft</button>
                <button onClick={() => setFilter(420)}>Ranked Solo/Duo</button>
                <button onClick={() => setFilter(440)}>Ranked Flex</button>
            </div>
            {noMatches
                ? <div className="no-matches">No {filter ? getQueueLabel(filter).toLowerCase() : ""} games in last 20 matches</div>
                : filteredMatches.map((match) => (
                    <MatchEntry
                        key={match.matchId}
                        match={match}
                        region={region}
                        gameName={gameName}
                        tagLine={tagLine}
                    />
                ))
            }
        </div>
    )
}