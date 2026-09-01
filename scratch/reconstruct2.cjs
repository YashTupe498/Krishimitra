const fs = require('fs');

const transcriptPath = 'C:\\Users\\VICTUS\\.gemini\\antigravity-ide\\brain\\d4a42ccd-c51d-4728-bb7c-daf490d5dfda\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

// Collect ALL view_file chunks for the 545-line version of MarketIntelligencePage
let allCodeLines = {};

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const content = obj.content || '';
    
    // Accept any version with 540-545 lines (the premium version)
    if (content.includes('MarketIntelligencePage.tsx') && 
        (content.includes('Total Lines: 545') || content.includes('Total Lines: 544') || content.includes('Total Lines: 543') || content.includes('Total Lines: 516') || content.includes('Total Lines: 517'))) {
      
      const contentLines = content.split('\n');
      for (const cl of contentLines) {
        const lineMatch = cl.match(/^(\d+): (.*)$/);
        if (lineMatch) {
          const lineNum = parseInt(lineMatch[1]);
          allCodeLines[lineNum] = lineMatch[2];
        }
      }
    }
  } catch(e) {}
}

const lineNums = Object.keys(allCodeLines).map(Number).sort((a,b) => a - b);
console.log('Recovered line range: ' + (lineNums[0] || 'none') + ' to ' + (lineNums[lineNums.length - 1] || 'none') + ' (' + lineNums.length + ' lines)');

// Find gaps
let gaps = [];
if (lineNums.length > 0) {
  for (let i = 1; i <= lineNums[lineNums.length - 1]; i++) {
    if (!allCodeLines[i] && allCodeLines[i] !== '') {
      gaps.push(i);
    }
  }
  console.log('Missing lines: ' + gaps.length);
  if (gaps.length > 0 && gaps.length < 50) {
    console.log('Gap ranges: ' + gaps.join(', '));
  } else if (gaps.length >= 50) {
    // Show ranges
    let ranges = [];
    let start = gaps[0];
    let end = gaps[0];
    for (let i = 1; i < gaps.length; i++) {
      if (gaps[i] === end + 1) {
        end = gaps[i];
      } else {
        ranges.push(start + '-' + end);
        start = gaps[i];
        end = gaps[i];
      }
    }
    ranges.push(start + '-' + end);
    console.log('Gap ranges: ' + ranges.join(', '));
  }
}

if (lineNums.length > 300) {
  const maxLine = lineNums[lineNums.length - 1];
  const fileLines = [];
  for (let i = 1; i <= maxLine; i++) {
    fileLines.push(allCodeLines[i] !== undefined ? allCodeLines[i] : '// [MISSING LINE ' + i + ']');
  }
  const recovered = fileLines.join('\n');
  fs.writeFileSync('scratch/recovered_full_market.tsx', recovered);
  console.log('Saved to scratch/recovered_full_market.tsx (' + fileLines.length + ' lines)');
}
