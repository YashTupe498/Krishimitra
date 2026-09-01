const fs = require('fs');
const lines = fs.readFileSync('temp_recovered.txt', 'utf8').split('\n');

let latestCode = null;

for (const line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'default_api:write_to_file' || call.name === 'default_api:replace_file_content' || call.name === 'default_api:multi_replace_file_content') {
           const args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
           if (args.TargetFile && args.TargetFile.includes('MarketIntelligencePage.tsx')) {
               if (args.CodeContent) {
                   latestCode = args.CodeContent;
               } else if (args.ReplacementContent) {
                   // This was a replace, so it's not the full file, we really want the last write_to_file
                   // But if it was a write_to_file, we capture it.
               }
           }
        }
      }
    }
  } catch (e) {
  }
}

if (latestCode) {
    fs.writeFileSync('temp_market.tsx', latestCode);
    console.log('Recovered file to temp_market.tsx (length: ' + latestCode.length + ')');
} else {
    console.log('No write_to_file found for MarketIntelligencePage.tsx');
}
