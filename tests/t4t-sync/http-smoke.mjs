import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';

// An ephemeral local-only key exercises access control without using or
// persisting a production token. No authorized write is sent to Sanity.
const key=randomBytes(32).toString('hex');
const port=23217;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port',String(port)],{
  env:{...process.env,T4T_SYNC_SECRET:key},stdio:['ignore','pipe','pipe'],
});
let ready=false;
try {
  for(let i=0;i<100;i++) {
    try {
      const response=await fetch(`http://localhost:${port}/api/t4t-sync`);
      if(response.status===401){ready=true;break;}
    } catch {}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  assert.ok(ready,'local server did not become ready');
  const wrong=await fetch(`http://localhost:${port}/api/t4t-sync`,{headers:{authorization:'Bearer wrong'}});
  assert.equal(wrong.status,401);
  const malformed=await fetch(`http://localhost:${port}/api/t4t-sync`,{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:'{'});
  assert.equal(malformed.status,409);
  const body=await malformed.text();assert.ok(!body.includes(key));assert.ok(!body.includes('token'));
  console.log('HTTP smoke passed: missing/wrong credentials denied; malformed request fails without exposing secrets.');
} finally {child.kill('SIGTERM');}
