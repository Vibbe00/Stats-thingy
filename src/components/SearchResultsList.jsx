import React from 'react'
import "./SearchResultsList.css"
import { SearchResult } from './SearchResult'

export const SearchResultsList = ({ results, region }) => {
    return (
        <div className="results-list">
            {results.map((result, id) => (
                <SearchResult result={result} key={id} region={region} />
            ))}
        </div>
    )
}