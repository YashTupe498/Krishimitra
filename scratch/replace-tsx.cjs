const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'pages', 'farmer', 'MarketIntelligencePage.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  '>Market Intelligence<': '>{t("marketIntelligence.title")}<',
  '>Understand the market and make the best decision for your produce.<': '>{t("marketIntelligence.subtitle")}<',
  'Last updated: ': '{t("marketIntelligence.lastUpdated")} ',
  '>DATA IS CURRENT<': '>{t("marketIntelligence.dataCurrent")}<',
  ' Refresh': ' {t("marketIntelligence.refresh")}',
  '>GRADE A<': '>{t("marketIntelligence.grade")}<',
  '>QUANTITY<': '>{t("marketIntelligence.quantity")}<',
  '>AVAILABILITY<': '>{t("marketIntelligence.availability")}<',
  '>Immediate<': '>{t("marketIntelligence.immediate")}<',
  '>Market Data Current<': '>{t("marketIntelligence.marketDataCurrent")}<',
  '>Latest observation<': '>{t("marketIntelligence.latestObservation")}<',
  '>CURRENT MODAL PRICE<': '>{t("marketIntelligence.currentModalPrice")}<',
  '>Prices moving upward<': '>{t("marketIntelligence.pricesMovingUpward")}<',
  '>LOW: ': '>{t("marketIntelligence.low")} ',
  '>HIGH: ': '>{t("marketIntelligence.high")} ',
  '/> MARKET SNAPSHOT</h3>': '/> {t("marketIntelligence.marketSnapshot")}</h3>',
  '<br/>COMPARED</span>': '<br/>{t("marketIntelligence.compared")}</span>',
  '>HIGHEST NEARBY<': '>{t("marketIntelligence.highestNearby")}<',
  '>LATEST OBSERVATION<': '>{t("marketIntelligence.latestObservation")}<',
  '>PRICE TRENDS (30 DAYS)<': '>{t("marketIntelligence.priceTrends")}<',
  '>Timeframe<': '>{t("marketIntelligence.timeframe")}<',
  '>MARKET COMPARISON<': '>{t("marketIntelligence.marketComparison")}<',
  '>Compare modal prices across nearby APMC markets<': '>{t("marketIntelligence.compareDesc")}<',
  '>Distance<': '>{t("marketIntelligence.distance")}<',
  '>Demand<': '>{t("marketIntelligence.demand")}<',
  '>MARKET OPPORTUNITY<': '>{t("marketIntelligence.marketOpportunity")}<',
  '>Opportunity Score<': '>{t("marketIntelligence.opportunityScore")}<',
  '>Higher score means better selling conditions<': '>{t("marketIntelligence.higherScoreMeans")}<',
  '>Price Premium<': '>{t("marketIntelligence.pricePremium")}<',
  '>Logistics Cost<': '>{t("marketIntelligence.logisticsCost")}<',
  '>Net Benefit<': '>{t("marketIntelligence.netBenefit")}<',
  '>SELLING RECOMMENDATION<': '>{t("marketIntelligence.sellingRecommendation")}<',
  '>Best window:<': '>{t("marketIntelligence.bestWindow")}<',
  '>AI INSIGHTS & NEGOTIATION TIPS<': '>{t("marketIntelligence.aiInsights")}<',
  '>Lasalgaon is offering the highest premium for your onion grade.<': '>{t("marketIntelligence.insight1")}<',
  '>Ensure quality sorting before transit to maximize grade-A rates.<': '>{t("marketIntelligence.insight2")}<'
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.replace(new RegExp(key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), value);
}

fs.writeFileSync(file, content);
console.log('TSX replacements complete.');
