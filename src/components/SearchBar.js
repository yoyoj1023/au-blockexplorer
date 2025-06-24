import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();

  const handleSearch = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!searchTerm.trim()) {
      setErrorMessage('Please enter search content');
      return;
    }

    const cleanedTerm = searchTerm.trim();

    // Search logic
    // 1. Block number (pure numbers)
    if (/^\d+$/.test(cleanedTerm)) {
      history.push(`/block/${cleanedTerm}`);
      return;
    }

    // 2. Transaction hash (66 characters starting with 0x)
    if (/^0x([A-Fa-f0-9]{64})$/.test(cleanedTerm)) {
      history.push(`/tx/${cleanedTerm}`);
      return;
    }

    // 3. Ethereum address (42 characters starting with 0x)
    if (/^0x([A-Fa-f0-9]{40})$/.test(cleanedTerm)) {
      history.push(`/address/${cleanedTerm}`);
      return;
    }

    // Search term doesn't match any format
    setErrorMessage('Invalid search term. Please enter a valid block number, transaction hash, or Ethereum address.');
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search block number, transaction hash, or address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default SearchBar; 