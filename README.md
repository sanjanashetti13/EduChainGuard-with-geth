# EduChainGuard

Blockchain-backed platform for **tamper-evident academic certificates**. Institutes anchor certificate PDFs as **SHA-256 hashes** on-chain; verifiers upload a PDF and confirm it matches a stored hash.

Supports **Polygon Amoy** (server-signed via Flask) and **local Geth** (chain ID `1337`, MetaMask in the browser).

Repository: [github.com/sanjanashetti13/EduChainGuard-with-geth](https://github.com/sanjanashetti13/EduChainGuard-with-geth)

---

## Features

| Capability | Description |
|------------|-------------|
| **Upload** | Institute uploads a PDF; hash is written to `CertificateStorage.sol` |
| **Verify** | Verifier uploads a PDF; app checks if the hash exists on-chain |
| **Roles** | Admin, Institute, Verifier — role-based dashboard and navigation |
| **Auth** | Email/password (bcrypt) and optional Google OAuth |
| **Dual chain** | Switch between Local Geth (MetaMask) and Polygon Amoy (backend wallet) |
| **Audit trail** | Upload/verification metadata in MongoDB |
| **IPFS** | Optional Pinata upload at `/upload-ipfs` (separate from on-chain flow) |
| **Admin** | Stats, charts, user activity, log management |

---

## Tech stack

| Layer | Stack |
|-------|--------|
| **Frontend** | React 19 (CRA), TypeScript (newer UI), Tailwind, shadcn/ui, React Query, ethers/web3 |
| **Backend** | Flask, pymongo, web3.py, bcrypt, Google OAuth |
| **Database** | MongoDB (`educhain`) |
| **Blockchain** | Solidity, Truffle, Geth (local), Polygon Amoy (testnet) |
| **Storage** | Pinata IPFS (optional) |

---

## Project structure

```
EduChainGuard/
├── frontend/          # React SPA (port 3000)
├── backend/           # Flask API (port 5000)
├── blockchain/        # Contracts, Truffle migrations, genesis.json
├── data/              # Sample test PDFs
├── hash_generator.py  # CLI SHA-256 helper for PDFs
├── PROJECT_OVERVIEW.md
└── TASKS_CHECKLIST.txt
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/`)
- **MetaMask** (for local Geth mode)
- Optional: **Geth** + **Truffle** for local chain (see `Geth_SingleNode_setup_modified.pdf` and `TASKS_CHECKLIST.txt`)

---

## Quick start

### 1. Clone and configure

```bash
git clone https://github.com/sanjanashetti13/EduChainGuard-with-geth.git
cd EduChainGuard-with-geth
```

**Backend** — copy env template and edit:

```bash
cd backend
copy .env.example .env    # Windows
# cp .env.example .env    # macOS/Linux
```

**Frontend** — create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_CONTRACT_ADDRESS_LOCAL=0x...   # after Truffle deploy on Geth
REACT_APP_CONTRACT_ADDRESS_AMOY=0x...    # optional; Amoy uses backend .env
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
python app.py
```

API: `http://127.0.0.1:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App: `http://localhost:3000`

### 4. Local blockchain (optional)

1. Initialize and start Geth using `Geth_SingleNode_setup_modified.pdf`
2. Deploy contracts:

```bash
cd blockchain
npm install
npx truffle migrate --network development
```

3. Set `REACT_APP_CONTRACT_ADDRESS_LOCAL` in `frontend/.env` to the deployed `CertificateStorage` address
4. Add Geth network in MetaMask: RPC `http://127.0.0.1:8545`, chain ID `1337`

For Polygon Amoy, set `CONTRACT_ADDRESS`, `WALLET_ADDRESS`, and `PRIVATE_KEY` in `backend/.env`.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `MONGO_URI`, `MONGO_DB_NAME` | MongoDB |
| `CONTRACT_ADDRESS`, `PRIVATE_KEY`, `WALLET_ADDRESS` | Amoy contract + signer |
| `POLYGON_RPC_URL` | Amoy RPC (default: public Amoy endpoint) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_AUTH_ENABLED` | Google OAuth |
| `PINATA_JWT` / `PINATA_API_KEY` | Optional IPFS |

See [`backend/.env.example`](backend/.env.example) for the full list.

### Frontend (`frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_URL` | Flask API base URL |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google sign-in (must match backend) |
| `REACT_APP_CONTRACT_ADDRESS_LOCAL` | Contract on Geth (chain 1337) |

---

## User roles

| Role | Routes |
|------|--------|
| **Admin** | Dashboard, analytics, settings, IPFS |
| **Institute** | Upload certificates |
| **Verifier** | Verify certificates |

Register at `/auth/register` or sign in at `/auth/login`.

---

## Scripts & docs

| Resource | Description |
|----------|-------------|
| [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) | Architecture, API summary, data flows |
| [`TASKS_CHECKLIST.txt`](TASKS_CHECKLIST.txt) | Step-by-step Geth / Truffle / MetaMask setup |
| [`Geth_SingleNode_setup_modified.pdf`](Geth_SingleNode_setup_modified.pdf) | Local node setup guide |
| [`hash_generator.py`](hash_generator.py) | Hash a PDF from the command line |

```bash
# Production frontend build
cd frontend && npm run build
```

---

## Security notes

- **Never commit** `backend/.env`, `frontend/.env`, or private keys
- `blockchain/gethdata/` and `backend/uploads/` are gitignored — regenerate locally
- Use a dedicated test wallet with test MATIC on Amoy only

---

## License

Academic / coursework project. Smart contract and template portions may carry their own licenses (e.g. Notus React, Creative Tim). Check individual files before redistribution.
