const fs = require('fs');

const transcriptPath = 'C:\\Users\\VICTUS\\.gemini\\antigravity-ide\\brain\\d4a42ccd-c51d-4728-bb7c-daf490d5dfda\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

// Find step 586 and extract the CodeContent
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 586 && obj.content && obj.content.includes('premiumCard')) {
      // The content field IS the code that was written
      // It's the content from a CODE_ACTION step
      const code = obj.content;
      fs.writeFileSync('scratch/recovered_step586.tsx', code);
      console.log('Saved step 586 content, length=' + code.length);
      
      // Also check for nearby steps that might have the final version
      break;
    }
  } catch(e) {}
}

// Also look for ALL steps with premiumCard in content
let maxStep = -1;
let maxContent = '';
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const step = obj.step_index || 0;
    const content = obj.content || '';
    if (content.includes('premiumCard') && content.includes('import React') && content.includes('BUYER DEMAND') && content.length > 20000) {
      if (step > maxStep) {
        maxStep = step;
        maxContent = content;
      }
      console.log('Found premium content at step ' + step + ' type=' + obj.type + ' source=' + obj.source + ' length=' + content.length);
    }
  } catch(e) {}
}

if (maxContent) {
  fs.writeFileSync('scratch/recovered_latest.tsx', maxContent);
  console.log('Saved latest premium version from step ' + maxStep + ', length=' + maxContent.length);
}
