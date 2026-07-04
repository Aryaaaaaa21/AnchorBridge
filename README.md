# AnchorBridge — Decentralized Milestone Escrow on Stellar

<div align="center">

![AnchorBridge Banner](docs/assets/banner.png)

### Trustless Freelance Collaboration Powered by Stellar & Soroban

Clients lock funds into on-chain escrow. Freelancers complete milestones. Payments release automatically through smart contract execution.

[![CI Frontend](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/frontend.yml/badge.svg)](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/frontend.yml)
[![CI Contract](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/contract.yml/badge.svg)](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/contract.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?logo=vercel)](https://anchorbridge-taupe.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

# 🌐 Live Demo

**Application:**  
https://anchor1bridge.netlify.app/

**Network:**  
Stellar Testnet

**Wallet:**  
Freighter Wallet

---

# 🎥 Demo Video

[**Demo Link:**](https://drive.google.com/file/d/1hG7aL7-fVA0JEII6mdCtELtUWKwsujXE/view?usp=drivesdk)

### Demonstrated Flow

- Connect Freighter Wallet
- View Wallet Balance
- Create Project
- Create Milestone
- Fund Escrow
- Submit Milestone
- Approve Milestone
- Release Funds
- View Stellar Explorer
- View Real-Time Event Updates

---

# 📸 Screenshots

## Landing Page

<img width="1919" height="976" alt="image" src="https://github.com/user-attachments/assets/be3aed17-cb18-480d-b5b8-bd89d8e8f67c" />
---

## Dashboard

<img width="1919" height="977" alt="image" src="https://github.com/user-attachments/assets/cdb365a3-02f6-4c80-a68e-4ba5315091a6" />

---

## Wallet Connection

<img width="1913" height="978" alt="image" src="https://github.com/user-attachments/assets/5baaa753-bae7-4089-a0ee-44c33d34b1dc" />

---

## Create Project

<img width="1911" height="975" alt="image" src="https://github.com/user-attachments/assets/b30b8f38-a995-4ef9-9f25-e65568c5e0cc" />

---
## Real-Time Event Feed

<img width="1916" height="972" alt="image" src="https://github.com/user-attachments/assets/7197d5d8-4488-4a76-8716-c41ae80c41ce" />

---

## Mobile Responsive View

<img width="468" height="835" alt="image" src="https://github.com/user-attachments/assets/ef0deb32-380a-463a-bd58-83b8cd4c515f" />

---

## Ci/ Cd 

<img width="1894" height="976" alt="image" src="https://github.com/user-attachments/assets/45a2253a-3a28-417f-94f8-33a136511388" />

---
# 📋 Project Overview

AnchorBridge is a decentralized milestone-based escrow platform built on Stellar and powered by Soroban smart contracts.

The platform removes the need for trusted intermediaries by enabling clients and freelancers to interact directly through blockchain-enforced agreements.

### Problems Solved

- Payment disputes
- Delayed payments
- Centralized platform dependency
- Lack of transparency
- High marketplace fees

### Solution

- Smart contract escrow
- Milestone-based payments
- Automatic fund release
- Real-time blockchain verification
- Transparent transaction history

---

# ✨ Key Features

### 🔐 Smart Contract Escrow

Funds remain locked until milestone approval.

### 🎯 Milestone-Based Payments

Release payments gradually as work progresses.

### 👛 Freighter Wallet Integration

Native Stellar wallet support.

### ⚡ Real-Time Event Streaming

Automatic updates through Soroban event monitoring.

### 🛡️ Dispute Resolution

Funds remain secured during disputes.

### 📱 Mobile Responsive Design

Optimized for desktop, tablet, and mobile devices.

---

# 🏆 Stellar Program Compliance

## Level 1

### Wallet Integration

- [x] Freighter Wallet Connection
- [x] Wallet Authentication
- [x] Account Address Display

### Balance Handling

- [x] XLM Balance Retrieval
- [x] Balance Refresh
- [x] Account Monitoring

### Transaction Flow

- [x] Transaction Submission
- [x] Transaction Status Updates
- [x] Error Handling
- [x] User Feedback

---

## Level 2

### Smart Contract Development

- [x] Soroban Smart Contract
- [x] Contract Deployment
- [x] Contract Initialization

### Frontend Integration

- [x] Contract Invocation
- [x] State Synchronization
- [x] Explorer Verification

### Verification

- [x] Transaction Hashes
- [x] Explorer Links
- [x] Contract Verification

---

## Level 3

### Advanced Smart Contracts

- [x] Milestone Escrow System
- [x] Project Registry
- [x] Reputation Tracking
- [x] Payment Management

### Inter-Contract Communication

- [x] Stellar Asset Contract Integration
- [x] Token Transfer Operations

### Event Streaming

- [x] Real-Time Updates
- [x] Event Monitoring
- [x] Dashboard Synchronization

### Testing

- [x] Contract Tests
- [x] Frontend Tests

### CI/CD

- [x] GitHub Actions
- [x] Automated Testing
- [x] Automated Builds

### Frontend

- [x] Mobile Responsive UI
- [x] Error Handling
- [x] Loading States

---

# 📊 Project Metrics

| Metric | Value |
|----------|----------|
| Smart Contract Tests | 16 |
| Frontend Tests | 12 |
| CI/CD Pipelines | 2 |
| Soroban Contracts | 1 |
| Event Streaming | Yes |
| Real XLM Transfers | Yes |
| Mobile Responsive | Yes |

---

# 🔗 Contract Information

| Field | Value |
|----------|----------|
| Contract ID | CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27 |
| Network | Stellar Testnet |
| Token SAC | CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC |

---

# 🏗️ Architecture

```text
Client
   │
   ▼
Freighter Wallet
   │
   ▼
React Frontend
   │
   ▼
Soroban RPC
   │
   ▼
AnchorBridge Smart Contract
   │
   ▼
Stellar Testnet
```

---

# 🧪 Testing

## Smart Contract Tests

```bash
cargo test
```

Result:

```text
16 Passed
0 Failed
```

Add Screenshot:

```text
docs/screenshots/contract-tests.png
```

---

## Frontend Tests

```bash
npm run test
```

Result:

```text
12 Passed
0 Failed
```

Add Screenshot:

```text
docs/screenshots/frontend-tests.png
```

---

# ⚙️ CI/CD

GitHub Actions automatically run:

- Frontend Build
- Frontend Tests
- Rust Contract Tests
- Type Checking

Add Screenshot:

```text
docs/screenshots/github-actions.png
```

---

# 📂 Repository Structure

```text
contracts/
docs/
src/
.github/
scripts/
```

---

# 🚀 Local Setup

```bash
git clone https://github.com/Aryaaa-21/AnchorBridge.git

cd AnchorBridge

npm install

npm run dev
```

---

# 🌐 Explorer Links

Contract:

https://stellar.expert/explorer/testnet/contract/CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27

---

# 🔮 Future Roadmap

- Multi-Signature Escrow
- DAO Arbitration
- Mainnet Deployment
- Multi-Asset Escrow
- Reputation NFTs

---

# 📄 License

MIT License
