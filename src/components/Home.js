import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { utils } from 'ethers';

const Home = ({ alchemy }) => {
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [latestTransactions, setLatestTransactions] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get latest block number
        const blockNumber = await alchemy.core.getBlockNumber();
        
        // Get latest 10 blocks
        const blockPromises = [];
        for (let i = 0; i < 10; i++) {
          if (blockNumber - i >= 0) {
            blockPromises.push(alchemy.core.getBlock(blockNumber - i));
          }
        }
        const blocks = await Promise.all(blockPromises);
        setLatestBlocks(blocks);

        // Get transactions from latest block
        const blockWithTxs = await alchemy.core.getBlockWithTransactions(blockNumber);
        setLatestTransactions(blockWithTxs.transactions.slice(0, 10)); // Only take first 10 transactions
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error occurred while fetching data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();

    // Update data every 15 seconds
    const intervalId = setInterval(fetchData, 15000);
    
    // Cleanup timer
    return () => clearInterval(intervalId);
  }, [alchemy]);

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

  return (
    <div>
      <div className="home-section">
        <h2>Latest Blocks</h2>
        <div className="block-list">
          {latestBlocks.map((block, index) => (
            <div key={`block-${block.number}`} className="block-item">
              <div>
                <strong>Block Number:</strong>{' '}
                <Link to={`/block/${block.number}`} className="block-link">
                  {block.number}
                </Link>
              </div>
              <div>
                <strong>Timestamp:</strong> {formatDistanceToNow(new Date(block.timestamp * 1000))} ago
              </div>
              <div>
                <strong>Transactions:</strong> {block.transactions.length}
              </div>
              <div>
                <strong>Miner:</strong>{' '}
                <Link to={`/address/${block.miner}`} className="address-link">
                  {formatAddress(block.miner)}
                </Link>
              </div>
              <div>
                <strong>Gas Used:</strong> {parseInt(block.gasUsed.toString()).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="home-section">
        <h2>Latest Transactions</h2>
        <div className="tx-list">
          {latestTransactions.map((tx) => (
            <div key={tx.hash} className="tx-item">
              <div>
                <strong>Transaction Hash:</strong>{' '}
                <Link to={`/tx/${tx.hash}`} className="tx-link">
                  {formatAddress(tx.hash)}
                </Link>
              </div>
              <div>
                <strong>From:</strong>{' '}
                {tx.from ? (
                  <Link to={`/address/${tx.from}`} className="address-link">
                    {formatAddress(tx.from)}
                  </Link>
                ) : 'N/A'}
              </div>
              <div>
                <strong>To:</strong>{' '}
                {tx.to ? (
                  <Link to={`/address/${tx.to}`} className="address-link">
                    {formatAddress(tx.to)}
                  </Link>
                ) : 'Contract Creation'}
              </div>
              <div>
                <strong>Value:</strong> {formatEther(tx.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 