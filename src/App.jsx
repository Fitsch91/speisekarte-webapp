// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import NavBar from './components/NavBar';
import Login from './components/Login';
import DishList from './components/DishList';
import EntryForm from './components/EntryForm';
import EditForm from './components/EditForm';
import PdfExport from './components/PdfExport';
import PdfPreview from './components/PdfPreview';
import SpecialPreview from './components/SpecialPreview';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // initial session check
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    // listener for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // if not logged in, show only the login route
  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // logged in: show the app
  return (
    <>
      <NavBar />
      <div className="app-container">
        <Routes>
          {/* Dashboard: Liste aller Gerichte */}
          <Route path="/" element={<DishList />} />

          {/* Neues Gericht anlegen */}
          <Route path="/entry" element={<EntryForm />} />

          {/* Bestehendes Gericht bearbeiten */}
          <Route path="/edit/:dishId" element={<EditForm />} />

          {/* PDF-Export der Speisekarte */}
          <Route path="/export" element={<PdfExport />} />

          {/* PDF-Vorschau Standard-PDF */}
          <Route path="/preview" element={<PdfPreview />} />

          {/* PDF-Vorschau Spezial-Menü */}
          <Route path="/preview-special" element={<SpecialPreview />} />
        </Routes>
      </div>
    </>
  );
}
