import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { utils } from 'ethers';

const Address = ({ alchemy }) => {
  const { address } = useParams();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format ETH value (convert from Wei to ETH)
  const formatEther = (wei) => {
    if (!wei) return '0 ETH';
    return `${parseFloat(utils.formatEther(wei)).toFixed(6)} ETH`;
  };

  // Format address: shorten display
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Format token balance
  const formatTokenBalance = (balance, decimals) => {
    if (!balance) return '0';
    return parseFloat(utils.formatUnits(balance, decimals)).toFixed(4);
  };

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get address balance
        const ethBalance = await alchemy.core.getBalance(address);
        setBalance(ethBalance);

        // Try to get address transactions
        try {
          // Unable to get all transactions directly, just try using Alchemy's assets API to get token balances
          const tokens = await alchemy.core.getTokenBalances(address);
          
          // Get metadata for each token
          const tokenMetadataPromises = [];
          for (let i = 0; i < tokens.tokenBalances.length; i++) {
            const tokenData = tokens.tokenBalances[i];
            if (tokenData.tokenBalance !== '0') {
              const metadata = alchemy.core.getTokenMetadata(tokenData.contractAddress);
              tokenMetadataPromises.push(metadata);
            }
          }

          // Wait for all metadata to be fetched
          const tokenMetadata = await Promise.all(tokenMetadataPromises);
          
          // Integrate token list
          const formattedTokens = [];
          let j = 0;
          for (let i = 0; i < tokens.tokenBalances.length; i++) {
            const tokenData = tokens.tokenBalances[i];
            if (tokenData.tokenBalance !== '0') {
              formattedTokens.push({
                ...tokenMetadata[j],
                balance: tokenData.tokenBalance,
                contractAddress: tokenData.contractAddress
              });
              j++;
            }
          }
          
          setTokenBalances(formattedTokens);
        } catch (err) {
          console.error('Error fetching token balances:', err);
          // Token balance fetch failure should not cause overall failure
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching address data:', err);
        setError('Error occurred while fetching address data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAddressData();
  }, [alchemy, address]);

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
    <div className="detail-container">
      <h2>Address Details</h2>

      <div className="detail-card">
        <div className="detail-header">Overview</div>
        <div className="detail-row">
          <span className="detail-label">Address:</span>
          <span className="detail-value hash-value">{address}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">ETH Balance:</span>
          <span className="detail-value">{formatEther(balance)}</span>
        </div>
      </div>

      {tokenBalances.length > 0 && (
        <div className="detail-card">
          <div className="detail-header">ERC-20 Tokens ({tokenBalances.length})</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Balance</th>
                  <th>Contract Address</th>
                </tr>
              </thead>
              <tbody>
                {tokenBalances.map((token) => (
                  <tr key={token.contractAddress}>
                    <td>
                      <div className="token-info">
                        {token.logo && (
                          <img
                            src={token.logo}
                            alt={token.name}
                            className="token-logo"
                            width="20"
                            height="20"
                          />
                        )}
                        <span>
                          {token.name || 'Unknown Token'} ({token.symbol || '?'})
                        </span>
                      </div>
                    </td>
                    <td>
                      {formatTokenBalance(token.balance, token.decimals)}
                    </td>
                    <td>
                      <Link to={`/address/${token.contractAddress}`} className="address-link">
                        {formatAddress(token.contractAddress)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="detail-note">
        <p>Note:</p>
        <ul>
          <li>Due to Ethereum network API limitations, complete transaction history cannot be displayed in the browser.</li>
          <li>For complete transaction history, please use full block explorers like Etherscan.</li>
        </ul>
      </div>
    </div>
  );
};

export default Address; 