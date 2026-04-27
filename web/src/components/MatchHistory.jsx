import React from 'react'
import { useState } from 'react'
import { MatchEntry } from './MatchEntry'
import { getQueueLabel } from './utils'
import './matchHistory.css'



export const MatchHistory = ({matches, region, gameName, tagLine }) => {

    const [filter, setFilter] = useState(null);
    
    const filteredMatches = filter
        ? matches.matches.filter(match => match.queueId === filter)
        : matches.matches;

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