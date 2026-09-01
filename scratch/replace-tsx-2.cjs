const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'pages', 'farmer', 'MarketIntelligencePage.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  '>MARKET PRESSURE<': '>{t("marketIntelligence.pressure")}<',
  '>Recent arrival quantity data is unavailable to assess pressure.<': '>{t("marketIntelligence.unavailablePressureDesc")}<',
  '>ARRIVALS TREND<': '>{t("marketIntelligence.arrivalsTrend")}<',
  '>Unavailable<': '>{t("marketIntelligence.unavailable")}<',
  '>UNAVAILABLE<': '>{t("marketIntelligence.UNAVAILABLE")}<',
  '>BUYER DEMAND<': '>{t("marketIntelligence.buyerDemand")}<',
  '>SELLING WINDOW<': '>{t("marketIntelligence.sellingWindow")}<',
  '>Market conditions are relatively stable. Monitor for future price momentum.<': '>{t("marketIntelligence.unavailableWindowDesc")}<',
  '>RECOMMENDED<': '>{t("marketIntelligence.recommended")}<',
  '>EXPECTED PRICE<': '>{t("marketIntelligence.expectedPrice")}<',
  '>NEARBY MARKETS<': '>{t("marketIntelligence.nearbyMarkets")}<',
  '>MODAL PRICE<': '>{t("marketIntelligence.modalPrice")}<',
  '>HIGHEST<': '>{t("marketIntelligence.highest")}<',
  '>PRICE TREND<': '>{t("marketIntelligence.priceTrend")}<',
  '>12 MONTHS<': '>{t("marketIntelligence.twelveMonths")}<',
  '>MARKET ARRIVALS<': '>{t("marketIntelligence.marketArrivals")}<',
  '>LATEST (': '>{t("marketIntelligence.latest")} (',
  'HISTORICAL • CURATED': '{t("marketIntelligence.historicalCurated")}',
  'HISTORICAL • AI CURATED': '{t("marketIntelligence.historicalCurated")}',
  '>DATA UNAVAILABLE<': '>{t("marketIntelligence.dataUnavailable")}<',
  '>No reliable arrival figure found for this market.<': '>{t("marketIntelligence.noArrivalFigure")}<',
  '>STRONG OPPORTUNITY<': '>{t("marketIntelligence.strongOpportunity")}<',
  '>GOOD OPPORTUNITY<': '>{t("marketIntelligence.goodOpportunity")}<',
  '>FAIR OPPORTUNITY<': '>{t("marketIntelligence.fairOpportunity")}<',
  '>ACTIVE<': '>{t("marketIntelligence.active")}<',
  '>DEMAND DATA UNAVAILABLE<': '>{t("marketIntelligence.demandDataUnavailable")}<',
  '>BEST BUYER MATCH<': '>{t("marketIntelligence.bestBuyerMatch")}<',
  '>MATCH DATA UNAVAILABLE<': '>{t("marketIntelligence.matchDataUnavailable")}<',
  '>QUALITY<': '>{t("marketIntelligence.quality")}<',
  '>YOUR LOT GRADE<': '>{t("marketIntelligence.yourLotGrade")}<',
  '>LOGISTICS<': '>{t("marketIntelligence.logistics")}<',
  '>STORAGE<': '>{t("marketIntelligence.storage")}<',
  '>INFORMATION UNAVAILABLE<': '>{t("marketIntelligence.informationUnavailable")}<',
  '>KRISHIMITRA\\\'S RECOMMENDATION<': '>{t("marketIntelligence.kmRecommendation")}<',
  '>KRISHIMITRA\'S RECOMMENDATION<': '>{t("marketIntelligence.kmRecommendation")}<',
  '>Consider selling within the next 3-5 days.<': '>{t("marketIntelligence.considerSelling")}<',
  '>WHY?<': '>{t("marketIntelligence.why")}<',
  '>Current price momentum and tighter arrivals indicate a relatively favorable near-term selling window.<': '>{t("marketIntelligence.reason1")}<',
  '>Highest reported regional price.<': '>{t("marketIntelligence.reason2")}<',
  '>ASK KRISHIMITRA<': '>{t("marketIntelligence.askKm")}<',
  '>FUTURE CAPABILITY<': '>{t("marketIntelligence.futureCapability")}<',
  '>VOICE ASSISTANT<': '>{t("marketIntelligence.voiceAssistant")}<',
  '>MARKET WATCH<': '>{t("marketIntelligence.marketWatch")}<',
  '>SET MARKET ALERT<': '>{t("marketIntelligence.setMarketAlert")}<',
  '>What does this mean?<': '>{t("marketIntelligence.whatDoesThisMean")}<',
  '>A simple explanation of the available market information.<': '>{t("marketIntelligence.simpleExplanation")}<',
  '>PRICES<': '>{t("marketIntelligence.prices")}<',
  '>Recent observed prices are moving upward.<': '>{t("marketIntelligence.pricesDesc")}<',
  '>ARRIVALS<': '>{t("marketIntelligence.arrivals")}<',
  '>Arrival information is available only for selected historical observations.<': '>{t("marketIntelligence.arrivalsDesc")}<',
  '>Recent market observations indicate tighter supply conditions.<': '>{t("marketIntelligence.marketPressureDesc")}<',
  '>Price momentum and supply conditions currently indicate a relatively favorable near-term selling environment.<': '>{t("marketIntelligence.sellingWindowDesc")}<',
  '>Only single historical observation available for this market<': '>{t("marketIntelligence.onlySingleHistorical")}<'
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

fs.writeFileSync(file, content);
console.log('TSX replacements 2 complete using split.join');
