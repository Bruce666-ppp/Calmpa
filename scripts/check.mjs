import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const dir=path.join(root,'dist');
async function walk(folder){return (await Promise.all((await readdir(folder,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(folder,e.name)):path.join(folder,e.name)))).flat()}
const files=await walk(dir);
const docs=new Map(await Promise.all(files.filter(f=>f.endsWith('.html')).map(async f=>[f,await readFile(f,'utf8')])));
let refs=0;
for(const [file,html] of docs){
 assert.match(html,/<html lang="en">/i);assert.match(html,/name="viewport"/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 for(const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https:|mailto:|data:)/.test(href))continue;
  assert.ok(!/^(?:\/|[a-z]+:)/i.test(href));
  const [target,fragment]=href.split('#');let name=target?path.resolve(path.dirname(file),target):file;
  if(target.endsWith('/'))name=path.join(name,'index.html');
  assert.ok(name.startsWith(dir+path.sep));await access(name);
  if(fragment)assert.ok(docs.get(name)?.includes(`id="${fragment}"`),`${file}: broken anchor ${href}`);refs++;
 }
}
const home=docs.get(path.join(dir,'index.html'));
assert.match(home,/<title>Calmpa — Pause gently\. \| Boyang Wan<\/title>/);
assert.ok(!home.includes('Explore KneeUp')&&!home.includes('ALL PROJECTS'));
assert.ok(!files.some(f=>/kneeup|polyband|torras|contact\.html|contact\.js|wan-boyang|Portfolio\.pdf/.test(path.relative(dir,f))));
for(const pdf of ['calmpa-full-report.pdf','calmpa-poster-final.pdf'])assert.ok(home.includes(`href="documents/${pdf}" target="_blank"`));
const manifest=JSON.parse(await readFile(path.join(root,'calmpa-report-parts/manifest.json'),'utf8'));
const bytes=await readFile(path.join(dir,manifest.output));assert.equal(bytes.length,manifest.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
console.log(`PASS: standalone Calmpa only; ${docs.size} HTML pages, ${refs} local references, original report verified; no personal portfolio pages in output.`);
