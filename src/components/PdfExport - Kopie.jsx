// src/components/PdfExport.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  PDFDownloadLink,
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { Link } from 'react-router-dom';
import './Pdf.css';

// Fonts registrieren
Font.register({ family: 'Papyrus', src: `${window.location.origin}/fonts/Papyrus.ttf` });
Font.register({ family: 'Papyrus-Bold', src: `${window.location.origin}/fonts/PapyrusB.ttf` });

// Kategorien-Reihenfolge
const CATEGORY_ORDER = [
  'Kalte Vorspeisen',
  'Suppen',
  'Warme Vorspeisen',
  'Hauptspeisen',
  'Desserts',
];

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Papyrus',
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center', // vertical zentrieren
    alignItems: 'center',     // horizontal zentrieren
  },
  welcomeLine: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Papyrus',
    marginBottom: 4,
  },
  spacer: { marginBottom: 8 },
  titleMenu: {
    fontSize: 28,
    textAlign: 'center',
    fontFamily: 'Papyrus-Bold',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Papyrus-Bold',
  },
 itemContainer: {
    marginBottom: 12,
    width: '100%',        // Container füllt die ganze Breite
    alignItems: 'center', // alle Kinder (dein Text) mittig ausrichten
  },
  separator: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 4,
    fontFamily: 'Papyrus',
  },
  itemDe: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Papyrus-Bold',
  },
  itemItEn: {
    fontSize: 11,
    textAlign: 'center',
    color: '#555',
    fontFamily: 'Papyrus',
  },
  itemPrice: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Papyrus',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
  },
  footerColorLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  colorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  footerText: {
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 1.2,
    fontFamily: 'Papyrus',
  },
});

// Highlight-Funktion für farbige <span>
const renderHighlighted = (html, baseStyle) => {
  const regex = /<span style="color:\s*(#(?:[0-9A-Fa-f]{3}){1,2}|rgb\(\d+,\s*\d+,\s*\d+\))\s*;?">(.*?)<\/span>/g;
  let lastIndex = 0,
    elements = [],
    match;
  while ((match = regex.exec(html))) {
    if (match.index > lastIndex) {
      elements.push({ text: html.slice(lastIndex, match.index), color: '#000' });
    }
    elements.push({ text: match[2], color: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < html.length) {
    elements.push({ text: html.slice(lastIndex), color: '#000' });
  }
  return (
    <Text style={baseStyle}>
      {elements.map((el, i) => (
        <Text key={i} style={{ color: el.color }}>
          {el.text}
        </Text>
      ))}
    </Text>
  );
};

function MyDoc({ dishes, dailyMenuPrice }) {
  // tägliche Menüs sortiert nach CATEGORY_ORDER
  const dailyItems = CATEGORY_ORDER.flatMap(cat =>
    dishes.filter(d => d.category === cat && d.is_daily_menu)
  );

  return (
    <Document>
      {/* Erste Seite: Tagesmenü */}
      <Page key="daily" style={styles.page}>
        <View style={styles.contentContainer}>
          <Text style={styles.welcomeLine}>Herzlich willkommen im Gasthaus Oberraut</Text>
          <Text style={styles.welcomeLine}>Benvenuti nel nostro albergo</Text>
          <Text style={styles.welcomeLine}>Welcome to our restaurant</Text>
          <View style={styles.spacer} />
          <Text style={styles.titleMenu}>Menü</Text>

          {dailyItems.map((d, i) => (
            <View key={d.id} style={styles.itemContainer}>
              {renderHighlighted(d.name_de, styles.itemDe)}
              {renderHighlighted(d.name_it, styles.itemItEn)}
              {renderHighlighted(d.name_en, styles.itemItEn)}
              {i < dailyItems.length - 1 && (
                <Text style={styles.separator}>*****</Text>
              )}
            </View>
          ))}

          <Text style={styles.itemPrice}>
            € {Number(dailyMenuPrice).toFixed(2)}
          </Text>
        </View>

        {/* Fußzeile */}
        <View style={styles.footerContainer}>
          <View style={styles.footerColorLine}>
            <View style={{ ...styles.colorDot, backgroundColor: '#27ae60' }} />
            <Text style={styles.footerText}>
              Produkt vom Hof / Prodotto della fattoria / Farm product
            </Text>
          </View>
          <View style={styles.footerColorLine}>
            <View style={{ ...styles.colorDot, backgroundColor: '#a04000' }} />
            <Text style={styles.footerText}>
              Produkt aus der Region / Prodotto regionale / Regional product
            </Text>
          </View>
          <Text style={styles.footerText}>
            DE: Kann folgende Allergene enthalten: Gluten, Eier, Erdnüsse, Milch,
            Nüsse, Sellerie, Sesam, Soja, Fisch, Krustentiere, Sulfite, Senf
          </Text>
          <Text style={styles.footerText}>
            IT: Può contenere i seguenti allergeni: glutine, uova, arachidi, latte,
            frutta a guscio, sedano, sesamo, soia, pesce, crostacei, solfiti,
            senape
          </Text>
          <Text style={styles.footerText}>
            EN: May contain the following allergens: gluten, eggs, peanuts,
            milk, nuts, celery, sesame, soy, fish, crustaceans, sulfites,
            mustard
          </Text>
        </View>
      </Page>

      {/* Weitere Seiten: jede Kategorie einzeln, nur is_on_menu */}
      {CATEGORY_ORDER.map(cat => {
        const items = dishes.filter(
          d => d.category === cat && d.is_on_menu
        );
        if (!items.length) return null;

        return (
          <Page key={cat} style={styles.page}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{cat}</Text>
              {items.map(d => (
                <View key={d.id} style={styles.itemContainer}>
                  {renderHighlighted(d.name_de, styles.itemDe)}
                  {renderHighlighted(d.name_it, styles.itemItEn)}
                  {renderHighlighted(d.name_en, styles.itemItEn)}
                  <Text style={styles.itemPrice}>€ {d.price.toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.footerContainer}>
              <View style={styles.footerColorLine}>
                <View style={{ ...styles.colorDot, backgroundColor: '#27ae60' }} />
                <Text style={styles.footerText}>
                  Produkt vom Hof / Prodotto della fattoria / Farm product
                </Text>
              </View>
              <View style={styles.footerColorLine}>
                <View style={{ ...styles.colorDot, backgroundColor: '#a04000' }} />
                <Text style={styles.footerText}>
                  Produkt aus der Region / Prodotto regionale / Regional product
                </Text>
              </View>
              <Text style={styles.footerText}>
                DE: Kann folgende Allergene enthalten: Gluten, Eier, Erdnüsse, Milch,
                Nüsse, Sellerie, Sesam, Soja, Fisch, Krustentiere, Sulfite, Senf
              </Text>
              <Text style={styles.footerText}>
                IT: Può contenere i seguenti allergeni: glutine, uova, arachidi,
                latte, frutta a guscio, sedano, sesamo, soia, pesce, crostacei,
                solfiti, senape
              </Text>
              <Text style={styles.footerText}>
                EN: May contain the following allergens: gluten, eggs, peanuts,
                milk, nuts, celery, sesame, soy, fish, crustaceans, sulfites,
                mustard
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

export default function PdfExport() {
  const [dishes, setDishes] = useState(null);
  const [dailyMenuPrice, setDailyMenuPrice] = useState('');

  useEffect(() => {
    supabase
      .from('dishes')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setDishes(data);
      });
    supabase
      .from('app_config')
      .select('value')
      .eq('key', 'daily_menu_price')
      .single()
      .then(({ data, error }) => {
        if (!error) setDailyMenuPrice(data?.value ?? '');
      });
  }, []);

  if (!dishes) return <div>Lädt PDF…</div>;

  return (
    <div className="pdf-export">
      <div className="pdf-buttons">
        <Link to="/">
          <button className="btn btn-back">← Zurück</button>
        </Link>
        <PDFDownloadLink
          document={<MyDoc dishes={dishes} dailyMenuPrice={dailyMenuPrice} />}
          fileName="speisekarte.pdf"
        >
          {({ loading }) => (
            <button className="btn btn-download" disabled={loading}>
              {loading ? 'Erstelle PDF …' : 'Herunterladen'}
            </button>
          )}
        </PDFDownloadLink>
      </div>
      <div className="pdf-viewer-container">
        <PDFViewer className="pdf-viewer">
          <MyDoc dishes={dishes} dailyMenuPrice={dailyMenuPrice} />
        </PDFViewer>
      </div>
    </div>
  );
}
