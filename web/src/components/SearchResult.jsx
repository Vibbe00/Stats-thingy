import { useNavigate } from "react-router-dom"
import "./searchResult.css"

export const SearchResult = ({ result, region }) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/profile/${region}/${result.account.gameName}/${result.account.tagLine}`)
    }

    return (
        <div className="search-result" onClick={handleClick}>
            <img src={result.summoner.profileIconUrl} alt="icon" />
            <span className="summoner-name-tag">{result.account.gameName} #{result.account.tagLine}</span>
        </div>
    )
}