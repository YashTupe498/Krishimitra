const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '..', 'src', 'i18n');
const pagePath = path.join(__dirname, '..', 'src', 'pages', 'farmer', 'MarketIntelligencePage.tsx');

const translations = {
  en: {
    marketIntelligence: {
      title: "Market Intelligence",
      subtitle: "Understand the market and make the best decision for your produce.",
      lastUpdated: "Last updated:",
      dataCurrent: "DATA IS CURRENT",
      refresh: "Refresh",
      grade: "GRADE A",
      quantity: "QUANTITY",
      availability: "AVAILABILITY",
      immediate: "Immediate",
      marketDataCurrent: "Market Data Current",
      latestObservation: "Latest observation",
      currentModalPrice: "CURRENT MODAL PRICE",
      pricesMovingUpward: "Prices moving upward",
      low: "LOW:",
      high: "HIGH:",
      marketSnapshot: "MARKET SNAPSHOT",
      compared: "COMPARED",
      highestNearby: "HIGHEST NEARBY",
      priceTrends: "PRICE TRENDS (30 DAYS)",
      timeframe: "Timeframe",
      marketComparison: "MARKET COMPARISON",
      compareDesc: "Compare modal prices across nearby APMC markets",
      distance: "Distance:",
      demand: "Demand:",
      marketOpportunity: "MARKET OPPORTUNITY",
      opportunityScore: "Opportunity Score",
      higherScoreMeans: "Higher score means better selling conditions",
      pricePremium: "Price Premium",
      logisticsCost: "Logistics Cost",
      netBenefit: "Net Benefit",
      sellingRecommendation: "SELLING RECOMMENDATION",
      bestWindow: "Best window:",
      aiInsights: "AI INSIGHTS & NEGOTIATION TIPS",
      insight1: "Lasalgaon is offering the highest premium for your onion grade.",
      insight2: "Ensure quality sorting before transit to maximize grade-A rates."
    }
  },
  hi: {
    marketIntelligence: {
      title: "बाजार की जानकारी",
      subtitle: "बाजार को समझें और अपनी उपज के लिए सबसे अच्छा निर्णय लें।",
      lastUpdated: "अंतिम अद्यतन:",
      dataCurrent: "डेटा अद्यतन है",
      refresh: "रिफ्रेश",
      grade: "ग्रेड A",
      quantity: "मात्रा",
      availability: "उपलब्धता",
      immediate: "तुरंत",
      marketDataCurrent: "बाजार का डेटा अद्यतन है",
      latestObservation: "नवीनतम अवलोकन",
      currentModalPrice: "वर्तमान मॉडल मूल्य",
      pricesMovingUpward: "कीमतें ऊपर की ओर जा रही हैं",
      low: "न्यूनतम:",
      high: "अधिकतम:",
      marketSnapshot: "बाजार की स्थिति",
      compared: "तुलना की गई",
      highestNearby: "आसपास सबसे अधिक",
      priceTrends: "मूल्य रुझान (30 दिन)",
      timeframe: "समय सीमा",
      marketComparison: "बाजार की तुलना",
      compareDesc: "आसपास के APMC बाजारों में मॉडल कीमतों की तुलना करें",
      distance: "दूरी:",
      demand: "मांग:",
      marketOpportunity: "बाजार के अवसर",
      opportunityScore: "अवसर स्कोर",
      higherScoreMeans: "उच्च स्कोर का अर्थ है बेचने की बेहतर स्थिति",
      pricePremium: "मूल्य प्रीमियम",
      logisticsCost: "लॉजिस्टिक्स लागत",
      netBenefit: "शुद्ध लाभ",
      sellingRecommendation: "बिक्री की सिफारिश",
      bestWindow: "सबसे अच्छा समय:",
      aiInsights: "AI इनसाइट्स और बातचीत के सुझाव",
      insight1: "लासलगांव आपके प्याज के ग्रेड के लिए सबसे अधिक प्रीमियम दे रहा है।",
      insight2: "ग्रेड-ए दरों को अधिकतम करने के लिए पारगमन से पहले गुणवत्ता छंटाई सुनिश्चित करें।"
    }
  },
  mr: {
    marketIntelligence: {
      title: "बाजार बुद्धिमत्ता",
      subtitle: "बाजार समजून घ्या आणि तुमच्या उत्पादनासाठी सर्वोत्तम निर्णय घ्या.",
      lastUpdated: "शेवटचे अपडेट:",
      dataCurrent: "डेटा अद्ययावत आहे",
      refresh: "रिफ्रेश",
      grade: "ग्रेड A",
      quantity: "प्रमाण",
      availability: "उपलब्धता",
      immediate: "त्वरित",
      marketDataCurrent: "बाजार डेटा अद्ययावत आहे",
      latestObservation: "नवीनतम निरीक्षण",
      currentModalPrice: "सध्याचे मॉडेल मूल्य",
      pricesMovingUpward: "किमती वरच्या दिशेने जात आहेत",
      low: "किमान:",
      high: "कमाल:",
      marketSnapshot: "बाजार स्थिती",
      compared: "तुलना केली",
      highestNearby: "जवळपास सर्वात जास्त",
      priceTrends: "किमतीचा कल (30 दिवस)",
      timeframe: "वेळमर्यादा",
      marketComparison: "बाजार तुलना",
      compareDesc: "जवळपासच्या APMC बाजारांमधील मॉडेल किमतींची तुलना करा",
      distance: "अंतर:",
      demand: "मागणी:",
      marketOpportunity: "बाजार संधी",
      opportunityScore: "संधी स्कोअर",
      higherScoreMeans: "उच्च स्कोअर म्हणजे विक्रीची चांगली स्थिती",
      pricePremium: "किंमत प्रीमियम",
      logisticsCost: "लॉजिस्टिक्स खर्च",
      netBenefit: "निव्वळ नफा",
      sellingRecommendation: "विक्रीची शिफारस",
      bestWindow: "सर्वात्तम वेळ:",
      aiInsights: "AI इनसाइट्स आणि वाटाघाटी टिपा",
      insight1: "लासलगाव तुमच्या कांद्याच्या ग्रेडसाठी सर्वाधिक प्रीमियम देत आहे.",
      insight2: "ग्रेड-ए दर वाढवण्यासाठी वाहतुकीपूर्वी गुणवत्ता वर्गीकरण सुनिश्चित करा."
    }
  }
};

// Update JSON files
['en', 'hi', 'mr'].forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  data.marketIntelligence = translations[lang].marketIntelligence;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json`);
});

// We will update the TSX file separately in the next step to ensure it is accurate.
