const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'pages', 'farmer', 'MarketIntelligencePage.tsx');
let content = fs.readFileSync(file, 'utf8');

const dict = {
  'MARKET PRESSURE': '{t("marketIntelligence.pressure")}',
  '>HIGH<': '>{t("marketIntelligence.highPressure")}<', // Let's add highPressure to JSON
  '>Recent arrival quantity data is unavailable to assess pressure.<': '>{t("marketIntelligence.unavailablePressureDesc")}<',
  '>UNAVAILABLE<': '>{t("marketIntelligence.UNAVAILABLE")}<',
  '>Market conditions are relatively stable. Monitor for future price momentum.<': '>{t("marketIntelligence.unavailableWindowDesc")}<',
  '>12 MONTHS<': '>{t("marketIntelligence.twelveMonths")}<',
  '12 MONTHS</option>': '{t("marketIntelligence.twelveMonths")}</option>',
  '>Only single historical observation available for this market<': '>{t("marketIntelligence.onlySingleHistorical")}<',
  'HISTORICAL • {arrivalData.sourceType}': '{t("marketIntelligence.historicalCurated")}',
  'STRONG OPPORTUNITY': '{t("marketIntelligence.strongOpportunity")}',
  '>Highest reported regional price<': '>{t("marketIntelligence.reason2")}<',
  '>0 ACTIVE<': '>0 {t("marketIntelligence.active")}<',
  '>Grade A<': '>{t("marketIntelligence.grade")}<',
  '>Consider selling within the next 3-5 days.<': '>{t("marketIntelligence.considerSelling")}<',
  ' VOICE ASSISTANT<': ' {t("marketIntelligence.voiceAssistant")}<',
  '>VOICE ASSISTANT<': '>{t("marketIntelligence.voiceAssistant")}<',
  'SET MARKET ALERT': '{t("marketIntelligence.setMarketAlert")}'
};

for (const [key, value] of Object.entries(dict)) {
  content = content.replace(new RegExp(key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), value);
}

fs.writeFileSync(file, content);
console.log('Final TSX replacements done.');
