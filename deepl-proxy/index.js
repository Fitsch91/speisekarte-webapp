// deepl-proxy/index.js
const express = require('express');
const cors = require('cors');
// benutze das globale fetch von Node 18+ ODER hole es default aus node-fetch
const fetch = require('node-fetch').default;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const DEEPL_KEY = process.env.DEEPL_API_KEY;
if (!DEEPL_KEY) {
  console.error('DEEPL_API_KEY fehlt in .env');
  process.exit(1);
}

const DEEPL_URL = 'https://api-free.deepl.com/v2/translate';

app.post('/translate', async (req, res) => {
  try {
    const { text, target_lang } = req.body;
    const deeplRes = await fetch(DEEPL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ text, target_lang }).toString(),
    });

    const data = await deeplRes.json();
    if (!deeplRes.ok) {
      console.error('🛑 DeepL antwortete mit Status', deeplRes.status, data);
      return res.status(502).json({ error: 'DeepL-Error', details: data });
    }

    res.json({ translation: data.translations[0].text });
  } catch (err) {
    console.error('🛑 Proxy-Fehler:', err);
    res.status(500).json({ error: 'Übersetzung fehlgeschlagen', message: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`DeepL-Proxy läuft auf http://localhost:${PORT}`);
});
