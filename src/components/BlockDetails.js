import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { utils } from 'ethers';

const BlockDetails = ({ alchemy }) => {
  const { blockNumber } = useParams();
  const [blockData, setBlockData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format ETH value (convert from Wei to ETH)
  const formatEther = (wei) => {
    if (!wei) return '0 ETH';
    return `${parseFloat(utils.formatEther(wei)).toFixed(4)} ETH`;
  };

  // Format address: shorten display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Format block size, convert to KB
  const formatSize = (size) => {
    return `${(size / 1024).toFixed(2)} KB`;
  };

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get block details
        const block = await alchemy.core.getBlockWithTransactions(parseInt(blockNumber));
        setBlockData(block);
        setTransactions(block.transactions);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching block data:', err);
        setError('Error occurred while fetching block data. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlockData();
  }, [alchemy, blockNumber]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!blockData) {
    return <div className="error-message">Cannot find the specified block data</div>;
  }

  return (
    <div className="detail-container">
      <h2>Block #{blockNumber} Details</h2>

      <div className="detail-card">
        <div className="detail-header">Overview</div>
        <div className="detail-row">
          <span className="detail-label">Block Height:</span>
          <span className="detail-value">{blockData.number}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Timestamp:</span>
          <span className="detail-value">
            {formatTimestamp(blockData.timestamp)} ({formatDistanceToNow(new Date(blockData.timestamp * 1000))} ago)
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Transaction Count:</span>
          <span className="detail-value">{blockData.transactions.length}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Miner:</span>
          <span className="detail-value">
            <Link to={`/address/${blockData.miner}`} className="address-link">
              {blockData.miner}
            </Link>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Block Hash:</span>
          <span className="detail-value hash-value">{blockData.hash}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Parent Hash:</span>
          <span className="detail-value hash-value">{blockData.parentHash}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Nonce:</span>
          <span className="detail-value">{blockData.nonce}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Difficulty:</span>
          <span className="detail-value">{parseInt(blockData.difficulty.toString()).toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Total Difficulty:</span>
          <span className="detail-value">{parseInt(blockData._difficulty.toString()).toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gas Limit:</span>
          <span className="detail-value">{parseInt(blockData.gasLimit.toString()).toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gas Used:</span>
          <span className="detail-value">{parseInt(blockData.gasUsed.toString()).toLocaleString()} ({((parseInt(blockData.gasUsed) / parseInt(blockData.gasLimit)) * 100).toFixed(2)}%)</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Extra Data:</span>
          <span className="detail-value hash-value">{blockData.extraData}</span>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-header">Transaction List ({blockData.transactions.length})</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transaction Hash</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.hash}>
                  <td>
                    <Link to={`/tx/${tx.hash}`} className="tx-link">
                      {formatAddress(tx.hash)}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/address/${tx.from}`} className="address-link">
                      {formatAddress(tx.from)}
                    </Link>
                  </td>
                  <td>
                    {tx.to ? (
                      <Link to={`/address/${tx.to}`} className="address-link">
                        {formatAddress(tx.to)}
                      </Link>
                    ) : (
                      'Contract Creation'
                    )}
                  </td>
                  <td>{formatEther(tx.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockDetails; 