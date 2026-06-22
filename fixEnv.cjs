const fs = require('fs');
const envPath = 'c:/Users/chath/Desktop/BordingBook/.env';
const vitePath = 'c:/Users/chath/Desktop/BordingBook/.env';

// Check if frontend .env has VITE_API_URL
const frontendEnvPath = 'c:/Users/chath/Desktop/BordingBook/.env';
let content = '';
try { content = fs.readFileSync(frontendEnvPath, 'utf8'); } catch { content = ''; }

if (!content.includes('VITE_API_URL')) {
  fs.appendFileSync(frontendEnvPath, '\nVITE_API_URL=http://localhost:5001\n');
  console.log('Added VITE_API_URL to .env');
} else {
  console.log('VITE_API_URL already exists');
}
