// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import DishList from './components/DishList';
import EntryForm from './components/EntryForm';
import EditForm from './components/EditForm';
import PdfExport from './components/PdfExport';
import PdfPreview from './components/PdfPreview';
import SpecialPreview from './components/SpecialPreview';

export default function App() {
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
