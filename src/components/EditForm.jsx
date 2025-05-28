// src/components/EditForm.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Form.css';

export default function EditForm() {
  const { dishId } = useParams();
  const deRef = useRef(null);
  const itRef = useRef(null);
  const enRef = useRef(null);
  const navigate = useNavigate();

  // Laden der Daten – erst wenn das Ref bereit ist
  useEffect(() => {
    // Hol die Daten aus Supabase
    supabase
      .from('dishes')
      .select('*')
      .eq('id', dishId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Fehler beim Laden:', error);
          return;
        }
        // Nur setzen, wenn die Refs wirklich existieren
        if (deRef.current) deRef.current.innerHTML = data.name_de;
        if (itRef.current) itRef.current.innerHTML = data.name_it;
        if (enRef.current) enRef.current.innerHTML = data.name_en;

        // Standard-Inputs befüllen
        const form = document.forms.editForm;
        form.category.value = data.category;
        form.daily.checked = data.is_daily_menu;
        form.onmenu.checked = data.is_on_menu;
        form.price.value = data.price;
        form.marker.value = data.marker;
      });
  }, [dishId]);

  const translate = async () => {
    const text = deRef.current?.innerText || '';
    // Italienisch
    try {
      const respIt = await fetch(
        `${process.env.REACT_APP_DEEPL_PROXY}/translate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, target_lang: 'IT' }),
        }
      );
      const it = await respIt.json();
      if (itRef.current) itRef.current.innerHTML = it.translation;
    } catch (err) {
      console.error('IT-Übersetzung fehlgeschlagen', err);
    }
    // Englisch
    try {
      const respEn = await fetch(
        `${process.env.REACT_APP_DEEPL_PROXY}/translate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, target_lang: 'EN' }),
        }
      );
      const en = await respEn.json();
      if (enRef.current) enRef.current.innerHTML = en.translation;
    } catch (err) {
      console.error('EN-Übersetzung fehlgeschlagen', err);
    }
  };

  const highlight = color => {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, color);
  };

  const handleUpdate = async e => {
    e.preventDefault();
    const form = e.target;
    const updates = {
      name_de: deRef.current?.innerHTML || '',
      name_it: itRef.current?.innerHTML || '',
      name_en: enRef.current?.innerHTML || '',
      category: form.category.value,
      is_daily_menu: form.daily.checked,
      is_on_menu: form.onmenu.checked,
      price: parseFloat(form.price.value),
      marker: form.marker.value,
    };
    const { error } = await supabase
      .from('dishes')
      .update(updates)
      .eq('id', dishId);
    if (error) {
      alert('Fehler beim Aktualisieren: ' + error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <form name="editForm" className="form" onSubmit={handleUpdate}>
      <h2>Gericht bearbeiten</h2>

      <div className="color-bar">
        <button type="button" onClick={() => highlight('#27ae60')}>🟢</button>
        <button type="button" onClick={() => highlight('#a04000')}>🟤</button>
        <button type="button" onClick={() => highlight('#000000')}>⚫</button>
        <button type="button" onClick={translate}>Übersetzen</button>
      </div>

      <label>Name (DE):</label>
      <div ref={deRef} contentEditable className="editable" />

      <label>Name (IT):</label>
      <div ref={itRef} contentEditable className="editable" />

      <label>Name (EN):</label>
      <div ref={enRef} contentEditable className="editable" />

      <label>Kategorie:</label>
      <select name="category">
        <option value="Kalte Vorspeisen">Kalte Vorspeisen</option>
        <option value="Warme Vorspeisen">Warme Vorspeisen</option>
        <option value="Suppen">Suppen</option>
        <option value="Hauptspeisen">Hauptspeisen</option>
        <option value="Desserts">Desserts</option>
      </select>

      <label>
        <input type="checkbox" name="daily" /> Tagesmenü
      </label>
      <label>
        <input type="checkbox" name="onmenu" /> Auf Speisekarte
      </label>

      <label>Preis (€):</label>
      <input type="number" step="0.01" name="price" required />

      <label>Marker:</label>
      <select name="marker">
        <option value="green">🟢 Eigenen Hof</option>
        <option value="brown">🟤 Region</option>
        <option value="black">⚫ Standard</option>
      </select>

      <button type="submit">Aktualisieren</button>
    </form>
  );
}
