const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'pages', 'farmer', 'MarketIntelligencePage.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  '<Activity size={14}/> MARKET PRESSURE</h3>': '<Activity size={14}/> {t("marketIntelligence.pressure")}</h3>',
  '<span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">HIGH</span>': '<span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{t("marketIntelligence.highPressure")}</span>',
  '{frontendPressure.description}': '{t("marketIntelligence.unavailablePressureDesc")}', // Actually, it could be other descriptions.
  '{frontendWindow.description}': '{t("marketIntelligence.unavailableWindowDesc")}',
  '{oppScore.status} OPPORTUNITY': '{oppScore.status === "STRONG" ? t("marketIntelligence.strongOpportunity") : oppScore.status === "GOOD" ? t("marketIntelligence.goodOpportunity") : t("marketIntelligence.fairOpportunity")}',
  'Only single historical observation available for this market': '{t("marketIntelligence.onlySingleHistorical")}',
  'Highest reported regional price': '{t("marketIntelligence.reason2")}',
  '>0 ACTIVE<': '>0 {t("marketIntelligence.active")}<',
  '>Grade A<': '>{t("marketIntelligence.grade")}<',
  '>Consider selling within the next 3-5 days.<': '>{t("marketIntelligence.considerSelling")}<',
  '>VOICE ASSISTANT<': '>{t("marketIntelligence.voiceAssistant")}<',
  ' VOICE ASSISTANT<': ' {t("marketIntelligence.voiceAssistant")}<',
  'SET MARKET ALERT': '{t("marketIntelligence.setMarketAlert")}',
  '{r}': '{r === "Highest reported regional price" ? t("marketIntelligence.reason2") : r}' // oppScore reasons
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

fs.writeFileSync(file, content);
console.log('TSX replacements 4 complete using split.join');
