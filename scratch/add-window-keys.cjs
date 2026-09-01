const fs = require('fs');
const path = require('path');
const i18nDir = path.join(__dirname, '..', 'src', 'i18n');

const newKeys = {
  en: { favorable: "FAVORABLE", caution: "CAUTION", days: "days", confidence: "CONFIDENCE", medium: "MEDIUM" },
  hi: { favorable: "अनुकूल", caution: "सावधानी", days: "दिन", confidence: "विश्वसनीयता", medium: "मध्यम" },
  mr: { favorable: "अनुकूल", caution: "सावधगिरी", days: "दिवस", confidence: "विश्वासार्हता", medium: "मध्यम" }
};

['en', 'hi', 'mr'].forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  Object.assign(data.marketIntelligence, newKeys[lang]);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json`);
});
