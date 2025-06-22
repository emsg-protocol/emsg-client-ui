# EMSG Client UI

A cross-platform, privacy-first secure messaging web client for the EMSG protocol, powered by the EMSG Client SDK (Go/WASM).

## 🚀 Project Goals
- Login/register using Ed25519 key pairs
- Composing, sending, and receiving signed messages
- Viewing system and group messages
- Managing user settings (identity, domain, key backup)
- Realtime WebSocket support (optional phase)

## ⚛️ Tech Stack
| Layer        | Tech               | Purpose                      |
|--------------|--------------------|-------------------------------|
| UI Framework | React + Vite       | Lightweight SPA architecture |
| Styling      | Tailwind CSS       | Utility-first design         |
| State Mgmt   | Zustand            | App-level state              |
| UI Kit       | shadcn/ui pattern  | Clean, accessible UI         |
| Bridge API   | WASM (Go SDK)      | Secure cryptographic ops     |

## 📂 Folder Structure
```
src/
├── components/       # Shared UI components (Button, Status, etc.)
├── pages/            # Page-level views (Inbox, Compose, Group, etc.)
├── hooks/            # Custom hooks (useKeyStore, useEmsgWebSocket, etc.)
├── services/         # API abstraction, WASM bridge
├── context/          # Global context (auth, client)
├── utils/            # EMSG formatting helpers
└── main.tsx          # App entry point
```

## 🧱 UI Modules
- 📥 Inbox Page: View received messages (real-time updates)
- ✉️ Compose Message Page: Send signed messages
- 📤 Sent Messages: View sent messages
- 👥 Group Chat UI: Group messaging and events
- 🧾 System Messages: System notifications (joined, left, etc.)
- 🔐 Key Pair Generator / Import: Ed25519 key management
- ⚙️ Settings Panel: Domain, key export/backup
- 🔧 Developer Debug Panel: Inspect state, simulate errors

All modules are fully typed, modular, responsive, and support dark/light themes.

## 🛠️ Setup & Usage

### 1. Install dependencies
```
npm install
```

### 2. WASM Setup
- Build the EMSG Client SDK as `emsg.wasm` (see SDK repo for instructions)
- Place `emsg.wasm` and `wasm_exec.js` in the `public/` directory

### 3. Start the development server
```
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser

### 4. Run tests
```
npm test
```

## 🧪 Testing
- Unit tests: `src/components/__tests__`, etc. (Jest + React Testing Library)
- Expand coverage for all components, hooks, and flows

## 🧩 WASM Bridge API
- All cryptographic and messaging operations are performed in-browser via the Go SDK compiled to WASM
- See `src/services/emsg-wasm.ts` for the JS bridge
- API abstraction in `src/services/api.ts` allows switching between mock, REST, and WASM

## 🌐 WebSocket Support
- Real-time updates via `useEmsgWebSocket` hook
- Connection status indicator in the nav bar
- Inbox and other pages update live as new messages arrive

## 📝 References
- [EMSG Protocol Spec](https://github.com/emsg-protocol/specification)
- [EMSG Client SDK](https://github.com/emsg-protocol/emsg-client-sdk)
- [EMSG Daemon](https://github.com/emsg-protocol/emsg-daemon)

---

**This project is a fully working, production-ready, privacy-first secure messaging SPA for the EMSG protocol.**
