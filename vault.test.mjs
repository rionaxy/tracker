import {test} from 'node:test';
import assert from 'node:assert/strict';
import {derive,seal,open,validateData} from '../vault.js';
const password='correct horse battery staple';
const data={currency:'PHP',transactions:[{id:'1',type:'expense',description:'Lunch',note:'',cents:12550,date:'2026-09-29',category:'Food & dining'}],budgets:{'Food & dining':500000}};
test('encrypted vault round trip, wrong password, tampering, randomized IV, and rotation',async()=>{const salt=crypto.getRandomValues(new Uint8Array(16)),key=await derive(password,salt);const a=await seal(data,key,salt),b=await seal(data,key,salt);assert.notEqual(a.iv,b.iv);assert.ok(!a.ciphertext.includes('Lunch'));assert.deepEqual((await open(a,password)).data,data);await assert.rejects(open(a,'wrong password'));const changed={...a,ciphertext:(a.ciphertext[0]==='A'?'B':'A')+a.ciphertext.slice(1)};await assert.rejects(open(changed,password));const s2=crypto.getRandomValues(new Uint8Array(16));const k2=await derive('a new secure password',s2);const rotated=await seal(data,k2,s2);assert.deepEqual((await open(rotated,'a new secure password')).data,data);await assert.rejects(open(rotated,password));});
test('reject malformed records, impossible dates, duplicate IDs, and invalid budgets',()=>{assert.equal(validateData(data),data);for(const patch of [{cents:-1},{cents:1.5},{date:'2026-02-30'},{type:'bad'},{category:'invalid'}]){const d=structuredClone(data);Object.assign(d.transactions[0],patch);assert.throws(()=>validateData(d));}const duplicate=structuredClone(data);duplicate.transactions.push(duplicate.transactions[0]);assert.throws(()=>validateData(duplicate));assert.throws(()=>validateData({...data,budgets:{Other:-1}}));});
test('iteration count is carried in the envelope and bounded',async()=>{const {validateEnvelope,MIN_ITERATIONS,MAX_ITERATIONS}=await import('../vault.js');const salt=crypto.getRandomValues(new Uint8Array(16));const it=MIN_ITERATIONS+1000;const key=await derive(password,salt,it);const sealed=await seal(data,key,salt,it);assert.equal(sealed.iterations,it);const opened=await open(sealed,password);assert.deepEqual(opened.data,data);assert.equal(opened.iterations,it);for(const bad of [MIN_ITERATIONS-1,MAX_ITERATIONS+1,1.5,'600000'])assert.throws(()=>validateEnvelope({...sealed,iterations:bad}));});

test('accepts Asian currencies and large-denomination amounts, rejects unknown codes', async () => {
  const { validateData, CURRENCIES } = await import('../vault.js');
  for (const c of ['PHP','KRW','THB','VND','SGD','JPY','IDR','INR','CNY','HKD','TWD','MYR','AED','SAR']) {
    if (!CURRENCIES.includes(c)) throw new Error('missing ' + c);
    validateData({ currency: c, transactions: [{ id: '1', type: 'income', description: 'Pay', note: '', cents: 5000000000000, date: '2026-09-29', category: 'Salary' }], budgets: {} });
  }
  let threw = false;
  try { validateData({ currency: 'XXX', transactions: [], budgets: {} }); } catch { threw = true; }
  if (!threw) throw new Error('unknown currency accepted');
});
