import "./searchbar.css";
import { useState } from "react";

export default function Searchbar({ setResults, region, setRegion }) {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [error, setError] = useState(null);

  const handleSearch = () => {
    if (!gameName || !tagLine) {
      setError("Please fill in both fields.");
      return;
    }

    setError(null);
    fetch(`http://localhost:3000/${region}/summoner/${gameName}/${tagLine}`)
      .then(res => {
        if (!res.ok) throw new Error("Player not found.");
        return res.json();
      })
      .then(data => setResults([data]))
      .catch(err => setError(err.message))
  }

  return (
    <div className="search-bar-container">
      <h1 className="search-bar-title">League Data</h1>
      <div className="input-wrapper">
        <select className="region-select" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="euw">EUW</option>
          <option value="eune">EUNE</option>
          <option value="na">NA</option>
          <option value="br">BR</option>
          <option value="lan">LAN</option>
          <option value="las">LAS</option>
          <option value="kr">KR</option>
          <option value="jp">JP</option>
          <option value="tr">TR</option>
          <option value="ru">RU</option>
          <option value="oce">OCE</option>
          <option value="ph">PH</option>
          <option value="sg">SG</option>
          <option value="th">TH</option>
          <option value="tw">TW</option>
          <option value="vn">VN</option>
        </select>
        <input
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="PlayerName"
        />
        <span className="separator">#</span>
        <input
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="TagLine"
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>
      {error && <span className="search-error">{error}</span>}
    </div>
  );
}
