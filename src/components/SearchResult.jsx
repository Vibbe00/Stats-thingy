import React from 'react'
import "./searchResult.css"

export const SearchResult = ( {result} ) => {
  return (
    <>
    <div className = "search-result">{result.name}</div>
    </>
  )
}
