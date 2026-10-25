import { readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const out = path.resolve(root,'dist');
if (path.relative(root,out) !== 'dist') throw new Error('Invalid build output directory');
const source = path.join(root,'calmpa');
const partsDir = path.join(root,'calmpa-report-parts');
const manifest = JSON.parse(await readFile(path.join(partsDir,'manifest.json'),'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const validDigest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
if (manifest.version !== 1 || manifest.output !== 'documents/calmpa-full-report.pdf' ||
    !Number.isSafeInteger(manifest.bytes) || manifest.bytes <= 0 || !validDigest(manifest.sha256) ||
    !Array.isArray(manifest.parts) || manifest.parts.length === 0) throw new Error('Invalid report manifest');
const parts = [];
for (const [index,part] of manifest.parts.entries()) {
  if (part.file !== `report.part-${String(index+1).padStart(2,'0')}` ||
      !Number.isSafeInteger(part.bytes) || part.bytes <= 0 || !validDigest(part.sha256)) throw new Error('Invalid report part metadata');
  const bytes = await readFile(path.join(partsDir,part.file));
  if (bytes.length !== part.bytes || digest(bytes) !== part.sha256) throw new Error(`Report verification failed: ${part.file}`);
  parts.push(bytes);
}
const report = Buffer.concat(parts);
if (report.length !== manifest.bytes || digest(report) !== manifest.sha256) throw new Error('Full report verification failed');
// This known, guarded directory contains generated output only.
// Recreate it so the mistaken personal-portfolio output cannot be published.
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(source,out,{recursive:true});
await mkdir(path.join(out,'documents'),{recursive:true});
await writeFile(path.join(out,'documents/calmpa-full-report.pdf'),report);
await writeFile(path.join(out,'.nojekyll'),'');
console.log(`Built only the standalone Calmpa project in dist/. Full report verified: ${report.length} bytes, SHA-256 ${manifest.sha256}.`);
