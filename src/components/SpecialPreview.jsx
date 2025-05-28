// src/components/SpecialPreview.jsx
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
import './Special.css';

// register Papyrus fonts
Font.register({ family: 'Papyrus', src: '/fonts/Papyrus.ttf' });
Font.register({ family: 'Papyrus-Bold', src: '/fonts/PapyrusB.ttf' });

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    padding: 40,
    fontFamily: 'Papyrus',
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'flex-end',   // Inhalt am unteren Rand
    alignItems: 'flex-end',       // am rechten Rand der linken Hälfte
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',     // vertikale Zentrierung
    alignItems: 'center',         // horizontale Zentrierung
    paddingLeft: 20,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Papyrus',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Papyrus-Bold',
  },
  itemName: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Papyrus',
  },
  separatorWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
  },
  separator: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Papyrus',
  },
  price: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Papyrus-Bold',
  },
  footerText: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Papyrus',
  },
});

export default function SpecialPreview() {
  const [dishes, setDishes] = useState([]);
  const [params, setParams] = useState({ title: '', price: '', langs: [] });

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setParams({
      title: sp.get('title') || 'Spezial-Menü',
      price: sp.get('price') || '',
      langs: (sp.get('langs') || '').split(',').filter(Boolean),
    });
    supabase
      .from('dishes')
      .select('*')
      .eq('is_special', true)
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setDishes(data || []);
      });
  }, []);

  const now = new Date();
  const dateString = `Gasthof Oberraut, am ${now.getDate()}. ${
    MONTH_NAMES[now.getMonth()]
  } ${now.getFullYear()}`;

  const footers = {
    de: 'Guten Appetit wünscht Ihnen Familie Feichter',
    it: 'Buon appetito Vi augura la famiglia Feichter',
    en: 'Bon Appétit wishes you the Feichter family',
  };

  if (!dishes.length) return <div>Lädt Spezial-Menü …</div>;

  return (
    <PDFViewer width="100%" height="800">
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          {/* Linke Hälfte: Datum unten rechts */}
          <View style={styles.leftColumn}>
            <Text style={styles.dateText}>{dateString}</Text>
          </View>

          {/* Rechte Hälfte: Menü zentriert */}
          <View style={styles.rightColumn}>
            {/* Titel */}
            <Text style={styles.title}>{params.title}</Text>

            {/* Gerichte mit Trennern */}
            {dishes.map((d, i) => (
              <View key={d.id} style={{ width: '100%' }}>
                {params.langs.includes('de') && (
                  <Text style={styles.itemName}>
                    {d.name_de.replace(/<[^>]+>/g, '')}
                  </Text>
                )}
                {params.langs.includes('it') && (
                  <Text style={styles.itemName}>
                    {d.name_it.replace(/<[^>]+>/g, '')}
                  </Text>
                )}
                {params.langs.includes('en') && (
                  <Text style={styles.itemName}>
                    {d.name_en.replace(/<[^>]+>/g, '')}
                  </Text>
                )}

                {i < dishes.length - 1 && (
                  <View style={styles.separatorWrapper}>
                    <Text style={styles.separator}>*****</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Preis nach dem letzten Gericht */}
            {params.price && (
              <Text style={styles.price}>
                € {Number(params.price).toFixed(2)}
              </Text>
            )}

            {/* Schlussformel */}
            {params.langs.map(lang => (
              <Text key={lang} style={styles.footerText}>
                {footers[lang]}
              </Text>
            ))}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}
