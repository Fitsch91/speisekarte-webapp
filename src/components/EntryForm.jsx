import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Form.css';

const CATEGORIES = [
  'Kalte Vorspeisen',
  'Warme Vorspeisen',
  'Suppen',
  'Hauptspeisen',
  'Desserts',
];

export default function EntryForm() {
  const deRef = useRef();
  const itRef = useRef();
  const enRef = useRef();
  const navigate = useNavigate();

  const translate = async () => {
    const text = deRef.current.innerText;
    const respIt = await fetch(`${process.env.REACT_APP_DEEPL_PROXY}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_lang: 'IT' }),
    });
    const it = await respIt.json();
    itRef.current.innerHTML = it.translation;
    const respEn = await fetch(`${process.env.REACT_APP_DEEPL_PROXY}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_lang: 'EN' }),
    });
    const en = await respEn.json();
    enRef.current.innerHTML = en.translation;
  };

  const highlight = color => {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, color);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      name_de: deRef.current.innerHTML,
      name_it: itRef.current.innerHTML,
      name_en: enRef.current.innerHTML,
      category: e.target.category.value,
      is_daily_menu: e.target.daily.checked,
      is_on_menu: e.target.onmenu.checked,
      price: parseFloat(e.target.price.value),
      marker: e.target.marker.value,
    };
    await supabase.from('dishes').insert([payload]);
    navigate('/');
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Neues Gericht</h2>
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
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <label><input type="checkbox" name="daily" /> Tagesmenü</label>
      <label><input type="checkbox" name="onmenu" /> Auf Speisekarte</label>

      <label>Preis (€):</label>
      <input type="number" step="0.01" name="price" required />

      <label>Marker:</label>
      <select name="marker">
        <option value="green">🟢 Eigenen Hof</option>
        <option value="brown">🟤 Region</option>
        <option value="black">⚫ Standard</option>
      </select>

      <button type="submit">Speichern</button>
    </form>
);
}
