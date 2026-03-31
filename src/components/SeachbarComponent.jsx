import "./searchbar.css";
import { useState } from "react";

export default function Searchbar({setResults}) {
  const [input, setInput] = useState("");

  const fetchData = (value) => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter((user) => {
          return (
            value &&
            user &&
            user.name &&
            user.name.toLowerCase().includes(value)
          );
        });
        setResults(results)
      });
  };

  const handleChange = (value) => {
    setInput(value);
    fetchData(value);
  };
  return (
    <div className="search-bar-container">
      <div>
        <h1 className="search-bar-title">League Data</h1>
      </div>
      <div className="input-wrapper">
        <input
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Searh Champions or players"
        />
      </div>
    </div>
  );
}
