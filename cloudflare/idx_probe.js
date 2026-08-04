const fs=require('fs');
const s=fs.readFileSync('D:/Ribyon Studios Redesign/cloudflare/index.js','utf8');
function count(k){return s.split(k).length-1;}
['sendEmail','api/email/send','handleSendEmail','inviteUrl','/api/invite','EMAIL_FROM','RESEND','api.brevo','smtp/email'].forEach(k=>{
  console.log('>>',k,'->',count(k));
});
// show all routes
const routes=s.match(/path\s*===\s*'[^']+'/g)||[];
console.log('ROUTES:',routes.join(' | '));
// show email send route context
const i=s.indexOf("'/api/email/send'");
console.log('--- email route ctx ---');
console.log(i>=0?s.substring(i-260,i+60):'no route');
