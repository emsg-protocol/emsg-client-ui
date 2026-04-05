// src/wasm-init.ts
// Sets EMSG_DAEMON_URL on window before WASM initialisation.
// Imported as the first module entry in main.tsx.

declare global {
  interface Window {
    EMSG_DAEMON_URL: string;
    __emsgWasmReady: boolean;
    __emsgWasmError: string | undefined;
  }
}

window.EMSG_DAEMON_URL = import.meta.env.VITE_DAEMON_URL ?? 'http://localhost:8765';

export {};
