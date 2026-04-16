
import Searchbar from "../components/SeachbarComponent"
import { SearchResultsList } from "../components/SearchResultsList"
import {useState} from "react"
import "./Home.css"



export default function Home(){

    const [results, setResults] = useState([])

    return (
    <> 
    <Searchbar setResults={setResults}/>
    <SearchResultsList results={results}/>
    </> 
    )
}
