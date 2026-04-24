
import Searchbar from "../components/SeachbarComponent"
import { SearchResultsList } from "../components/SearchResultsList"
import { useState } from "react"
import "./Home.css"

export default function Home() {
    const [results, setResults] = useState([])
    const [region, setRegion] = useState("euw")

    return (
        <>
            <Searchbar setResults={setResults} region={region} setRegion={setRegion} />
            <SearchResultsList results={results} region={region} />
        </>
    )
}
