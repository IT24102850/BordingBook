const fs = require('fs');
const content = fs.readFileSync('c:/Users/chath/Desktop/BordingBook/src/app/components/SearchPage.tsx', 'utf8');
const stack = [];
let inString = null;
let inComment = false;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const next = line[j + 1];
    if (inComment) {
      if (inComment === 'block' && char === '*' && next === '/') { inComment = false; j++; }
      continue;
    }
    if (inString) {
      if (char === '\\') { j++; } else if (char === inString) { inString = null; }
      continue;
    }
    if (char === '/' && next === '/') break;
    if (char === '/' && next === '*') { inComment = 'block'; j++; continue; }
    if (char === '"' || char === "'" || char === '`') { inString = char; continue; }
    if ('{(['.includes(char)) stack.push({ char, line: i + 1, text: line.trim().slice(0, 40) });
    else if ('})]'.includes(char)) {
      if (stack.length === 0) { console.log(`Extra closing ${char} at line ${i + 1}: ${line.trim()}`); continue; }
      const top = stack[stack.length - 1];
      const match = (top.char==='{' && char==='}') || (top.char==='(' && char===')') || (top.char==='[' && char===']');
      if (match) stack.pop();
      else { console.log(`Mismatch at line ${i + 1}: found ${char}, expected match for ${top.char} from line ${top.line}`); stack.pop(); }
    }
  }
  if (inComment === 'line') inComment = false;
}
console.log('\n--- Unclosed elements ---');
for (const item of stack) console.log(`Unclosed ${item.char} at line ${item.line}: ${item.text}`);
