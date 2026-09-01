const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'i18n');

const pressureTranslations = {
  en: { highPressure: "HIGH" },
  hi: { highPressure: "उच्च" },
  mr: { highPressure: "उच्च" }
};

['en', 'hi', 'mr'].forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  Object.assign(data.marketIntelligence, pressureTranslations[lang]);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json with highPressure`);
});
