import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { utils } from 'ethers';

const TransactionDetails = ({ alchemy }) => {
  const { txHash } = useParams();
  const [txData, setTxData] = useState(null);
  const [txReceipt, setTxReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format ETH value (convert from Wei to ETH)
  const formatEther = (wei) => {
    if (!wei) return '0 ETH';
    return `${parseFloat(utils.formatEther(wei)).toFixed(6)} ETH`;
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Transaction status
  const getTransactionStatus = (receipt) => {
    if (!receipt) return 'Pending';
    return receipt.status ? 'Success' : 'Failed';
  };

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get transaction information
        const transaction = await alchemy.core.getTransaction(txHash);
        setTxData(transaction);

        if (transaction) {
          // Get transaction receipt
          const receipt = await alchemy.core.getTransactionReceipt(txHash);
          setTxReceipt(receipt);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction data:', err);
        setError('Error occurred while fetching transaction data. Please try again later.');
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [alchemy, txHash]);

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

  if (!txData) {
    return <div className="error-message">Cannot find the specified transaction</div>;
  }

  return (
    <div className="detail-container">
      <h2>Transaction Details</h2>

      <div className="detail-card">
        <div className="detail-header">Overview</div>
        <div className="detail-row">
          <span className="detail-label">Transaction Hash:</span>
          <span className="detail-value hash-value">{txData.hash}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className="detail-value">
            {getTransactionStatus(txReceipt)}
            {txReceipt && txReceipt.status ? ' ✅' : txReceipt ? ' ❌' : ' ⏳'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Block:</span>
          <span className="detail-value">
            {txData.blockNumber ? (
              <Link to={`/block/${txData.blockNumber}`} className="block-link">
                {txData.blockNumber}
              </Link>
            ) : (
              'Pending'
            )}
          </span>
        </div>
        {txReceipt && txReceipt.timestamp && (
          <div className="detail-row">
            <span className="detail-label">Timestamp:</span>
            <span className="detail-value">
              {formatTimestamp(txReceipt.timestamp)}
              {txReceipt.timestamp && ` (${formatDistanceToNow(new Date(txReceipt.timestamp * 1000))} ago)`}
            </span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">From:</span>
          <span className="detail-value">
            <Link to={`/address/${txData.from}`} className="address-link">
              {txData.from}
            </Link>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">To:</span>
          <span className="detail-value">
            {txData.to ? (
              <Link to={`/address/${txData.to}`} className="address-link">
                {txData.to}
              </Link>
            ) : (
              'Contract Creation'
            )}
          </span>
        </div>
        {txReceipt && txReceipt.contractAddress && (
          <div className="detail-row">
            <span className="detail-label">Created Contract:</span>
            <span className="detail-value">
              <Link to={`/address/${txReceipt.contractAddress}`} className="address-link">
                {txReceipt.contractAddress}
              </Link>
            </span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Value:</span>
          <span className="detail-value">{formatEther(txData.value)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Transaction Fee:</span>
          <span className="detail-value">
            {txReceipt
              ? formatEther(txData.gasPrice.mul(txReceipt.gasUsed))
              : 'Calculating...'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gas Price:</span>
          <span className="detail-value">
            {parseFloat(utils.formatUnits(txData.gasPrice, 'gwei')).toFixed(2)} Gwei
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gas Limit:</span>
          <span className="detail-value">{parseInt(txData.gasLimit.toString()).toLocaleString()}</span>
        </div>
        {txReceipt && (
          <div className="detail-row">
            <span className="detail-label">Gas Used:</span>
            <span className="detail-value">
              {parseInt(txReceipt.gasUsed.toString()).toLocaleString()} ({((parseInt(txReceipt.gasUsed) / parseInt(txData.gasLimit)) * 100).toFixed(2)}%)
            </span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Nonce:</span>
          <span className="detail-value">{txData.nonce}</span>
        </div>
        {txData.data && txData.data !== '0x' && (
          <div className="detail-row">
            <span className="detail-label">Input Data:</span>
            <span className="detail-value hash-value">{txData.data}</span>
          </div>
        )}
      </div>

      {txReceipt && txReceipt.logs && txReceipt.logs.length > 0 && (
        <div className="detail-card">
          <div className="detail-header">Event Logs ({txReceipt.logs.length})</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Address</th>
                  <th>Topics</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {txReceipt.logs.map((log, index) => (
                  <tr key={`${log.transactionHash}-${log.logIndex}`}>
                    <td>{index}</td>
                    <td>
                      <Link to={`/address/${log.address}`} className="address-link">
                        {`${log.address.slice(0, 6)}...${log.address.slice(-4)}`}
                      </Link>
                    </td>
                    <td>
                      {log.topics.length > 0 ? (
                        <span className="hash-value">{`${log.topics[0].slice(0, 10)}...`}</span>
                      ) : (
                        'None'
                      )}
                    </td>
                    <td>
                      {log.data && log.data !== '0x' ? (
                        <span className="hash-value">{`${log.data.slice(0, 10)}...`}</span>
                      ) : (
                        'None'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails; 