// src/components/NavBar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Nach dem Ausloggen zurück zur Login-Seite
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar">
      <NavLink to="/"      className="nav-item">Übersicht</NavLink>
      <NavLink to="/entry" className="nav-item">Neues Gericht</NavLink>
      <NavLink to="/export" className="nav-item">PDF Export</NavLink>
      <button
        type="button"
        onClick={handleLogout}
        className="nav-item nav-logout"
      >
        Logout
      </button>
    </nav>
  );
}
