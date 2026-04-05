import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import KeyPair from './pages/KeyPair';
import DevPanel from './pages/DevPanel';
import AppShell from './components/AppShell';
import { useAuthStore } from './hooks/useAuthStore';



function App() {
  const privateKey = useAuthStore((s) => s.privateKey);
  return (
    <BrowserRouter>
      <Routes>
        {!privateKey && <Route path="*" element={<Login />} />}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/keypair" element={<KeyPair />} />
        <Route path="/dev" element={<DevPanel />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
