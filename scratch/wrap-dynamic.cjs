const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'pages', 'farmer', 'MarketIntelligencePage.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  '{frontendPressure.description}': '{translateDynamic(frontendPressure.description)}',
  '{frontendWindow.description}': '{translateDynamic(frontendWindow.description)}',
  '{oppScore.status}': '{translateDynamic(oppScore.status)}',
  '{r}': '{translateDynamic(r)}',
  'frontendPressure.label': 'translateDynamic(frontendPressure.label)',
  'arrivalData.scope === \'all_commodities\' \n                       ? "Showing market-wide arrivals across all commodities (not onion-specific)." \n                       : "Only single historical observation available for this market"': 'arrivalData.scope === \'all_commodities\' \n                       ? "Showing market-wide arrivals across all commodities (not onion-specific)." \n                       : translateDynamic("Only single historical observation available for this market")'
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

fs.writeFileSync(file, content);
console.log('TSX dynamic wrapping complete');
