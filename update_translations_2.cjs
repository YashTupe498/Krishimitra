const fs = require('fs');

const en = require('./src/i18n/en.json');
const hi = require('./src/i18n/hi.json');
const mr = require('./src/i18n/mr.json');

const newTranslations = {
  en: {
    headerTag: "Active Decision",
    title: "Where should you sell?",
    subtitle: "Compare the likely outcome, costs and constraints before deciding.",
    recommendedContext: "Best feasible option for your current lot.",
    benefit1: "Fits payment requirements",
    benefit2: "Lower transport burden",
    calculationTitle: "How this estimate is calculated",
    grossSaleValue: "Gross Sale Value",
    grossSaleContext: "Applicable opportunity value",
    qualityAdjustment: "Quality",
    noAdjustment: "No demo adjustment",
    paymentRequirementTitle: "Your Payment Requirement",
    paymentRequirement: "Within 7 days",
    recommendedOpportunity: "Opportunity payment:",
    paymentDays5: "5 days",
    fitsRequirement: "Fits your requirement",
    alternativeOpportunity: "Alternative (Highest price):",
    paymentDays14: "7-14 days",
    violatesRequirement: "May not fit requirement",
    whyNotHighestTitle: "Why not the highest headline price?",
    alternativeHeadline: "Alternative opportunity headline value:",
    conTransport: "Higher transport cost to distant market",
    conPayment: "Longer payment period (violates constraints)",
    notRecommended: "Not recommended for this lot.",
    decisionBasis: "Decision Basis",
    basisMarket: "Market info: Demo",
    basisTerms: "Opportunity terms: Demo data",
    basisQuality: "Quality: Grade B",
    basisTransport: "Transport: Estimated",
    contactBuyer: "Contact Buyer",
    acceptProceed: "Accept & Proceed"
  },
  hi: {
    headerTag: "सक्रिय निर्णय",
    title: "आपको कहाँ बेचना चाहिए?",
    subtitle: "निर्णय लेने से पहले संभावित परिणाम, लागत और बाधाओं की तुलना करें।",
    recommendedContext: "आपके वर्तमान लॉट के लिए सबसे उपयुक्त विकल्प।",
    benefit1: "भुगतान आवश्यकताओं के अनुकूल",
    benefit2: "कम परिवहन बोझ",
    calculationTitle: "इस अनुमान की गणना कैसे की गई है",
    grossSaleValue: "सकल बिक्री मूल्य",
    grossSaleContext: "लागू अवसर मूल्य",
    qualityAdjustment: "गुणवत्ता (Quality)",
    noAdjustment: "कोई डेमो समायोजन नहीं",
    paymentRequirementTitle: "आपकी भुगतान आवश्यकता",
    paymentRequirement: "7 दिनों के भीतर",
    recommendedOpportunity: "अवसर भुगतान:",
    paymentDays5: "5 दिन",
    fitsRequirement: "आपकी आवश्यकता के अनुरूप",
    alternativeOpportunity: "वैकल्पिक (उच्चतम मूल्य):",
    paymentDays14: "7-14 दिन",
    violatesRequirement: "शायद आवश्यकता के अनुरूप न हो",
    whyNotHighestTitle: "उच्चतम हेडलाइन मूल्य क्यों नहीं?",
    alternativeHeadline: "वैकल्पिक अवसर का हेडलाइन मूल्य:",
    conTransport: "दूरस्थ बाज़ार के लिए उच्च परिवहन लागत",
    conPayment: "लंबी भुगतान अवधि (बाधाओं का उल्लंघन)",
    notRecommended: "इस लॉट के लिए अनुशंसित नहीं है।",
    decisionBasis: "निर्णय का आधार",
    basisMarket: "बाज़ार की जानकारी: डेमो",
    basisTerms: "अवसर की शर्तें: डेमो डेटा",
    basisQuality: "गुणवत्ता: ग्रेड B",
    basisTransport: "परिवहन: अनुमानित",
    contactBuyer: "खरीदार से संपर्क करें",
    acceptProceed: "स्वीकार करें और आगे बढ़ें"
  },
  mr: {
    headerTag: "सक्रिय निर्णय",
    title: "तुम्ही कुठे विकायला हवे?",
    subtitle: "निर्णय घेण्यापूर्वी संभाव्य परिणाम, खर्च आणि मर्यादांची तुलना करा.",
    recommendedContext: "तुमच्या सध्याच्या लॉटसाठी सर्वात योग्य पर्याय.",
    benefit1: "पेमेंटच्या आवश्यकतांशी सुसंगत",
    benefit2: "कमी वाहतुकीचा भार",
    calculationTitle: "हा अंदाज कसा काढला आहे",
    grossSaleValue: "एकूण विक्री मूल्य",
    grossSaleContext: "लागू संधी मूल्य",
    qualityAdjustment: "गुणवत्ता (Quality)",
    noAdjustment: "कोणतेही डेमो ऍडजस्टमेंट नाही",
    paymentRequirementTitle: "तुमची पेमेंट आवश्यकता",
    paymentRequirement: "७ दिवसांच्या आत",
    recommendedOpportunity: "संधीचे पेमेंट:",
    paymentDays5: "५ दिवस",
    fitsRequirement: "तुमच्या आवश्यकतेनुसार",
    alternativeOpportunity: "पर्यायी (सर्वोच्च किंमत):",
    paymentDays14: "७-१४ दिवस",
    violatesRequirement: "आवश्यकतेनुसार नसू शकते",
    whyNotHighestTitle: "सर्वोच्च हेडलाइन किंमत का नाही?",
    alternativeHeadline: "पर्यायी संधीचे हेडलाइन मूल्य:",
    conTransport: "दूरच्या बाजारासाठी जास्त वाहतूक खर्च",
    conPayment: "अधिक पेमेंट कालावधी (मर्यादांचे उल्लंघन)",
    notRecommended: "या लॉटसाठी शिफारस केलेली नाही.",
    decisionBasis: "निर्णयाचा आधार",
    basisMarket: "बाजाराची माहिती: डेमो",
    basisTerms: "संधीच्या अटी: डेमो डेटा",
    basisQuality: "गुणवत्ता: ग्रेड B",
    basisTransport: "वाहतूक: अंदाजित",
    contactBuyer: "खरेदीदाराशी संपर्क साधा",
    acceptProceed: "स्वीकारा आणि पुढे जा"
  }
};

en.decisions = { ...en.decisions, ...newTranslations.en };
hi.decisions = { ...hi.decisions, ...newTranslations.hi };
mr.decisions = { ...mr.decisions, ...newTranslations.mr };

fs.writeFileSync('./src/i18n/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('./src/i18n/hi.json', JSON.stringify(hi, null, 2));
fs.writeFileSync('./src/i18n/mr.json', JSON.stringify(mr, null, 2));

console.log("Translations updated!");
