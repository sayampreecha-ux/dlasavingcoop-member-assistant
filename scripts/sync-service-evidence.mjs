import fs from 'node:fs';
const path=new URL('../index.html',import.meta.url),data=JSON.parse(fs.readFileSync(new URL('../data/service-answer-evidence.json',import.meta.url),'utf8'));
const html=fs.readFileSync(path,'utf8'),start='  // BEGIN GENERATED SERVICE EVIDENCE',end='  // END GENERATED SERVICE EVIDENCE';
const a=html.indexOf(start),b=html.indexOf(end);if(a<0||b<a)throw Error('Service evidence markers missing');
const block=start+'\n  const SERVICE_EVIDENCE='+JSON.stringify(data)+';\n'+end;
const next=html.slice(0,a)+block+html.slice(b+end.length);
if(process.argv.includes('--check')){if(next!==html)throw Error('Service evidence and runtime differ');console.log('Reviewed service evidence synchronized');}else fs.writeFileSync(path,next);
