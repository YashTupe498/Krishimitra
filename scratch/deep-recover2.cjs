const fs = require('fs');

const transcriptPath = 'C:\\Users\\VICTUS\\.gemini\\antigravity-ide\\brain\\d4a42ccd-c51d-4728-bb7c-daf490d5dfda\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

// Look for view_file responses that show the full premium MarketIntelligencePage
let bestContent = '';
let bestStep = -1;

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const content = obj.content || '';
    // Look for tool responses that show the premium file with premiumCard
    if (content.includes('premiumCard') && content.includes('BUYER DEMAND') && content.includes('MarketIntelligencePage')) {
      // This might be a view_file response showing the file
      if (content.length > 20000) {
        console.log('Found large content at step ' + (obj.step_index || '?') + ' source=' + obj.source + ' type=' + obj.type + ' length=' + content.length);
        // Extract the file content from the view_file output
        // Look for lines between the actual code
        bestContent = content;
        bestStep = obj.step_index || bestStep;
      }
    }
  } catch(e) {}
}

if (bestContent) {
  fs.writeFileSync('scratch/recovered_content.txt', bestContent.substring(0, 50000));
  console.log('Saved raw content to scratch/recovered_content.txt (step ' + bestStep + ')');
} else {
  console.log('No premium view_file content found. Trying replace_file_content calls...');
  
  // Look for replace_file_content or multi_replace calls that contain premium card code
  let allReplacements = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const call of obj.tool_calls) {
          const name = call.name || '';
          if ((name.includes('replace_file_content') || name.includes('multi_replace')) && JSON.stringify(call).includes('MarketIntelligencePage')) {
            let args;
            try {
              args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
            } catch(e) { continue; }
            if (args && args.ReplacementContent && args.ReplacementContent.includes('premiumCard')) {
              console.log('Found replace at step ' + (obj.step_index || '?') + ' length=' + args.ReplacementContent.length);
              allReplacements.push({ step: obj.step_index, content: args.ReplacementContent.substring(0, 200) });
            }
          }
        }
      }
    } catch(e) {}
  }
  
  if (allReplacements.length > 0) {
    console.log('Found ' + allReplacements.length + ' replacement chunks with premiumCard');
    allReplacements.forEach(r => console.log('  Step ' + r.step + ': ' + r.content.substring(0, 100)));
  } else {
    console.log('No premium card replacements found either.');
  }
}
