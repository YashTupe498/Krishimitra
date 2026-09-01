const fs = require('fs');

const transcriptPath = 'C:\\Users\\VICTUS\\.gemini\\antigravity-ide\\brain\\d4a42ccd-c51d-4728-bb7c-daf490d5dfda\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

// Look for diff outputs that contain the + lines for our missing ranges
// Missing: 11-14, 31-49, 311-319, 371-397

// Also look for the 928/944/948/953/964 line versions which were the ORIGINAL premium version
// before the translation scripts trimmed it down to 545
let allCodeLines = {};

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const content = obj.content || '';
    
    // Search in diff outputs for added lines
    if (content.includes('MarketIntelligencePage.tsx') && content.includes('diff_block')) {
      // Parse diff lines that start with +
      const contentLines = content.split('\n');
      for (let i = 0; i < contentLines.length; i++) {
        const cl = contentLines[i];
        // Look for @@ markers to get line numbers
        const hunkMatch = cl.match(/@@ -\d+,?\d* \+(\d+),?\d* @@/);
        if (hunkMatch) {
          let currentLine = parseInt(hunkMatch[1]);
          // Process subsequent lines
          for (let j = i + 1; j < contentLines.length; j++) {
            const dl = contentLines[j];
            if (dl.startsWith('@@') || dl.includes('diff_block_end')) break;
            if (dl.startsWith('+') && !dl.startsWith('+++')) {
              const code = dl.substring(1); // Remove the + prefix
              if (!allCodeLines[currentLine]) {
                allCodeLines[currentLine] = code;
              }
              currentLine++;
            } else if (dl.startsWith('-') && !dl.startsWith('---')) {
              // Removed line, don't increment
            } else if (dl.startsWith(' ') || (!dl.startsWith('+') && !dl.startsWith('-'))) {
              // Context line
              if (!allCodeLines[currentLine]) {
                allCodeLines[currentLine] = dl.startsWith(' ') ? dl.substring(1) : dl;
              }
              currentLine++;
            }
          }
        }
      }
    }
    
    // Also get from view_file outputs (including older versions)
    if (content.includes('MarketIntelligencePage.tsx') && content.includes('Total Lines:')) {
      const totalMatch = content.match(/Total Lines: (\d+)/);
      const total = totalMatch ? parseInt(totalMatch[1]) : 0;
      if (total >= 500 && total <= 550) {
        const contentLines = content.split('\n');
        for (const cl of contentLines) {
          const lineMatch = cl.match(/^(\d+): (.*)$/);
          if (lineMatch) {
            const lineNum = parseInt(lineMatch[1]);
            allCodeLines[lineNum] = lineMatch[2];
          }
        }
      }
    }
  } catch(e) {}
}

const lineNums = Object.keys(allCodeLines).map(Number).sort((a,b) => a - b);
console.log('Total recovered lines: ' + lineNums.length);

// Find remaining gaps (up to 545)
let gaps = [];
for (let i = 1; i <= 545; i++) {
  if (allCodeLines[i] === undefined) gaps.push(i);
}
console.log('Still missing: ' + gaps.length + ' lines');
if (gaps.length > 0 && gaps.length < 100) {
  // Group into ranges
  let ranges = [];
  let start = gaps[0], end = gaps[0];
  for (let i = 1; i < gaps.length; i++) {
    if (gaps[i] === end + 1) end = gaps[i];
    else { ranges.push(start === end ? '' + start : start + '-' + end); start = gaps[i]; end = gaps[i]; }
  }
  ranges.push(start === end ? '' + start : start + '-' + end);
  console.log('Missing ranges: ' + ranges.join(', '));
}

// Save recovered file
const maxLine = Math.max(...lineNums, 545);
const fileLines = [];
for (let i = 1; i <= maxLine; i++) {
  fileLines.push(allCodeLines[i] !== undefined ? allCodeLines[i] : '// [MISSING LINE ' + i + ']');
}
fs.writeFileSync('scratch/recovered_full_market.tsx', fileLines.join('\n'));
console.log('Saved to scratch/recovered_full_market.tsx (' + fileLines.length + ' lines)');
