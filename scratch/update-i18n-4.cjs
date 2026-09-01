const fs = require('fs');
const path = require('path');
const i18nDir = path.join(__dirname, '..', 'src', 'i18n');

const newTrans = {
  en: {
    highPressureDesc: "Arrivals are tightening while prices are moving upward, indicating stronger near-term supply pressure.",
    lowPressureDesc: "Supply appears adequate as prices trend downward.",
    moderatePressureDesc: "Market forces appear balanced with mixed or steady price and arrival signals.",
    cautionWindowDesc: "Declining prices suggest a cautious approach. Consider waiting if quality allows.",
    insufficientWindowDesc: "Insufficient price trends or arrival data prevents a confident assessment.",
    reason3: "Highly competitive price",
    reason4: "Price is below regional maximum",
    reason5: "Strong market demand pressure",
    reason6: "Verified buyer demand available",
    moderatePressure: "MODERATE",
    lowPressure: "LOW"
  },
  hi: {
    highPressureDesc: "आगमन सख्त हो रहा है जबकि कीमतें ऊपर की ओर जा रही हैं, जो मजबूत निकट-अवधि की आपूर्ति के दबाव का संकेत देती हैं।",
    lowPressureDesc: "कीमतों में गिरावट के रूप में आपूर्ति पर्याप्त प्रतीत होती है।",
    moderatePressureDesc: "मिश्रित या स्थिर कीमत और आगमन संकेतों के साथ बाजार की ताकतें संतुलित दिखाई देती हैं।",
    cautionWindowDesc: "घटती कीमतें एक सतर्क दृष्टिकोण का सुझाव देती हैं। यदि गुणवत्ता अनुमति देती है तो प्रतीक्षा करने पर विचार करें।",
    insufficientWindowDesc: "अपर्याप्त मूल्य रुझान या आगमन डेटा एक आश्वस्त मूल्यांकन को रोकता है।",
    reason3: "अत्यधिक प्रतिस्पर्धी मूल्य",
    reason4: "मूल्य क्षेत्रीय अधिकतम से नीचे है",
    reason5: "मजबूत बाजार मांग का दबाव",
    reason6: "सत्यापित खरीदार मांग उपलब्ध",
    moderatePressure: "मध्यम",
    lowPressure: "कम"
  },
  mr: {
    highPressureDesc: "किमती वरच्या दिशेने जात असताना आवक घट्ट होत आहे, जे अल्पकालीन पुरवठ्याचा मजबूत दबाव दर्शवते.",
    lowPressureDesc: "किमती घसरल्यामुळे पुरवठा पुरेसा दिसतो.",
    moderatePressureDesc: "मिश्रित किंवा स्थिर किंमत आणि आवक संकेतांसह बाजार शक्ती संतुलित दिसतात.",
    cautionWindowDesc: "घसरणाऱ्या किमती सावध दृष्टिकोन सुचवतात. गुणवत्ता परवानगी देत असल्यास वाट पाहण्याचा विचार करा.",
    insufficientWindowDesc: "अपुऱ्या किमतीचा कल किंवा आवक डेटा आत्मविश्वासपूर्ण मूल्यमापन रोखतो.",
    reason3: "अत्यंत स्पर्धात्मक किंमत",
    reason4: "किंमत प्रादेशिक कमाल पेक्षा कमी आहे",
    reason5: "बाजारातील मागणीचा मजबूत दबाव",
    reason6: "सत्यापित खरेदीदार मागणी उपलब्ध",
    moderatePressure: "मध्यम",
    lowPressure: "कमी"
  }
};

['en', 'hi', 'mr'].forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  Object.assign(data.marketIntelligence, newTrans[lang]);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json with new dynamic strings`);
});
