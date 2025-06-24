# Ethereum Block Explorer

This is an Ethereum block explorer built with React and AlchemySDK that allows users to browse blocks, transactions, and address information on the Ethereum blockchain.

![Sample Image](https://github.com/yoyoj1023/dapps/blob/main/08-au-blockexplorer/sample1.png)

![Sample Image](https://github.com/yoyoj1023/dapps/blob/main/08-au-blockexplorer/sample2.png)

- Deployment URL: https://au-blockexplorer.vercel.app/

## Features

- Display latest Ethereum blocks and transactions
- Block detail page with complete block information and transaction list
- Transaction detail page with detailed transaction information and event logs
- Address page showing ETH balance and ERC-20 token balances
- Search functionality supporting block numbers, transaction hashes, and addresses
- Responsive design suitable for various devices

## Tech Stack

- React.js - Frontend framework
- React Router - Frontend routing
- AlchemySDK - Interact with Ethereum blockchain
- ethers.js - Ethereum utility library
- date-fns - Date and time formatting tools

## Installation and Setup

### Prerequisites

- Node.js and npm/yarn
- Alchemy API key (free registration required)

### Setup Steps

1. Clone this project locally:

```bash
git clone <project-url>
cd ethereum-block-explorer
```

2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Create a `.env` file in the root directory and add your Alchemy API key:

```
REACT_APP_ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
```

4. Start the application:

```bash
yarn start
# or
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application

## Usage Guide

### Browse Blocks and Transactions

- Homepage displays latest blocks and transactions
- Click on block numbers to view block details
- Click on transaction hashes to view transaction details
- Click on addresses to view address information

### Search Functionality

Supports three search methods:
- Block number: Enter numbers (e.g., `17525775`)
- Transaction hash: Enter 66-character hash starting with 0x
- Address: Enter 42-character Ethereum address starting with 0x

## Architecture Overview

- `App.js` - Main application entry point, sets up routing and Alchemy SDK
- `components/` - Application components
  - `Home.js` - Homepage displaying latest blocks and transactions
  - `BlockDetails.js` - Block detail page
  - `TransactionDetails.js` - Transaction detail page
  - `Address.js` - Address detail page
  - `SearchBar.js` - Search functionality component

## Future Enhancements

Potential features to consider adding:
- Display ERC-721 (NFT) information
- Transaction monitoring and notifications
- Contract source code verification and interaction
- Gas price tracker
- ENS (Ethereum Name Service) support

## Important Notes

- This application uses Alchemy API to connect to the Ethereum network, which has API request limitations
- To avoid exceeding API limits, some features (such as historical transaction data) are limited
- For complete transaction history data, consider using paid API versions or accessing self-hosted nodes

## License

MIT License

---

*This project was created as part of learning Ethereum blockchain development, inspired by block explorers like Etherscan.*
