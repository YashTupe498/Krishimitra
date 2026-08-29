const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n');
const langs = ['en', 'hi', 'mr'];

const newKeys = {
  lotDetails: {
    backLink: { en: 'Back to My Lots', hi: 'मेरे लॉट पर वापस जाएं', mr: 'माझ्या लॉटवर परत जा' },
    title: { en: 'LOT DETAILS', hi: 'लॉट विवरण', mr: 'लॉट तपशील' },
    pendingQuality: { en: 'Quality Pending', hi: 'गुणवत्ता लंबित', mr: 'गुणवत्ता प्रलंबित' },
    statusTimeline: { en: 'STATUS TIMELINE', hi: 'स्थिति टाइमलाइन', mr: 'स्थिती टाइमलाइन' },
    qualityAssessment: { en: 'QUALITY ASSESSMENT', hi: 'गुणवत्ता मूल्यांकन', mr: 'गुणवत्ता मूल्यांकन' },
    currentGrade: { en: 'Current Grade', hi: 'वर्तमान ग्रेड', mr: 'सध्याचा ग्रेड' },
    notAssessed: { en: 'Not Assessed', hi: 'मूल्यांकन नहीं किया गया', mr: 'मूल्यांकन केले नाही' },
    reassessQuality: { en: 'View Quality Assessment', hi: 'गुणवत्ता मूल्यांकन देखें', mr: 'गुणवत्ता मूल्यांकन पहा' },
    startQuality: { en: 'Start Quality Assessment', hi: 'गुणवत्ता मूल्यांकन शुरू करें', mr: 'गुणवत्ता मूल्यांकन सुरू करा' },
    marketAnalysis: { en: 'MARKET ANALYSIS', hi: 'बाजार विश्लेषण', mr: 'बाजार विश्लेषण' },
    status: { en: 'Status', hi: 'स्थिति', mr: 'स्थिती' },
    marketAnalysisReady: { en: 'Market Analysis Ready', hi: 'बाजार विश्लेषण तैयार', mr: 'बाजार विश्लेषण तयार' },
    marketPressure: { en: 'Market pressure', hi: 'बाजार का दबाव', mr: 'बाजाराचा दबाव' },
    bestHeadline: { en: 'Best headline price', hi: 'सर्वश्रेष्ठ मुख्य मूल्य', mr: 'सर्वोत्तम मुख्य किंमत' },
    bestNetOption: { en: 'Best net option', hi: 'सर्वश्रेष्ठ शुद्ध विकल्प', mr: 'सर्वोत्तम निव्वळ पर्याय' },
    viewMarketAnalysis: { en: 'View Market Analysis', hi: 'बाजार विश्लेषण देखें', mr: 'बाजार विश्लेषण पहा' },
    completeQualityFirst: { en: 'Complete quality assessment to unlock market analysis.', hi: 'बाजार विश्लेषण अनलॉक करने के लिए गुणवत्ता मूल्यांकन पूरा करें।', mr: 'बाजार विश्लेषण अनलॉक करण्यासाठी गुणवत्ता मूल्यांकन पूर्ण करा.' },
    decision: { en: 'RECOMMENDED ACTION', hi: 'अनुशंसित कार्रवाई', mr: 'शिफारस केलेली कारवाई' },
    sellThrough: { en: 'Sell through', hi: 'इसके माध्यम से बेचें', mr: 'येथे विका' },
    estimatedNet: { en: 'Estimated Net Realization', hi: 'अनुमानित शुद्ध प्राप्ति', mr: 'अंदाजित निव्वळ प्राप्ती' },
    viewFullDecision: { en: 'View Full Decision', hi: 'पूरा निर्णय देखें', mr: 'पूर्ण निर्णय पहा' },
    sellingRequirements: { en: 'YOUR SELLING REQUIREMENTS', hi: 'आपकी बिक्री आवश्यकताएँ', mr: 'तुमच्या विक्रीच्या आवश्यकता' },
    payment: { en: 'Payment', hi: 'भुगतान', mr: 'पेमेंट' },
    transport: { en: 'Transport', hi: 'परिवहन', mr: 'वाहतूक' },
    storage: { en: 'Storage', hi: 'भंडारण', mr: 'स्टोरेज' },
    offers: { en: 'OFFERS', hi: 'प्रस्ताव', mr: 'ऑफर' },
    noOffers: { en: 'No offers yet. Your lot is available for matching opportunities.', hi: 'अभी तक कोई प्रस्ताव नहीं। आपका लॉट मिलान के लिए उपलब्ध है।', mr: 'अद्याप कोणत्याही ऑफर नाहीत. तुमचा लॉट जुळणाऱ्या संधींसाठी उपलब्ध आहे.' },
    transaction: { en: 'TRANSACTION', hi: 'लेनदेन', mr: 'व्यवहार' },
    noTransaction: { en: 'No transaction yet', hi: 'अभी तक कोई लेनदेन नहीं', mr: 'अद्याप कोणताही व्यवहार नाही' }
  },
  lots: {
    createNew: { en: 'CREATE NEW LOT', hi: 'नया लॉट बनाएं', mr: 'नवीन लॉट तयार करा' }
  },
  quality: {
    headerTag: { en: 'Quality Assessment', hi: 'गुणवत्ता मूल्यांकन', mr: 'गुणवत्ता मूल्यांकन' },
    title: { en: 'ASSESS QUALITY', hi: 'गुणवत्ता का आकलन करें', mr: 'गुणवत्तेचे मूल्यांकन करा' },
    current: { en: 'Current:', hi: 'वर्तमान:', mr: 'सध्याचे:' },
    notAssessed: { en: 'Not Assessed', hi: 'मूल्यांकन नहीं', mr: 'मूल्यांकन नाही' },
    howToAssess: { en: 'How would you like to assess quality?', hi: 'आप गुणवत्ता का आकलन कैसे करना चाहेंगे?', mr: 'तुम्ही गुणवत्तेचे मूल्यांकन कसे करू इच्छिता?' },
    howToAssessSub: { en: 'Choose manual selection or upload images for prototype reference assessment.', hi: 'मैनुअल चयन चुनें या प्रोटोटाइप संदर्भ के लिए चित्र अपलोड करें।', mr: 'मॅन्युअल निवड निवडा किंवा प्रोटोटाइप संदर्भासाठी प्रतिमा अपलोड करा.' },
    uploadImages: { en: 'Upload Produce Images', hi: 'उत्पाद की छवियां अपलोड करें', mr: 'उत्पादनाच्या प्रतिमा अपलोड करा' },
    uploadDesc: { en: 'Use reference-based prototype assessment', hi: 'संदर्भ-आधारित प्रोटोटाइप मूल्यांकन का उपयोग करें', mr: 'संदर्भ-आधारित प्रोटोटाइप मूल्यांकन वापरा' },
    selectManual: { en: 'Select Grade Manually', hi: 'मैन्युअल रूप से ग्रेड चुनें', mr: 'मॅन्युअली ग्रेड निवडा' },
    understandGrades: { en: 'UNDERSTAND THE GRADES', hi: 'ग्रेड को समझें', mr: 'ग्रेड समजून घ्या' },
    uploadProduceImages: { en: 'UPLOAD PRODUCE IMAGES', hi: 'उत्पाद की छवियां अपलोड करें', mr: 'उत्पादनाच्या प्रतिमा अपलोड करा' },
    photoNum: { en: 'PRODUCE PHOTO', hi: 'उत्पाद की तस्वीर', mr: 'उत्पादनाचा फोटो' },
    addPhoto: { en: '+ Add Photo', hi: '+ तस्वीर जोड़ें', mr: '+ फोटो जोडा' },
    assessProduce: { en: 'Assess Produce', hi: 'उत्पाद का आकलन करें', mr: 'उत्पादनाचे मूल्यांकन करा' },
    assessmentComplete: { en: 'Assessment Complete', hi: 'मूल्यांकन पूर्ण', mr: 'मूल्यांकन पूर्ण' },
    whyThisGrade: { en: 'WHY THIS GRADE?', hi: 'यह ग्रेड क्यों?', mr: 'हा ग्रेड का?' },
    manualReason: { en: 'This grade was selected manually.', hi: 'यह ग्रेड मैन्युअल रूप से चुना गया था।', mr: 'हा ग्रेड मॅन्युअली निवडला गेला.' },
    assessAgain: { en: 'Assess Again', hi: 'फिर से आकलन करें', mr: 'पुन्हा मूल्यांकन करा' },
    continueToMarket: { en: 'Continue to Market Analysis', hi: 'बाजार विश्लेषण पर जारी रखें', mr: 'बाजार विश्लेषणासाठी पुढे जा' },
    unknownImage: { en: 'Automated prototype assessment is unavailable for these images. Please select grade manually.', hi: 'इन छवियों के लिए स्वचालित प्रोटोटाइप मूल्यांकन अनुपलब्ध है। कृपया मैन्युअल रूप से ग्रेड चुनें।', mr: 'या प्रतिमांसाठी स्वयंचलित प्रोटोटाइप मूल्यांकन अनुपलब्ध आहे. कृपया मॅन्युअली ग्रेड निवडा.' }
  },
  data: {
    status: {
      DRAFT: { en: 'Draft', hi: 'ड्राफ्ट', mr: 'मसुदा' },
      QUALITY_PENDING: { en: 'Quality Pending', hi: 'गुणवत्ता लंबित', mr: 'गुणवत्ता प्रलंबित' },
      MARKET_ANALYSIS_READY: { en: 'Market Analysis Ready', hi: 'बाजार विश्लेषण तैयार', mr: 'बाजार विश्लेषण तयार' },
      DECISION_READY: { en: 'Decision Ready', hi: 'निर्णय तैयार', mr: 'निर्णय तयार' },
      OFFER_RECEIVED: { en: 'Offer Received', hi: 'प्रस्ताव प्राप्त', mr: 'ऑफर प्राप्त' },
      TRANSACTION_ACTIVE: { en: 'Transaction Active', hi: 'लेनदेन सक्रिय', mr: 'व्यवहार सक्रिय' },
      COMPLETED: { en: 'Completed', hi: 'पूर्ण', mr: 'पूर्ण' }
    },
    constraints: {
      Within7days: { en: 'Within 7 days', hi: '7 दिनों के भीतर', mr: '7 दिवसांच्या आत' },
      Canarrangetransport: { en: 'Can arrange transport', hi: 'परिवहन की व्यवस्था कर सकते हैं', mr: 'वाहतुकीची व्यवस्था करू शकता' },
      Canstoreproduce: { en: 'Can store produce', hi: 'उत्पाद स्टोर कर सकते हैं', mr: 'उत्पादन साठवू शकता' },
      Within3days: { en: 'Within 3 days', hi: '3 दिनों के भीतर', mr: '3 दिवसांच्या आत' },
      Needtransportassistance: { en: 'Need transport assistance', hi: 'परिवहन सहायता की आवश्यकता है', mr: 'वाहतूक मदतीची आवश्यकता आहे' },
      Cannotstoreproduce: { en: 'Cannot store produce', hi: 'उत्पाद स्टोर नहीं कर सकते', mr: 'उत्पादन साठवू शकत नाही' }
    }
  }
};

for (const lang of langs) {
  const filePath = path.join(localesDir, `${lang}.json`);
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  const mergeKeys = (target, source, lang) => {
    for (const [key, value] of Object.entries(source)) {
      if (value && value[lang]) {
        target[key] = value[lang];
      } else if (typeof value === 'object' && !value[lang]) {
        target[key] = target[key] || {};
        mergeKeys(target[key], value, lang);
      }
    }
  };

  mergeKeys(data, newKeys, lang);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

console.log('Translations updated.');
