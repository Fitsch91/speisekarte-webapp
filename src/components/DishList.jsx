// src/components/DishList.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './DishList.css';

const CATEGORY_ORDER = [
  'Kalte Vorspeisen',
  'Suppen',
  'Warme Vorspeisen',
  'Hauptspeisen',
  'Desserts',
];

const CATEGORIES = [
  { name: 'Kalte Vorspeisen', color: '#d35400' },
  { name: 'Suppen',           color: '#27ae60' },
  { name: 'Warme Vorspeisen', color: '#c0392b' },
  { name: 'Hauptspeisen',     color: '#2980b9' },
  { name: 'Desserts',         color: '#8e44ad' },
];

export default function DishList() {
  const navigate = useNavigate();

  // Daten & UI-State
  const [dishes, setDishes] = useState([]);
  const [searchTerms, setSearchTerms] = useState(
    CATEGORIES.reduce((acc, { name }) => ({ ...acc, [name]: '' }), {})
  );
  const [collapsed, setCollapsed] = useState(
    CATEGORIES.reduce((acc, { name }) => ({ ...acc, [name]: false }), {})
  );

  // Tagesmenü-Preis
  const [menuPrice, setMenuPrice] = useState('');

  // Spezial-Menü
  const [specialName, setSpecialName] = useState('');
  const [specialPrice, setSpecialPrice] = useState('');
  const [specialLangs, setSpecialLangs] = useState({ de: true, it: true, en: true });

  useEffect(() => {
    fetchDishes();
    loadMenuPrice();
    loadSpecialConfig();
  }, []);

  // Supabase-Funktionen
  async function fetchDishes() {
    const { data, error } = await supabase.from('dishes').select('*');
    if (error) console.error(error);
    else setDishes(data);
  }

  // Tagesmenü persistence
  async function loadMenuPrice() {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'daily_menu_price')
      .single();
    if (!error) setMenuPrice(data?.value ?? '');
  }
  async function saveMenuPrice() {
    const v = parseFloat(menuPrice);
    if (isNaN(v)) { alert('Bitte gültigen Preis eingeben.'); return; }
    const { error } = await supabase
      .from('app_config')
      .upsert({ key: 'daily_menu_price', value: v });
    if (error) alert('Fehler beim Speichern.'); else alert('Tagesmenü-Preis gespeichert.');
  }

  // Spezial-Menü persistence
async function loadSpecialConfig() {
  // Name aus text_value
  const { data: nData, error: errName } = await supabase
    .from('app_config')
    .select('text_value')
    .eq('key', 'special_menu_name')
    .single();
  if (!errName && nData) setSpecialName(nData.text_value);

  // Preis aus value
  const { data: pData, error: errPrice } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'special_menu_price')
    .single();
  if (!errPrice && pData) setSpecialPrice(pData.value);
}

async function saveSpecialConfig() {
  // Name in text_value upserten
  const { error: e1 } = await supabase
    .from('app_config')
    .upsert({ key: 'special_menu_name', text_value: specialName });

  // Preis in value upserten
  const v = parseFloat(specialPrice);
  if (isNaN(v)) {
    alert('Bitte gültigen Preis eingeben.');
    return;
  }
  const { error: e2 } = await supabase
    .from('app_config')
    .upsert({ key: 'special_menu_price', value: v });

  if (e1 || e2) alert('Fehler beim Speichern.'); 
  else alert('Spezial-Menü gespeichert.');
}


  // Hilfsfunktionen
  async function toggleField(d, field) {
    await supabase.from('dishes').update({ [field]: !d[field] }).eq('id', d.id);
    fetchDishes();
  }
  async function deleteDish(id) {
    if (!window.confirm('Wirklich löschen?')) return;
    await supabase.from('dishes').delete().eq('id', id);
    fetchDishes();
  }
  function handleSearch(cat, v) {
    setSearchTerms(s => ({ ...s, [cat]: v }));
  }
  function toggleLang(l) {
    setSpecialLangs(s => ({ ...s, [l]: !s[l] }));
  }
  function toggleCollapse(cat) {
    setCollapsed(c => ({ ...c, [cat]: !c[cat] }));
  }
  function downloadSpecialPDF() {
    const params = new URLSearchParams({
      title: specialName,
      price: specialPrice,
      langs: Object.entries(specialLangs)
        .filter(([, on]) => on)
        .map(([l]) => l)
        .join(','),
    });
    window.open(`/preview-special?${params}`, '_blank');
  }

  // Daten
  const dailyItems = CATEGORY_ORDER.flatMap(cat =>
    dishes.filter(d => d.category === cat && d.is_daily_menu)
  );
  const specialItems = CATEGORY_ORDER.flatMap(cat =>
    dishes.filter(d => d.category === cat && d.is_special)
  );

  return (
    <div className="dish-list">
      {/* 1. Tagesmenü */}
      <section className="daily-menu-section">
        <h2>Tagesmenü</h2>
        <div className="daily-price-input">
          <label>
            Gesamtpreis (€):
            <input
              type="number"
              step="0.01"
              value={menuPrice}
              onChange={e => setMenuPrice(e.target.value)}
              placeholder="z. B. 29.90"
            />
          </label>
          <button className="btn-save" onClick={saveMenuPrice}>
            💾 Speichern
          </button>
        </div>
        <ul className="daily-list">
          {dailyItems.map(d => (
            <li key={d.id} className="daily-item">
              <span dangerouslySetInnerHTML={{ __html: d.name_de }} /> 
            </li>
          ))}
        </ul>
      </section>

      {/* 2. Standard-Kategorien (collapsible) */}
      {CATEGORIES.map(({ name, color }) => {
        let items = dishes.filter(d => d.category === name);
        const term = searchTerms[name].toLowerCase();
        if (term) {
          items = items.filter(d =>
            [d.name_de, d.name_it, d.name_en].some(txt =>
              txt.toLowerCase().includes(term)
            )
          );
        }
        items.sort((a, b) => {
          if (a.is_special !== b.is_special) return b.is_special - a.is_special;
          if (a.is_daily_menu !== b.is_daily_menu) return b.is_daily_menu - a.is_daily_menu;
          if (a.is_on_menu !== b.is_on_menu)     return b.is_on_menu - a.is_on_menu;
          return a.name_de.localeCompare(b.name_de);
        });

        return (
          <section key={name} className="category-section">
            <div
              className="category-header"
              style={{ background: color, color: '#fff', cursor: 'pointer' }}
              onClick={() => toggleCollapse(name)}
            >
              <h2>{name} {collapsed[name] ? '▸' : '▾'}</h2>
              <input
                type="text"
                placeholder="Suche…"
                value={searchTerms[name]}
                onClick={e => e.stopPropagation()}
                onChange={e => handleSearch(name, e.target.value)}
              />
            </div>
            {!collapsed[name] && (
              <ul className="dish-rows">
                {items.map(d => (
                  <li key={d.id} className="dish-row">
                    <div className="dish-info">
                      <div className="dish-names">
                        <div dangerouslySetInnerHTML={{ __html: d.name_de }} />
                        <div dangerouslySetInnerHTML={{ __html: d.name_it }} />
                        <div dangerouslySetInnerHTML={{ __html: d.name_en }} />
                      </div>
                      <div className="dish-price">€ {d.price.toFixed(2)}</div>
                    </div>
                    <div className="dish-controls">
                      <button
                        className={`toggle-btn ${d.is_special ? 'active' : ''} small`}
                        onClick={() => toggleField(d, 'is_special')}
                      >
                        Spezial
                      </button>
                      <button
                        className={`toggle-btn ${d.is_daily_menu ? 'active' : ''}`}
                        onClick={() => toggleField(d, 'is_daily_menu')}
                      >
                        Tagesmenü
                      </button>
                      <button
                        className={`toggle-btn ${d.is_on_menu ? 'active' : ''}`}
                        onClick={() => toggleField(d, 'is_on_menu')}
                      >
                        Speisekarte
                      </button>
                      <button onClick={() => navigate(`/edit/${d.id}`)}>Bearbeiten</button>
                      <button onClick={() => deleteDish(d.id)}>Löschen</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {/* 3. Spezial-Menü */}
      <section className="special-menu-section">
        <h2>Spezial-Menü</h2>
        <div className="special-config">
          <label>
            Name:
            <input
              type="text"
              value={specialName}
              onChange={e => setSpecialName(e.target.value)}
              placeholder="z. B. Abend-Special"
            />
          </label>
          <label>
            Preis (€):
            <input
              type="number"
              step="0.01"
              value={specialPrice}
              onChange={e => setSpecialPrice(e.target.value)}
              placeholder="optional"
            />
          </label>
          <div className="lang-toggles">
            <label>
              <input
                type="checkbox"
                checked={specialLangs.de}
                onChange={() => toggleLang('de')}
              />{' '}
              DE
            </label>
            <label>
              <input
                type="checkbox"
                checked={specialLangs.it}
                onChange={() => toggleLang('it')}
              />{' '}
              IT
            </label>
            <label>
              <input
                type="checkbox"
                checked={specialLangs.en}
                onChange={() => toggleLang('en')}
              />{' '}
              EN
            </label>
          </div>
          <button onClick={saveSpecialConfig}>💾 Speichern</button>
          <button onClick={downloadSpecialPDF}>PDF Spezial</button>
        </div>
        <ul className="special-list">
          {specialItems.map(d => (
            <li key={d.id} className="special-item">
              {specialLangs.de && <span dangerouslySetInnerHTML={{ __html: d.name_de }} />}
              {specialLangs.it && <> — <span dangerouslySetInnerHTML={{ __html: d.name_it }} /></>}
              {specialLangs.en && <> — <span dangerouslySetInnerHTML={{ __html: d.name_en }} /></>}
              {' '}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
