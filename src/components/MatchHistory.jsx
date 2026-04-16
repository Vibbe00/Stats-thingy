import React, { use } from 'react'
import { useState, useEffect } from 'react'
import './matchHistory.css'

export const MatchHistory = ({gameName, tagLine}) => {
    const [summoner, setSummoner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`http://localhost:3000/summoner/${gameName}/${tagLine}/matches?count=20`)
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

    return (
        <div>
            
        </div>
    )
}
