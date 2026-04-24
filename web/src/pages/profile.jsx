import { useParams } from "react-router-dom"
import { SummonerCard } from "../components/SummonerCard"
import { RankCard } from "../components/RankCard"
import { MatchHistory } from "../components/MatchHistory"
import "./profile.css"

export default function Profile() {
    const { region, gameName, tagLine } = useParams()

    return (
        <div className="profile-layout">
            <div className="profile-header">
                <SummonerCard region={region} gameName={gameName} tagLine={tagLine} />
                
            </div>
            <div className="profile-main">
                <RankCard region={region} gameName={gameName} tagLine={tagLine} />
                <MatchHistory region={region} gameName={gameName} tagLine={tagLine} />
            </div>
        </div>
    )
}