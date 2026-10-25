// Tests submission behavior with a mock service; never sends a real message.
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const source = await readFile(new URL('../contact.js',import.meta.url),'utf8');
const html = await readFile(new URL('../contact-form.html',import.meta.url),'utf8');
assert.match(html, /name="email"[^>]*required/);
assert.match(html, /name="message"[^>]*required/);
assert.match(html, /action="https:\/\/formspree\.io\/f\/[a-z]+"/);
function setup(reply) {
  const fields = {disabled:false}, submit = {disabled:false,textContent:'Send message'}, status = {textContent:''};
  const handlers = {}, attrs = {}; let resetCount = 0, requests = 0;
  const form = { action:'https://formspree.io/f/moevzgwj', valid:true,
    querySelector:s=>s==='fieldset'?fields:s==='[type="submit"]'?submit:status,
    addEventListener:(event,fn)=>{handlers[event]=fn},
    reportValidity:()=>form.valid, setAttribute:(k,v)=>{attrs[k]=v},removeAttribute:k=>{delete attrs[k]},
    reset:()=>{resetCount++}
  };
  vm.runInNewContext(source,{document:{querySelector:()=>form},FormData:class {constructor(value){assert.equal(value,form)}},AbortController,setTimeout,clearTimeout,
    fetch:async (url,options)=>{requests++;assert.equal(url,form.action);assert.equal(options.method,'POST');return reply(options)}
  });
  return {form,fields,submit,status,attrs,handlers,send:()=>handlers.submit({preventDefault(){}}),get requests(){return requests},get resetCount(){return resetCount}};
}
const invalid = setup(()=>({ok:true})); invalid.form.valid=false; await invalid.send(); assert.equal(invalid.requests,0);
let finish;
const successful = setup(()=>new Promise(resolve=>{finish=resolve}));
const sending = successful.send(); assert.equal(successful.fields.disabled,true); assert.equal(successful.attrs['aria-busy'],'true');
await successful.send(); assert.equal(successful.requests,1); finish({ok:true}); await sending;
assert.equal(successful.resetCount,1); assert.equal(successful.submit.disabled,false); assert.equal(successful.fields.disabled,false);assert.equal(successful.attrs['aria-busy'],undefined);assert.match(successful.status.textContent,/Message sent/);
successful.handlers.input(); assert.equal(successful.status.textContent,'');
for (const reply of [()=>({ok:false}),()=>{throw new Error('Network unavailable')},()=>{const error=new Error('Timeout');error.name='AbortError';throw error}]) {
  const failed=setup(reply); await failed.send(); assert.equal(failed.resetCount,0);assert.equal(failed.fields.disabled,false);assert.equal(failed.submit.disabled,false);assert.match(failed.status.textContent,/still here|kept/);
}
console.log('PASS: contact validation, duplicate prevention, success reset and rejected/network/timeout input retention (mock service only).');
