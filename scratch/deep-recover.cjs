const fs = require('fs');

const transcriptPath = 'C:\\Users\\VICTUS\\.gemini\\antigravity-ide\\brain\\d4a42ccd-c51d-4728-bb7c-daf490d5dfda\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let bestContent = null;
let bestStep = -1;

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        const name = call.name || '';
        if (name.includes('write_to_file')) {
          let args;
          try {
            args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
          } catch(e) { continue; }
          if (args && args.TargetFile && args.TargetFile.includes('MarketIntelligencePage.tsx') && args.CodeContent) {
            bestContent = args.CodeContent;
            bestStep = obj.step_index || bestStep;
            console.log('Found write_to_file at step ' + bestStep + ' length=' + args.CodeContent.length);
          }
        }
      }
    }
  } catch (e) {
    // skip malformed lines
  }
}

if (bestContent) {
  fs.writeFileSync('scratch/recovered_market_page.tsx', bestContent);
  console.log('Recovered file saved to scratch/recovered_market_page.tsx (step ' + bestStep + ', length=' + bestContent.length + ')');
} else {
  console.log('No write_to_file found. Searching for large code blocks containing premiumCard...');
  
  // Try a different approach: look for any tool response or content containing the premium version
  let foundPremium = false;
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      const content = JSON.stringify(obj);
      if (content.includes('premiumCard') && content.includes('ShoppingBag') && content.includes('BUYER DEMAND')) {
        // This line contains the premium version
        if (obj.tool_calls) {
          for (const call of obj.tool_calls) {
            const args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
            if (args && (args.CodeContent || args.ReplacementContent)) {
              const code = args.CodeContent || args.ReplacementContent;
              if (code.length > 10000) {
                fs.writeFileSync('scratch/recovered_market_page.tsx', code);
                console.log('Found large code block at step ' + (obj.step_index || '?') + ' length=' + code.length);
                foundPremium = true;
                break;
              }
            }
          }
        }
        if (foundPremium) break;
      }
    } catch(e) {}
  }
  if (!foundPremium) {
    console.log('Could not find the premium version in transcript.');
  }
}
