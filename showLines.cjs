const fs = require('fs');
const path = 'c:/Users/chath/Desktop/BordingBook/src/app/components/SearchPage.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Show lines around 1203 so we can see what is there
console.log('=== Lines 1195-1215 ===');
for (let i = 1194; i < 1215 && i < lines.length; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
