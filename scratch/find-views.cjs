const fs = require('fs');

const transcriptPath = 'C:\\Users\\VICTUS\\.gemini\\antigravity-ide\\brain\\d4a42ccd-c51d-4728-bb7c-daf490d5dfda\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

// Find ALL tool responses from view_file that show MarketIntelligencePage content
// These will be SYSTEM steps that contain the actual file content
let results = [];

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const content = obj.content || '';
    // Look for view_file outputs showing the premium version
    if (content.includes('Total Lines:') && content.includes('MarketIntelligencePage.tsx') && content.includes('premiumCard')) {
      // Extract total lines count
      const match = content.match(/Total Lines: (\d+)/);
      const totalLines = match ? parseInt(match[1]) : 0;
      results.push({ step: obj.step_index, totalLines, type: obj.type, source: obj.source });
      console.log('Step ' + obj.step_index + ': view_file showing ' + totalLines + ' lines, type=' + obj.type);
    }
  } catch(e) {}
}

// Now look for the RPC/command outputs that show "file content" 
// from the node -e commands that dumped file matches
let lastGoodStep = -1;
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const step = obj.step_index || 0;
    const content = obj.content || '';
    // The key step: look for the last successful tsc --noEmit BEFORE step ~1300 (when BUYER DEMAND was reported)
    if (content.includes('tsc --noEmit') && content.includes('exited with code 0') && step > lastGoodStep) {
      lastGoodStep = step;
    }
  } catch(e) {}
}

console.log('Last successful tsc check before issues: step ' + lastGoodStep);

// Count total steps
console.log('Total transcript lines: ' + lines.filter(l => l.trim()).length);
