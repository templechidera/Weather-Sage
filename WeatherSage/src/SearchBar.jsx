import React from "react";

export default function SearchBar({ inputValue, setInputValue, onEnter }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="top-search-container">
      <span className="search-icon-lens">🔍</span>
      <input
        type="text"
        placeholder="Search for cities"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="top-search-input"
      />
    </div>
  );
}
