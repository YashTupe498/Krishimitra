const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'pages', 'farmer', 'MarketIntelligencePage.tsx');
let content = fs.readFileSync(file, 'utf8');

const dynamicInjection = `"LOW": t("marketIntelligence.lowPressure"),
      "Onion": t("marketIntelligence.onion"),
      "Pimpalgaon Baswant APMC": t("marketIntelligence.pimpalgaon"),
      "Lasalgaon(Vinchur) APMC": t("marketIntelligence.lasalgaon"),
      "Yeola APMC": t("marketIntelligence.yeola"),
      "Manmad APMC": t("marketIntelligence.manmad")`;

content = content.replace('"LOW": t("marketIntelligence.lowPressure")', dynamicInjection);
fs.writeFileSync(file, content);
console.log('Dynamic mapping extended');
