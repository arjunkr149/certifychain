# CertifyChain — Decentralized Certificate Verification System

> Blockchain-secured, AI-powered certificate verification platform rewritten as a modern React application.

---

## 📁 Project Structure

```
certifychain/
├── index.html                  # HTML entry point with metadata and fonts
├── metadata.json               # Applet configuration & metadata
├── package.json                # Dependencies and npm scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite bundler configuration
│
├── assets/
│   └── favicon.svg             # Application logo icon
│
└── src/
    ├── App.tsx                 # Main application view router
    ├── main.tsx                # React application entry point
    │
    ├── context/
    │   └── AppContext.tsx      # Central state (certs, auth, theme, toast, history)
    │
    ├── types/
    │   └── index.ts            # TypeScript interfaces & data models
    │
    ├── utils/
    │   ├── blockchain.ts       # SHA-256 hash chaining, random hash & integrity checks
    │   └── ai.ts               # Certificate neural OCR parser & AI assistant engine
    │
    ├── styles/
    │   └── index.css           # Consolidated design system, themes, and print styles
    │
    └── components/
        ├── Navbar.tsx          # Responsive navigation bar with dark/light theme toggle
        ├── LandingPage.tsx     # Public landing page (Hero, Features, About, Team, FAQ, Contact)
        ├── AuthPage.tsx        # Login & Signup with demo credentials autofill
        ├── DashboardLayout.tsx # Admin dashboard shell (Sidebar, Topbar, Status badge)
        ├── Toast.tsx           # Global toast notifications
        ├── BlockDetailModal.tsx# Deep cryptographic block inspector & tamper simulator
        └── views/
            ├── DashboardOverview.tsx # Metrics, quick actions, and recent activity
            ├── VerifyView.tsx        # 4 verification tabs (Number, QR, File OCR, AI Chat)
            ├── IssueView.tsx         # Certificate issuance with live QR code generation
            ├── BlockchainView.tsx    # Visual chain, SHA-256 verifier, block ledger
            ├── AIAssistantView.tsx   # Dedicated AI assistant with suggestion chips
            └── ProfileView.tsx       # Institutional admin profile, security & credentials
```

---

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will run on `http://0.0.0.0:3000`.

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🔐 Demo Credentials

| Username | Password  | Role        |
|----------|-----------|-------------|
| admin    | admin123  | Super Admin |

---

## ✅ Core Features

- **Decentralized Verification (4 Methods):**
  1. *By Certificate Number* — Instant SHA-256 lookup against blockchain ledger.
  2. *QR Code Upload* — Decodes and verifies embedded digital credentials.
  3. *File Upload & AI OCR* — Step-by-step neural document analysis, seal inspection, and authenticity scoring.
  4. *AI Chat Verification* — Context-aware assistance on credential claims and forgeries.
- **Certificate Issuance & Hash Chaining:**
  - Dynamic QR code generation encoding certificate metadata.
  - Links certificates via SHA-256 hashes back to the genesis block.
  - Printable certificate preview with official formatting.
- **Blockchain Explorer:**
  - Interactive visual chain diagram with block inspection modal.
  - Deep chain integrity scanner.
  - Live tamper simulation for testing fraud detection.
- **Theme System:**
  - Full Dark and Light mode support with persistent state.

---

## 👨‍💻 Developer

**Arjun Kumar**  
Lead Developer  
🐙 [github.com/arjunkr149](https://github.com/arjunkr149)  
📧 aurevia69@gmail.com
