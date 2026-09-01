const fs = require('fs');

const transcriptPath = 'C:\\Users\\VICTUS\\.gemini\\antigravity-ide\\brain\\d4a42ccd-c51d-4728-bb7c-daf490d5dfda\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

// Find all view_file responses around steps 1900-2000 that show MarketIntelligencePage
// We need to reconstruct the file from the line ranges shown
let fileChunks = {};

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const step = obj.step_index || 0;
    const content = obj.content || '';
    
    // Look for view_file outputs showing 545-line version
    if (step >= 1500 && step <= 2000 && content.includes('Total Lines: 545') && content.includes('MarketIntelligencePage.tsx')) {
      // Extract the line range
      const rangeMatch = content.match(/Showing lines (\d+) to (\d+)/);
      if (rangeMatch) {
        const startLine = parseInt(rangeMatch[1]);
        const endLine = parseInt(rangeMatch[2]);
        
        // Extract the actual code lines (they have format "N: code")
        const codeLines = [];
        const contentLines = content.split('\n');
        for (const cl of contentLines) {
          const lineMatch = cl.match(/^(\d+): (.*)$/);
          if (lineMatch) {
            const lineNum = parseInt(lineMatch[1]);
            codeLines.push({ num: lineNum, code: lineMatch[2] });
          }
        }
        
        fileChunks[step] = { startLine, endLine, codeLines, step };
        console.log('Step ' + step + ': lines ' + startLine + '-' + endLine + ' (' + codeLines.length + ' code lines extracted)');
      }
    }
  } catch(e) {}
}

// Now reconstruct the full file from the chunks
// We need chunks that cover lines 1-545
let allCodeLines = {};
// Process chunks in order to get the latest version of each line
const sortedSteps = Object.keys(fileChunks).map(Number).sort((a,b) => a - b);
for (const step of sortedSteps) {
  const chunk = fileChunks[step];
  for (const cl of chunk.codeLines) {
    allCodeLines[cl.num] = cl.code;
  }
}

const lineNums = Object.keys(allCodeLines).map(Number).sort((a,b) => a - b);
console.log('Recovered line range: ' + lineNums[0] + ' to ' + lineNums[lineNums.length - 1] + ' (' + lineNums.length + ' lines)');

if (lineNums.length > 400) {
  // Build the file
  const maxLine = lineNums[lineNums.length - 1];
  const fileLines = [];
  for (let i = 1; i <= maxLine; i++) {
    fileLines.push(allCodeLines[i] || '');
  }
  const recovered = fileLines.join('\n');
  fs.writeFileSync('scratch/recovered_full_market.tsx', recovered);
  console.log('Full file recovered to scratch/recovered_full_market.tsx (' + fileLines.length + ' lines)');
} else {
  console.log('Not enough lines recovered. Need view_file calls covering more of the file.');
}
