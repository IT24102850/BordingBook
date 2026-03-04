const fs=require('fs');
const path='f:/BordingBook/src/app/components/payment/StudentPayment.tsx';
const lines=fs.readFileSync(path,'utf8').split(/\r?\n/);
const start=140, end=150;
for(let i=start;i<=end && i<lines.length;i++){
  console.log(`${i+1}: ${lines[i]}`);
}
