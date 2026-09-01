const fs = require('fs');
const path = require('path');
const i18nDir = path.join(__dirname, '..', 'src', 'i18n');

const newKeys = {
  en: { allCommoditiesNote: "Showing market-wide arrivals across all commodities (not onion-specific)." },
  hi: { allCommoditiesNote: "सभी वस्तुओं (केवल प्याज नहीं) के बाजार-व्यापी आगमन दिखा रहे हैं।" },
  mr: { allCommoditiesNote: "सर्व वस्तूंमधील (केवळ कांदा नव्हे) बाजारव्यापी आवक दाखवत आहे." }
};

['en', 'hi', 'mr'].forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  Object.assign(data.marketIntelligence, newKeys[lang]);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json`);
});
