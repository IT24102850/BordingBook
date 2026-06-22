const fs = require('fs');
const path = 'c:/Users/chath/Desktop/BordingBook/src/app/components/SearchPage.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Remove line 1204 (0-indexed: 1203) which is the duplicate token declaration
lines.splice(1203, 1);
console.log('Removed duplicate token line');

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done!');
