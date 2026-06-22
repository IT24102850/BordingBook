const fs = require('fs');
const path = 'c:/Users/chath/Desktop/BordingBook/src/app/components/SearchPage.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find all lines with token declarations and track duplicates within same function
let tokenLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const token = localStorage.getItem("bb_access_token")')) {
    tokenLines.push(i);
  }
}
console.log('Found token declarations at lines:', tokenLines.map(l => l + 1));

// Lines 1203 and 1204 (0-indexed: 1202 and 1203) are duplicates - remove them
// We remove from bottom up so indexes stay valid
for (let i = tokenLines.length - 1; i >= 0; i--) {
  const lineNum = tokenLines[i]; // 0-indexed
  // Check if the previous token line is within 5 lines (duplicate in same block)
  if (i > 0 && tokenLines[i] - tokenLines[i-1] < 6) {
    console.log(`Removing duplicate token at line ${lineNum + 1}: ${lines[lineNum].trim()}`);
    lines.splice(lineNum, 1);
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done!');
