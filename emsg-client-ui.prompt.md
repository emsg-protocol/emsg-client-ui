# 🧠 AI Agent Prompt: Develop `emsg-client-ui` for EMSG Protocol

You are an AI frontend engineer responsible for building the `emsg-client-ui`, a web-based secure messaging interface for the EMSG protocol. The backend logic is powered by `emsg-client-sdk`, which provides Go-based cryptographic and messaging operations.

---

## 🔧 Project Goals

Build a cross-platform, privacy-first EMSG client UI that enables:
- Login/register using Ed25519 key pairs
- Composing, sending, and receiving signed messages
- Viewing system messages and group messages
- Managing user settings (identity, domain, key backup)
- Realtime WebSocket support (optional phase)

---

## ⚛️ Tech Stack

| Layer        | Tech               | Purpose                      |
|--------------|--------------------|-------------------------------|
| UI Framework | React + Vite       | Lightweight SPA architecture |
| Styling      | Tailwind CSS       | Utility-first design         |
| State Mgmt   | Zustand or Redux   | App-level state              |
| UI Kit       | shadcn/ui          | Clean, accessible UI         |
| Bridge API   | REST or WASM       | Talk to `emsg-client-sdk`    |

---

## 🧱 UI Modules To Build

- [ ] 📥 Inbox Page
- [ ] ✉️ Compose Message Page
- [ ] 📤 Sent Messages
- [ ] 👥 Group Chat UI
- [ ] 🧾 System Messages (joined, left, removed, etc.)
- [ ] 🔐 Key Pair Generator / Import
- [ ] ⚙️ Settings Panel (domain, key export)
- [ ] 🔧 Developer Debug Panel

Each page/component must be fully typed, modular, responsive, and compatible with dark/light themes.

---

## 📂 Folder Structure (Recommended)

```
src/
├── components/       # Shared UI components
├── pages/            # Page-level views
├── hooks/            # useInbox(), useCompose(), etc.
├── services/         # EMSG API calls via REST/WASM bridge
├── context/          # Global context (auth, client)
├── utils/            # EMSG formatting helpers
└── main.tsx
```

---

## 📡 SDK Bridge API

Use the Go SDK via either:

1. 🧪 **WASM**: Compile the Go SDK into WebAssembly
2. 🌐 **REST Proxy**: Talk to emsg-daemon locally via API

Initial development can mock `services/api.ts` to simulate messages and auth.

---

## 🧪 Deliverables

- Fully working SPA (React) with routing
- Working message composer + viewer
- Group and system message display
- Mobile responsiveness and accessibility
- Proper error handling, loading states
- Theme and layout consistency

---

## 📌 References

- Protocol: https://github.com/emsg-protocol/specification
- SDK: https://github.com/emsg-protocol/emsg-client-sdk
- Daemon: https://github.com/emsg-protocol/emsg-daemon