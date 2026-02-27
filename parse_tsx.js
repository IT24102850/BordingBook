const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('f:/BordingBook/src/app/components/payment/StudentPayment.tsx','utf8');
try {
  parser.parse(code, { sourceType:'module', plugins:['typescript','jsx'] });
  console.log('parsed OK');
} catch(e) {
  console.error('error message:',e.message);
  console.error('location:',e.loc);
}
