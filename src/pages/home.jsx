
import Searchbar from "../components/SeachbarComponent"
import { SearchResultsList } from "../components/SearchResultsList"
import {useState} from "react"



export default function Home(){

    const [results, setResults] = useState([])

    return (
    <> 
    <Searchbar setResults={setResults}/>
    <SearchResultsList results={results}/>
    </> 
    )
}
