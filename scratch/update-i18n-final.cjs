const fs = require('fs');
const path = require('path');
const i18nDir = path.join(__dirname, '..', 'src', 'i18n');

const newTrans = {
  en: {
    markets: "MARKETS",
    opportunity: "OPPORTUNITY",
    onion: "Onion",
    pimpalgaon: "Pimpalgaon Baswant APMC",
    lasalgaon: "Lasalgaon(Vinchur) APMC",
    yeola: "Yeola APMC",
    manmad: "Manmad APMC"
  },
  hi: {
    markets: "बाजार",
    opportunity: "अवसर",
    onion: "प्याज",
    pimpalgaon: "पिंपलगांव बसवंत APMC",
    lasalgaon: "लासलगांव (विंचुर) APMC",
    yeola: "येओला APMC",
    manmad: "मनमाड APMC"
  },
  mr: {
    markets: "बाजार",
    opportunity: "संधी",
    onion: "कांदा",
    pimpalgaon: "पिंपळगाव बसवंत APMC",
    lasalgaon: "लासलगाव (विंचुर) APMC",
    yeola: "येवला APMC",
    manmad: "मनमाड APMC"
  }
};

['en', 'hi', 'mr'].forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  Object.assign(data.marketIntelligence, newTrans[lang]);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json with market final strings`);
});
