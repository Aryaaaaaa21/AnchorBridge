# AnchorBridge — Decentralized Milestone Escrow on Stellar

<div align="center">

![AnchorBridge Banner](docs/assets/banner.png)

**Trustless freelance collaboration secured by Soroban smart contracts.**  
Funds release milestone-by-milestone. No intermediary. No fees. No trust required.

[![CI Frontend](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/frontend.yml/badge.svg)](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/frontend.yml)
[![CI Contract](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/contract.yml/badge.svg)](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/contract.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?logo=vercel)](https://anchorbridge-taupe.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 🔗 Live Demo

> **[https://anchorbridge-taupe.vercel.app](https://anchor1bridge.netlify.app/)**

Connect your Freighter wallet on Stellar Testnet to interact with the live deployment.

---

## 📋 Deployed Contract

| Field | Value |
|-------|-------|
| **Contract ID** | `CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27` |
| **Network** | Stellar Testnet |
| **Token (SAC)** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| **Admin** | `GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP` |
| **Explorer** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27) |
| **Stellar Lab** | [Inspect in Lab](https://lab.stellar.org/r/testnet/contract/CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27) |

### Sample Contract Interaction

| Field | Value |
|-------|-------|
| **Transaction Hash** | `b520a4cfde3e7cf992e95e73327ad05457df53a0a576454eed62c2e0f50e5ed2` |
| **Operation** | `initialize` — Contract Initialization |
| **Explorer Link** | [View TX](https://stellar.expert/explorer/testnet/tx/b520a4cfde3e7cf992e95e73327ad05457df53a0a576454eed62c2e0f50e5ed2) |
| **Timestamp** | 2026-06-29 09:37:39 UTC |
| **Status** | ✅ SUCCESS |

---

## 🚀 What is AnchorBridge?

AnchorBridge is a decentralized milestone-based escrow platform built on **Stellar** and powered by **Soroban smart contracts**. It enables clients and freelancers to collaborate with cryptographic trust:

- **Client** deposits funds into the smart contract escrow
- **Funds lock** on-chain until milestones are approved
- **Freelancer** submits work deliverables
- **Milestone approval** triggers automatic fund release via token transfer
- **Disputes** lock funds in arbitration for manual resolution

**Zero intermediary fees. Zero trust required. Fully on-chain.**

---

## ✨ Key Features

| Feature | Implementation |
|---------|----------------|
| 🔐 Soroban Smart Contract Escrow | Multi-module Rust contract with authorization, state machine, and token integration |
| 🎯 Milestone-Based Fund Release | Funds released tranche-by-tranche on client approval |
| ⚡ Real-Time Event Streaming | Soroban RPC `getEvents` polling with exponential backoff |
| 🦺 Dispute Resolution | Arbitration flow locks funds until admin resolves |
| 👛 Freighter Wallet Native | Full lifecycle: connect → sign → submit → confirm |
| 📊 Live Dashboard | Real-time project status, balance sync, and notification feed |
| 📱 Mobile Responsive | Fully responsive UI across all screen sizes |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)            │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐   │
│  │  Freighter   │  │  StellarSvc   │  │  EventListener  │   │
│  │  Wallet API  │  │  (Horizon +   │  │  (Soroban RPC   │   │
│  │              │  │   Soroban RPC)│  │   getEvents)    │   │
│  └──────┬───────┘  └───────┬───────┘  └────────┬────────┘   │
│         │                  │                   │            │
│         └──────────────────┴───────────────────┘            │
│                            │                                │
│                    ┌───────┴────────┐                       │
│                    │  Zustand Store │                       │
│                    │  (Global State)│                       │
│                    └───────┬────────┘                       │
│                            │                                │
│         ┌──────────────────┼──────────────────┐             │
│   ┌─────┴──────┐   ┌───────┴──────┐  ┌────────┴──────┐      │
│   │ Dashboard  │   │   Projects   │  │    Wallet     │      │
│   │   Page     │   │    Pages     │  │     Page      │      │
│   └────────────┘   └──────────────┘  └───────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   Stellar RPC   │
                    │   (Testnet)     │
                    └────────┬────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│              SOROBAN SMART CONTRACT (Rust)                  │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐   │
│  │ project │  │milestone │  │ escrow  │  │   payment    │   │
│  │  .rs    │  │   .rs    │  │   .rs   │  │     .rs      │   │ 
│  └─────────┘  └──────────┘  └─────────┘  └──────────────┘   │ 
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐   │ 
│  │ storage │  │   auth   │  │ events  │  │  reputation  │   │ 
│  │   .rs   │  │   .rs    │  │   .rs   │  │     .rs      │   │ 
│  └─────────┘  └──────────┘  └─────────┘  └──────────────┘   │
│                                                             │
│             Token SAC Contract (inter-contract call)        │
│   CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC  │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Event Streaming System

The `eventListener.ts` service implements a production-grade polling engine:

```
[Soroban RPC getEvents] ──poll every 5s──▶ [Event Filter: contractId]
        │
        ▼
[Parse ScVal topics + values]
        │
        ├── project_created   ──▶ Notification + Balance Sync
        ├── escrow_funded     ──▶ Notification + Balance Sync
        ├── milestone_submitted ▶ Milestone State Update
        ├── milestone_approved ──▶ Milestone State + Completion Check
        ├── milestone_rejected ──▶ Milestone State Reset
        ├── funds_released    ──▶ Escrow Balance Update
        ├── refund_issued     ──▶ Project Status = Completed
        └── project_cancelled ──▶ Project Status = Cancelled

[Error] ──exponential backoff──▶ Retry (5s → 7.5s → 11.25s → max 60s)
```

---

## 🧪 Testing Overview

### Smart Contract Tests (16 passing)

```bash
cd contracts/escrow
cargo test -- --nocapture
```

| Test | Coverage |
|------|----------|
| `test_initialize` | Contract initialization |
| `test_create_project_and_fund` | Full project creation + funding flow |
| `test_milestone_workflow` | Submit → Approve → Fund Release |
| `test_refund_client` | Client refund on active project |
| `test_dispute_milestone` | Dispute locking |
| `test_cancel_project` | Pre-funding cancellation |
| `test_create_milestone_unauthorized` | Authorization guard |
| `test_submit_milestone_unauthorized` | Authorization guard |
| `test_approve_milestone_unauthorized` | Authorization guard |
| `test_milestone_invalid_index` | Bounds check |
| `test_invalid_milestone_count` | Zero milestone rejection |
| `test_invalid_escrow_amount` | Zero escrow rejection |
| `test_missing_initialization` | NotInitialized error path |
| `test_create_project_auth_failure` | Auth failure without mock |
| `test_duplicate_project_creation` | Counter increment validation |
| `test_multiple_projects_integration` | Multi-project state isolation |

### Frontend Tests (12 passing)

```bash
npm run test
```

| Test Suite | Tests |
|-----------|-------|
| `store.test.ts` | 6 — State management, login, logout, notifications, tx status |
| `components.test.tsx` | 6 — Landing page render, navigation, wallet states |

---

## 🔄 CI/CD Overview

Two GitHub Actions workflows run on every push and pull request to `main`:

### `.github/workflows/frontend.yml`
```
Install Node 22 → npm ci → oxlint → vitest run → vite build
```

### `.github/workflows/contract.yml`
```
Setup Rust stable → cargo check → cargo test
```

[![CI Frontend](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/frontend.yml/badge.svg)](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/frontend.yml)
[![CI Contract](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/contract.yml/badge.svg)](https://github.com/Aryaaa-21/AnchorBridge/actions/workflows/contract.yml)

---

## 🗂️ Repository Structure

```
anchorbridge/
├── contracts/escrow/           # Rust Soroban Smart Contract
│   ├── src/
│   │   ├── lib.rs              # Contract entry point & public methods
│   │   ├── project.rs          # Project creation, funding, cancellation
│   │   ├── milestone.rs        # Milestone lifecycle (create/submit/approve/reject)
│   │   ├── escrow.rs           # Dispute locking & refund logic
│   │   ├── payment.rs          # Inter-contract token transfer (SAC)
│   │   ├── auth.rs             # Authorization helpers
│   │   ├── storage.rs          # Instance & persistent storage operations
│   │   ├── events.rs           # On-chain event emissions
│   │   ├── types.rs            # Structs, enums, constants
│   │   ├── errors.rs           # EscrowError enum (9 error types)
│   │   ├── reputation.rs       # Reputation scoring system
│   │   ├── admin.rs            # Admin & upgrade functions
│   │   ├── migration.rs        # Contract migration support
│   │   ├── test.rs             # 15 unit tests
│   │   └── integration_test.rs # 1 integration test
│   └── Cargo.toml
├── src/                        # React + TypeScript Frontend
│   ├── components/             # Layout, Navbar, Sidebar
│   ├── config/contracts.ts     # Contract ID & network config
│   ├── pages/                  # Dashboard, Projects, Wallet, CreateProject, etc.
│   ├── services/
│   │   ├── stellar.ts          # Freighter + Horizon + Soroban RPC service
│   │   └── eventListener.ts    # Real-time Soroban event polling
│   ├── store/useStore.ts       # Zustand global state
│   └── tests/                  # Vitest + RTL test suites
├── docs/                       # Submission documentation
│   ├── SCREENSHOTS.md          # Screenshot evidence guide
│   ├── DEMO_VIDEO.md           # Demo video script
│   ├── SUBMISSION_CHECKLIST.md # Level 1/2/3 submission checklist
│   └── README_ASSETS.md        # Asset & documentation index
├── scripts/deploy.ps1          # Full deployment automation script
├── .github/workflows/          # CI/CD pipelines
│   ├── frontend.yml            # Frontend: lint + test + build
│   └── contract.yml            # Rust: check + test
├── vercel.json                 # Vercel deployment config
└── vite.config.ts              # Vite bundler config
```

---

## 🛠️ Local Setup

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install) + `wasm32v1-none` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/stellar-cli)
- [Freighter Wallet](https://freighter.app/) browser extension

### 1. Clone the Repository
```bash
git clone https://github.com/Aryaaa-21/AnchorBridge.git
cd AnchorBridge
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
# → http://localhost:5173
```

### 4. Run Frontend Tests
```bash
npm run test
```

### 5. Run Contract Tests
```bash
cd contracts/escrow
cargo test -- --nocapture
```

---

## 📦 Smart Contract Deployment

The `scripts/deploy.ps1` script automates the full deployment pipeline:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1
```

**Pipeline steps:**
1. Build WASM (`cargo build --release`)
2. Optimize WASM (`stellar contract optimize`)
3. Upload WASM bytecode to Testnet
4. Deploy contract instance
5. Initialize contract with admin + token address
6. Save contract ID to `src/config/contracts.ts`

### Manual Deployment
```bash
# 1. Build
cd contracts/escrow
cargo build --target wasm32v1-none --release

# 2. Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/anchorbridge_escrow.wasm \
  --source developer \
  --network testnet

# 3. Initialize
stellar contract invoke \
  --id CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27 \
  --source developer \
  --network testnet \
  -- initialize \
  --admin GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP \
  --token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

---

## 🌐 Explorer Links

| Resource | Link |
|----------|------|
| Contract on Stellar Expert | [View Contract](https://stellar.expert/explorer/testnet/contract/CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27) |
| Initialization TX | [View TX](https://stellar.expert/explorer/testnet/tx/b520a4cfde3e7cf992e95e73327ad05457df53a0a576454eed62c2e0f50e5ed2) |
| WASM Upload TX | [View TX](https://stellar.expert/explorer/testnet/tx/4bcf25e447927ed11461e4f4941a55baa2d853fa5a1c6af63e0b4cb65ea4c25c) |
| Admin Account | [View Account](https://stellar.expert/explorer/testnet/account/GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP) |

---

## 🔒 Error Handling

The contract exposes 9 typed error codes via `EscrowError`:

| Code | Error | Description |
|------|-------|-------------|
| #1 | `AlreadyInitialized` | Contract already set up |
| #2 | `NotInitialized` | Contract not initialized |
| #3 | `Unauthorized` | Caller lacks permission |
| #4 | `ProjectNotFound` | Project ID does not exist |
| #5 | `MilestoneNotFound` | Milestone index out of bounds |
| #6 | `InvalidStatus` | Action invalid for current state |
| #7 | `InsufficientBalance` | Amount ≤ 0 or insufficient |
| #8 | `InvalidMilestoneCount` | Count = 0 or > 100 |
| #9 | `ReputationOverflow` | Stats arithmetic overflow |

---

## 📄 License

MIT © 2026 AnchorBridge
