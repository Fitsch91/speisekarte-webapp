// src/components/PdfPreview.jsx
import React, { useEffect, useState } from 'react';
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { supabase } from '../supabaseClient';
import './Pdf.css';

// Fonts registrieren
Font.register({ family: 'Papyrus', src: `${window.location.origin}/fonts/Papyrus.ttf` });
format: 'truetype'
Font.register({ family: 'Papyrus-Bold', src: `${window.location.origin}/fonts/PapyrusB.ttf` });
format: 'truetype'

const CATEGORY_ORDER = [
  { key: 'menu', title: 'Menü' },
  { key: 'Kalte Vorspeisen', title: 'Kalte Vorspeisen' },
  { key: 'Suppen', title: 'Suppen' },
  { key: 'Warme Vorspeisen', title: 'Warme Vorspeisen' },
  { key: 'Hauptspeisen', title: 'Hauptspeisen' },
  { key: 'Desserts', title: 'Desserts' },
];

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Papyrus', position: 'relative' },
  welcomeLine: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Papyrus',
    marginBottom: 4,
  },
  spacer: {
    marginBottom: 8,
  },
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
  itemContainer: { marginBottom: 12 },
  separator: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 4,
    fontFamily: 'Papyrus',
  },
  itemDe: { fontSize: 13, textAlign: 'center', fontFamily: 'Papyrus-Bold' },
  itemItEn: { fontSize: 11, textAlign: 'center', color: '#555', fontFamily: 'Papyrus' },
  itemPrice: { fontSize: 10, textAlign: 'center', marginTop: 4, fontFamily: 'Papyrus' },
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

// Highlight-Funktion
const renderHighlighted = (html, baseStyle) => {
  const regex = /<span style="color:\s*(#(?:[0-9A-Fa-f]{3}){1,2}|rgb\(\d+,\s*\d+,\s*\d+\))\s*;?">(.*?)<\/span>/g;
  let lastIndex = 0,
    elements = [],
    match;
  while ((match = regex.exec(html))) {
    if (match.index > lastIndex) elements.push({ text: html.slice(lastIndex, match.index), color: '#000' });
    elements.push({ text: match[2], color: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < html.length) elements.push({ text: html.slice(lastIndex), color: '#000' });
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
  return (
    <Document>
      {CATEGORY_ORDER.map(({ key, title }) => {
        const items =
          key === 'menu'
            ? dishes.filter(d => d.is_daily_menu)
            : dishes.filter(d => d.category === key && !d.is_special);
        if (!items.length) return null;

        return (
          <Page key={key} style={styles.page}>
            {key === 'menu' && (
              <>
                <Text style={styles.welcomeLine}>Herzlich willkommen im Gasthaus Oberraut</Text>
                <Text style={styles.welcomeLine}>Benvenuti nel nostro albergo</Text>
                <Text style={styles.welcomeLine}>Welcome to our restaurant</Text>
                <View style={styles.spacer} />
                <Text style={styles.titleMenu}>{title}</Text>
              </>
            )}
            {key !== 'menu' && <Text style={styles.title}>{title}</Text>}

            {key === 'menu' ? (
              <>
                {items.map((d, i) => (
                  <View key={d.id} style={styles.itemContainer}>
                    {renderHighlighted(d.name_de, styles.itemDe)}
                    {renderHighlighted(d.name_it, styles.itemItEn)}
                    {renderHighlighted(d.name_en, styles.itemItEn)}
                    {/* Zwischen allen Gerichten Sterne */}
                    <Text style={styles.separator}>*****</Text>
                  </View>
                ))}
                {/* Nach dem letzten Gericht: Gesamtpreis */}
  <Text style={styles.itemPrice}>
  € {Number(dailyMenuPrice).toFixed(2)}
</Text>

              </>
            ) : (
              items.map(d => (
                <View key={d.id} style={styles.itemContainer}>
                  {renderHighlighted(d.name_de, styles.itemDe)}
                  {renderHighlighted(d.name_it, styles.itemItEn)}
                  {renderHighlighted(d.name_en, styles.itemItEn)}
                  <Text style={styles.itemPrice}>€ {d.price.toFixed(2)}</Text>
                </View>
              ))
            )}

            <View style={styles.footerContainer}>
              {/* Fußzeile wie gehabt */}
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
                DE: Kann folgende Allergene enthalten: Gluten, Eier, Erdnüsse, Milch, Nüsse,
                Sellerie, Sesam, Soja, Fisch, Krustentiere, Sulfite, Senf
              </Text>
              <Text style={styles.footerText}>
                IT: Può contenere i seguenti allergeni: glutine, uova, arachidi, latte, frutta a
                guscio, sedano, sesamo, soia, pesce, crostacei, solfiti, senape
              </Text>
              <Text style={styles.footerText}>
                EN: May contain the following allergens: gluten, eggs, peanuts, milk, nuts,
                celery, sesame, soy, fish, crustaceans, sulfites, mustard
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

export default function PdfPreview() {
  const [dishes, setDishes] = useState(null);
  const [dailyMenuPrice, setDailyMenuPrice] = useState('');

  useEffect(() => {
    supabase.from('dishes').select('*').then(({ data, error }) => {
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

  if (!dishes) return <div>Lädt Vorschau …</div>;

  return (
    <div className="pdf-viewer-container">
      <PDFViewer className="pdf-viewer">
        <MyDoc dishes={dishes} dailyMenuPrice={dailyMenuPrice} />
      </PDFViewer>
    </div>
  );
}
