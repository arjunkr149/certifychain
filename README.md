# CertifyChain — Decentralized Certificate Verification System

> Blockchain-secured, AI-powered certificate verification platform built at GU, Greater Noida.

---

## 📁 Project Structure

```
CertifyChain/
│
├── index.html                  ← Landing Page (public homepage)
│
├── pages/
│   ├── login.html              ← Login & Signup Page
│   ├── dashboard.html          ← Admin Dashboard Overview
│   ├── verify.html             ← Certificate Verification (4 methods)
│   ├── issue.html              ← Issue / Upload New Certificate
│   ├── blockchain.html         ← Blockchain Explorer
│   ├── ai-assistant.html       ← Full AI Chat Page
│   └── profile.html            ← Admin Profile & Settings
│
├── css/
│   ├── style.css               ← Global Variables, Reset, Shared Styles
│   ├── landing.css             ← Landing Page Styles (Navbar, Hero, Features)
│   ├── auth.css                ← Login & Signup Page Styles
│   ├── dashboard.css           ← Sidebar, Topbar, Cards, Layout (all inner pages)
│   ├── verify.css              ← Verify Page: Tabs, QR, File Upload, Chat
│   └── blockchain.css          ← Blockchain Explorer Styles
│
└── js/
    ├── main.js                 ← Landing Page: Navbar, animations, contact form
    ├── auth.js                 ← Login & Signup: auth logic, localStorage
    ├── common.js               ← Shared: cert DB, auth guard, toast, AI API call
    ├── dashboard.js            ← Dashboard: welcome greeting, recent certs table
    ├── verify.js               ← Verify: number, QR decode, file upload, AI chat
    ├── issue.js                ← Issue: form submit, QR generation, cert table
    ├── blockchain.js           ← Blockchain: visual chain, integrity check, table
    ├── ai-assistant.js         ← AI Assistant: full chat, suggestion chips
    └── profile.js              ← Profile: load/save user data, change password
```

---

## 🚀 How to Run

1. **Download / clone the project**
2. **Open `index.html`** in any modern browser (Chrome, Firefox, Edge)
3. Click **"Admin Login"** or **"Get Started"**
4. Use demo credentials: **admin / admin123**
5. Explore the dashboard!

> No installation, no server, no database required. Pure frontend — runs directly in the browser.

---

## 🔐 Demo Credentials

| Username | Password  |
|----------|-----------|
| admin    | admin123  |

---

## ✅ Features

### 🏠 Landing Page
- Animated hero section with gradient text
- Feature cards, How It Works section
- Team, FAQ (accordion), Contact form
- Responsive navbar with mobile hamburger

### 🔐 Login / Signup
- Two-panel layout (form + decorative right panel)
- Form validation with error messages
- LocalStorage-based session persistence

### 📊 Dashboard
- Stats cards: Total Certs, Verifications Today, Fraud Detected, Institutions
- Recent verifications table
- Quick action buttons
- Welcome greeting (time-aware)

### ✅ Verify Certificate — 4 Methods
1. **Certificate Number** — Type number, click verify, instant result
2. **QR Code Upload** — Upload QR image, auto-decode + verify
3. **File Upload** — Drag & drop PDF/JPG/PNG, AI analyzes content
4. **AI Chat** — Ask anything about certificate verification

### 📋 Issue Certificate
- Full form: name, ID, course, institution, date, grade, notes
- Certificate number auto-generated (CERT-YYYY-XXXXXX)
- SHA-256-style hash generated and chained
- Live **QR code** generated for each certificate
- Printable certificate preview card

### 🔗 Blockchain Explorer
- Visual block-chain diagram (scrollable)
- Detailed block table with hashes
- Chain integrity verifier
- "How blockchain works" explainer

### 🤖 AI Assistant (Claude-powered)
- Full-screen chat interface
- Suggestion chips for quick prompts
- Conversation history maintained per session
- Fraud detection, verification help, blockchain explanations

### 👤 Profile
- Edit name, username, email, institution
- Change password with validation
- Account stats (certs issued, verifications)

---


---

## ⚙️ Running with AI Features (Local Server)

To enable **AI certificate analysis** (file upload verification), you need to run the included Node.js proxy server. This solves the browser CORS restriction.

### Step 1 — Get your Anthropic API Key
Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key

### Step 2 — Set your API key

**Windows:**
```
set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Mac / Linux:**
```
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 3 — Start the server

```bash
node server.js
```

Or double-click **start.bat** (Windows) / run **./start.sh** (Mac/Linux)

### Step 4 — Open the website
Visit: **http://localhost:3000**

> ✅ All AI features will now work — file upload, AI chat, certificate analysis

---

### Without the server
Open `index.html` directly — everything works **except** AI file analysis.
Certificate number verification, QR, and manual entry all work without the server.

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5      | Page structure |
| CSS3       | Styling, animations, responsive layout |
| JavaScript (Vanilla) | All interactivity, no frameworks |
| LocalStorage / SessionStorage | User sessions, issued certs |
| QRCode.js  | QR code generation |
| Claude AI (Anthropic) | AI-powered verification & chat |
| Tabler Icons | Icon set |
| Google Fonts | Syne + DM Sans typography |

---

## 🤖 AI Integration

The project uses the **Anthropic Claude API** (`claude-sonnet-4-20250514`) for:
- Analyzing uploaded certificate files
- Answering questions about verification
- Detecting potential fraud patterns
- Full conversational AI assistant

API is called via `fetch()` to `https://api.anthropic.com/v1/messages`.

---

## 📱 Responsive Design

- Mobile sidebar with hamburger toggle
- Responsive grids (CSS Grid + auto-fit)
- Touch-friendly buttons and inputs
- Works on mobile, tablet, and desktop

---

## 👨‍💻 Developer

**Arjun Kumar**  
B.Tech Computer Science and Engineering
GU, Greater Noida, Uttar Pradesh  
📞 +91-6386416463  
📧 aurevia69@gmail.com  
🐙 [github.com/arjunkr149/](https://github.com/arjunkr149/)

---

## 📄 License

This project is open-source and built for educational purposes.  
© 2026 CertifyChain — GU, Greater Noida
