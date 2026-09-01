const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'pages', 'farmer', 'MarketIntelligencePage.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { match: /<span className="text-base font-bold text-gray-900">\{data\.crop\}<\/span>/g, replace: '<span className="text-base font-bold text-gray-900">{translateDynamic(data.crop)}</span>' },
  { match: /4\s*<br\/>MARKETS<\/span>/g, replace: '4\n                   <br/>{t("marketIntelligence.markets")}</span>' }, // wait, maybe just MARKETS
  { match: />MARKETS<\/span>/g, replace: '>{t("marketIntelligence.markets")}</span>' },
  { match: /\{translateDynamic\(oppScore\.status\)\} OPPORTUNITY/g, replace: '{translateDynamic(oppScore.status)} {t("marketIntelligence.opportunity")}' },
  { match: /<ShieldCheck size=\{12\}\/> QUALITY<\/h3>/g, replace: '<ShieldCheck size={12}/> {t("marketIntelligence.quality")}</h3>' },
  { match: /<Box size=\{12\}\/> STORAGE<\/h3>/g, replace: '<Box size={12}/> {t("marketIntelligence.storage")}</h3>' },
  { match: /<Target size=\{14\}\/> MARKET OPPORTUNITY<\/h3>/g, replace: '<Target size={14}/> {t("marketIntelligence.marketOpportunity")}</h3>' },
  { match: /<Star size=\{14\}\/> BEST BUYER MATCH<\/h3>/g, replace: '<Star size={14}/> {t("marketIntelligence.bestBuyerMatch")}</h3>' },
  { match: /<MessageSquare size=\{14\}\/> ASK KRISHIMITRA<\/h3>/g, replace: '<MessageSquare size={14}/> {t("marketIntelligence.askKm")}</h3>' },
  { match: /<Bell size=\{14\}\/> MARKET WATCH<\/h3>/g, replace: '<Bell size={14}/> {t("marketIntelligence.marketWatch")}</h3>' },
  { match: /<Lightbulb size=\{14\}\/> KRISHIMITRA'S RECOMMENDATION/g, replace: '<Lightbulb size={14}/> {t("marketIntelligence.kmRecommendation")}' },
  { match: /Consider selling within the next 3-5 days./g, replace: '{t("marketIntelligence.considerSelling")}' },
  { match: /\{m\.market_name\}/g, replace: '{translateDynamic(m.market_name)}' },
  { match: /market_name: d\.market/g, replace: 'market_name: translateDynamic(d.market)' }
];

for (const {match, replace} of replacements) {
  content = content.replace(match, replace);
}

fs.writeFileSync(file, content);
console.log('TSX string sweep complete');
