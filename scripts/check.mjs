import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const dir = fileURLToPath(new URL('../dist/', import.meta.url));
async function walk(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(folder,e.name)) : path.join(folder,e.name)))).flat();
}
const files = (await walk(dir)).filter(f => f.endsWith('.html'));
const docs = new Map(await Promise.all(files.map(async f => [f, await readFile(f,'utf8')])));
const titles = new Set(); let links = 0;
for (const [file, html] of docs) {
  const label = path.relative(dir,file);
  assert.match(html, /<html lang="en">/i, label);
  assert.match(html, /name="viewport"/, label);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${label}: one h1`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title),`${label}: unique title`); titles.add(title);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,`${label}: duplicate IDs`);
  for (const [,href] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    if (/^(https:|mailto:|data:)/.test(href)) continue;
    assert.ok(!/^(?:\/|[a-z]+:)/i.test(href), `${label}: use relative URLs: ${href}`);
    const [raw,fragment] = href.split('#');
    const target = raw ? raw.split('?')[0] : '';
    let name = target ? path.resolve(path.dirname(file),decodeURIComponent(target)) : file;
    if (target.endsWith('/')) name = path.join(name,'index.html');
    assert.ok(name.startsWith(dir),`${label}: target outside dist`);
    await access(name);
    if (fragment) assert.ok(docs.get(name)?.includes(`id="${decodeURIComponent(fragment)}"`),`${label}: broken anchor ${href}`);
    links++;
  }
  assert.ok(!/href="(?:#|)"/.test(html),`${label}: empty link`);
}
const report = await readFile(path.join(dir,'calmpa/documents/calmpa-full-report.pdf'));
const manifest = JSON.parse(await readFile(new URL('../calmpa-report-parts/manifest.json',import.meta.url),'utf8'));
assert.equal(report.length,manifest.bytes);
assert.equal(createHash('sha256').update(report).digest('hex'),manifest.sha256);
const calmpa = docs.get(path.join(dir,'calmpa/index.html'));
for (const [label,pdf] of [['View Full Report','calmpa-full-report.pdf'],['View Poster','calmpa-poster-final.pdf']]) {
  const link = calmpa.match(new RegExp(`<a[^>]*href="documents/${pdf.replaceAll('.','\\.')}"[^>]*>[^<]*${label}`))?.[0];
  assert.ok(link,`${label}: document link`);
  assert.match(link,/target="_blank"/); assert.match(link,/rel="noopener noreferrer"/);
}
assert.match(docs.get(path.join(dir,'index.html')),/href="calmpa\/"/);
assert.ok(!(await walk(dir)).some(f=>/report\.part-|calmpa-report-parts/.test(f)),'Report source parts must not be deployed');
console.log(`PASS: ${files.length} pages; ${links} local links/assets; metadata, anchors, Report/Poster links and original report SHA-256.`);

await import('./check-contact.mjs');
