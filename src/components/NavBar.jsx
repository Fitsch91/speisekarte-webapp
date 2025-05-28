import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-item">Übersicht</NavLink>
      <NavLink to="/entry" className="nav-item">Neues Gericht</NavLink>
      <NavLink to="/export" className="nav-item">PDF Export</NavLink>
    </nav>
  );
}
