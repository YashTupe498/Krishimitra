const fs = require('fs');

const en = require('./src/i18n/en.json');
const hi = require('./src/i18n/hi.json');
const mr = require('./src/i18n/mr.json');

const newTranslations = {
  en: {
    greetingSub: "Here's what matters for your produce today.",
    voiceAssistantHover: "Ask in English, हिंदी or मराठी",
    whyNotHighestPriceTitle: "🤔 WHY NOT THE HIGHEST PRICE?",
    institutionalBuyer: "Institutional Buyer",
    headlineValue: "Headline Value",
    yourRequirement: "Your requirement",
    notFeasibleResult: "Not feasible for your needs",
    compareOptions: "Compare Options",
    marketPressureTitle: "📊 MARKET PRESSURE + SALE WINDOW",
    marketPressureLabel: "MARKET PRESSURE",
    pressureLevel: { MODERATE: "MODERATE", LOW: "LOW", HIGH: "HIGH" },
    arrivalsLabel: "Arrivals",
    arrivalsValue: "Lower than recent average",
    priceTrendLabel: "Price trend",
    priceTrendValue: "Slight upward movement",
    saleWindowLabel: "SALE WINDOW",
    saleWindowStatus: "Current selling window looks favorable",
    saleWindowRecommendation: "Consider selling in the near term",
    viewMarketAnalysis: "VIEW MARKET ANALYSIS",
    viewAllLots: "[ VIEW ALL LOTS ]"
  },
  hi: {
    greetingSub: "आज आपकी उपज के लिए यह महत्वपूर्ण है।",
    voiceAssistantHover: "English, हिंदी या मराठी में पूछें",
    whyNotHighestPriceTitle: "🤔 उच्चतम मूल्य क्यों नहीं?",
    institutionalBuyer: "संस्थागत खरीदार",
    headlineValue: "हेडलाइन मूल्य",
    yourRequirement: "आपकी आवश्यकता",
    notFeasibleResult: "आपकी आवश्यकताओं के लिए संभव नहीं",
    compareOptions: "विकल्पों की तुलना करें",
    marketPressureTitle: "📊 बाज़ार का दबाव + बिक्री का समय",
    marketPressureLabel: "बाज़ार का दबाव",
    pressureLevel: { MODERATE: "मध्यम", LOW: "कम", HIGH: "अधिक" },
    arrivalsLabel: "आवक",
    arrivalsValue: "हाल के औसत से कम",
    priceTrendLabel: "मूल्य प्रवृत्ति",
    priceTrendValue: "मामूली ऊपर की ओर",
    saleWindowLabel: "बिक्री का समय",
    saleWindowStatus: "वर्तमान बिक्री का समय अनुकूल है",
    saleWindowRecommendation: "निकट भविष्य में बेचने पर विचार करें",
    viewMarketAnalysis: "बाज़ार विश्लेषण देखें",
    viewAllLots: "[ सभी लॉट देखें ]"
  },
  mr: {
    greetingSub: "आज तुमच्या शेतमालासाठी हे महत्त्वाचे आहे.",
    voiceAssistantHover: "English, हिंदी किंवा मराठीत विचारा",
    whyNotHighestPriceTitle: "🤔 सर्वोच्च किंमत का नाही?",
    institutionalBuyer: "संस्थात्मक खरेदीदार",
    headlineValue: "हेडलाइन मूल्य",
    yourRequirement: "तुमची आवश्यकता",
    notFeasibleResult: "तुमच्या गरजांसाठी शक्य नाही",
    compareOptions: "पर्यायांची तुलना करा",
    marketPressureTitle: "📊 बाजाराचा दबाव + विक्रीची वेळ",
    marketPressureLabel: "बाजाराचा दबाव",
    pressureLevel: { MODERATE: "मध्यम", LOW: "कमी", HIGH: "जास्त" },
    arrivalsLabel: "आवक",
    arrivalsValue: "अलीकडील सरासरीपेक्षा कमी",
    priceTrendLabel: "किंमत कल",
    priceTrendValue: "किंचित वरच्या दिशेने",
    saleWindowLabel: "विक्रीची वेळ",
    saleWindowStatus: "सध्याची विक्रीची वेळ अनुकूल दिसत आहे",
    saleWindowRecommendation: "लवकरच विकण्याचा विचार करा",
    viewMarketAnalysis: "बाजार विश्लेषण पहा",
    viewAllLots: "[ सर्व लॉट पहा ]"
  }
};

en.dashboard = { ...en.dashboard, ...newTranslations.en };
hi.dashboard = { ...hi.dashboard, ...newTranslations.hi };
mr.dashboard = { ...mr.dashboard, ...newTranslations.mr };

fs.writeFileSync('./src/i18n/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('./src/i18n/hi.json', JSON.stringify(hi, null, 2));
fs.writeFileSync('./src/i18n/mr.json', JSON.stringify(mr, null, 2));

console.log("Dashboard Translations updated!");
