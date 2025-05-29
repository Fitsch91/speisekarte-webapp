// src/components/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      // Redirect auf deine Live-App
      window.location.href = 'https://speisekarte-webapp-1.onrender.com/';
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Einloggen</h2>
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleSignIn} disabled={loading}>
          {loading ? 'Lädt…' : 'Einloggen'}
        </button>
      </div>
    </div>
  );
}
