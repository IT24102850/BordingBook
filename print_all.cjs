const fs=require('fs');
const path='f:/BordingBook/src/app/components/payment/StudentPayment.tsx';
const lines=fs.readFileSync(path,'utf8').split(/\r?\n/);
lines.forEach((l,i)=>console.log(`${i+1}: ${l}`));
