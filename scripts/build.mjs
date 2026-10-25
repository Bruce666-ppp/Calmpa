import { readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const data = JSON.parse(await readFile(path.join(root, 'content.json'), 'utf8'));
const contactForm = await readFile(path.join(root, 'contact-form.html'), 'utf8');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = value => { if (!/^https:\/\//.test(value)) throw new Error('External URLs must use HTTPS'); return esc(value); };
const todo = text => `<p class="${text.startsWith('TODO:') ? 'todo' : ''}">${esc(text)}</p>`;
const external = (href, label) => `<a class="text-link" href="${url(href)}">${esc(label)}</a>`;
const favicon = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#213d36"/><text x="32" y="43" text-anchor="middle" font-family="Georgia" font-size="35" fill="#faf7ef">W</text></svg>');
function page(title, description, body, active='work') {
 return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f7f5ee"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><title>${esc(title)}</title><link rel="icon" href="${favicon}" type="image/svg+xml"><link rel="stylesheet" href="styles.css"></head>
<body><a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="index.html" aria-label="Wan Boyang — home"><span class="monogram" aria-hidden="true">wb.</span><span>Wan Boyang</span></a><nav aria-label="Main navigation">${[['work','index.html','Work'],['about','about.html','About / Research'],['contact','contact.html','Contact']].map(([id,href,label])=>`<a href="${href}"${active===id?' aria-current="page"':''}>${label}</a>`).join('')}</nav></header>
<main id="main" tabindex="-1">${body}</main><footer><a class="footer-name" href="index.html">Wan Boyang</a><span>Industrial design · Innovative Design and Technology</span><a href="contact.html">Get in touch</a></footer>${active==='contact'?'<script src="contact.js" defer></script>':''}</body></html>`;
}
function graphic(p, large=false) {
 if(p.image) {
   if(!/^assets\/[a-zA-Z0-9/_.-]+$/.test(p.image) || p.image.includes('..') || !p.imageAlt) throw new Error('Use a local assets/ image and meaningful imageAlt');
   return `<div class="project-art photo ${large?'large':''}"><img src="${esc(p.image)}" alt="${esc(p.imageAlt)}"></div>`;
 }
 return `<div class="project-art art-${p.slug} ${large?'large':''}" aria-label="${esc(p.name)} typographic project cover"><span class="art-meta">${p.slug==='torras'?'WORKFLOW STUDY':'DESIGN STUDY'}</span><span class="art-title">${p.slug==='torras'?'~60<span class="percent">%</span>':esc(p.name)}</span><span class="art-bottom">${p.slug==='torras'?'Less time on related work':'Form / body / interaction'}</span><span class="art-note">Typographic cover · TODO: project imagery</span></div>`;
}
const projectCards = data.projects.map((p,i)=>p.slug==='kneeup' ? `<article class="project kneeup-home"><a class="cover-link" href="kneeup.html" aria-label="Explore KneeUp"><div class="kneeup-cover"><span class="art-meta">01</span><img src="assets/kneeup-concept.png" alt="KneeUp wearable knee support concept render"></div></a><div class="project-copy"><div class="eyebrow">2026 · Hackathon</div><h3><a href="kneeup.html">KneeUp</a></h3><p class="summary">${esc(p.summary)}</p><div class="contribution"><span class="small-label">MY CONTRIBUTION</span><p>I developed the I-shaped motion concept for the knee support and created the project’s promotional video.</p></div><a class="text-link" href="kneeup.html">Explore project <span class="sr-only">KneeUp</span></a></div></article>` : p.slug==='torras' ? `<article class="project torras-home"><a class="cover-link" href="torras.html" aria-label="Explore TORRAS"><div class="torras-cover"><span class="art-meta">02</span><img class="torras-update-image" src="assets/torras-industry-update.png" alt="Charging industry update covering Apple ecosystem news, regulations and industry standards" width="1298" height="729"><p class="torras-result">Industry updates · Visual workflow MVP</p></div></a><div class="project-copy"><div class="eyebrow">${esc(p.category)}</div><h3><a href="torras.html">TORRAS</a></h3><p class="summary">An AI-assisted industry intelligence and visual update workflow developed during my internship.</p><div class="contribution"><span class="small-label">MY CONTRIBUTION</span><p>I evaluated AI tools, refined the agent’s output format, tested Feishu table uploads and validated a visual update MVP using WorkBuddy and Lovart.</p></div><a class="text-link" href="torras.html">Explore project <span class="sr-only">TORRAS</span></a></div></article>` : p.slug==='polyband' ? `<article class="project polyband-home"><a class="cover-link" href="polyband.html" aria-label="Explore PolyBand"><div class="polyband-cover"><div class="polyband-cover-label"><span>03</span><span>Concept design</span></div><div class="polyband-modules"><img src="assets/polyband-body.png" alt="PolyBand white modular string instrument body concept render" width="1024" height="1536"><img src="assets/polyband-wind.png" alt="PolyBand wind module with colored keys" width="1024" height="1536"><img src="assets/polyband-percussion.png" alt="PolyBand drumsticks and three spatial locators" width="1024" height="1536"></div></div></a><div class="project-copy"><div class="eyebrow">Product concept · Interaction design</div><h3><a href="polyband.html">PolyBand</a></h3><p class="summary">A modular smart instrument concept that brings string, wind and percussion into one guided music experience.</p><div class="contribution"><span class="small-label">MY ROLE</span><p>Project lead · User research, product definition and concept direction</p></div><a class="text-link" href="polyband.html">Explore project <span class="sr-only">PolyBand</span></a></div></article>` : `<article class="project"><a class="cover-link" href="${p.slug}.html" aria-label="Explore ${esc(p.name)}">${graphic(p)}</a><div class="project-copy"><div class="eyebrow"><span>0${i+1}</span> ${esc(p.category)}</div><h3><a href="${p.slug}.html">${esc(p.name)}</a></h3><p class="summary">${esc(p.summary)}</p><div class="contribution"><span class="small-label">MY CONTRIBUTION</span>${todo(p.contribution)}</div>${p.slug==='torras'?`<p class="outcome">${esc(p.outcome)}</p>`:''}<a class="text-link" href="${p.slug}.html">Explore project <span class="sr-only">${esc(p.name)}</span></a></div></article>`);
const calmpaCard = `<article class="project calmpa-home"><a class="cover-link" href="calmpa/" aria-label="Explore Calmpa"><div class="calmpa-cover"><span class="art-meta">04</span><img src="calmpa/assets/prototype-hero.webp" alt="Calmpa's working desktop prototype with hinged radial petals and an ultrasonic sensor" width="1400" height="1050" loading="lazy"></div></a><div class="project-copy"><div class="eyebrow">Final-year project · Calm interaction</div><h3><a href="calmpa/">Calmpa</a></h3><p class="summary">A desktop companion that makes time at the desk visible through slow petal movement, inviting a gentle pause.</p><div class="contribution"><span class="small-label">MY ROLE</span><p>Research, interaction and product design, mechanism development, and physical prototyping for my individual final-year project.</p></div><a class="text-link" href="calmpa/">Explore project <span class="sr-only">Calmpa</span></a></div></article>`;
const cards = [projectCards[0], projectCards[2].replace('<span>03</span>', '<span>02</span>'), projectCards[1].replace('<span>02</span>', '<span>03</span>'), calmpaCard].join('');
await mkdir(out, {recursive:true});
await cp(path.join(root,'styles.css'),path.join(out,'styles.css'));
await cp(path.join(root,'contact.js'),path.join(out,'contact.js'));
await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'index.html'),page('Wan Boyang — Design, products & interaction','Selected projects by Wan Boyang: KneeUp, PolyBand, TORRAS and Calmpa, a calm desktop interaction prototype.',`
<section class="hero"><div><p class="eyebrow">PORTFOLIO / SELECTED WORK</p><h1>Turning human needs into <em>tangible product experiences.</em></h1><p class="intro">I’m Wan Boyang, an HKU IDT master’s student with a background in industrial design. My work spans wearable hardware, digital products, and AI-enabled tools—from research to prototype.</p><div class="hero-actions"><a class="button" href="#selected-work">Explore projects</a><a class="button" href="about.html">About me</a></div></div><aside class="hero-aside"><img class="hero-portrait" src="assets/wan-boyang.jpg" alt="Wan Boyang at the University of Hong Kong" width="4032" height="3024" fetchpriority="high"><div class="aside-line"></div><p class="small-label">EXPLORING OPPORTUNITIES IN</p><p>Product management<br>Design research<br>Human–computer interaction</p></aside></section>
<section id="selected-work" class="work-section"><div class="section-heading"><h2>Selected work</h2><p>01 — 04 / Projects & practice</p></div>${cards}</section>
`));
for (let i=0;i<data.projects.length;i++) {
const p=data.projects[i], next=data.projects[(i+1)%data.projects.length];
if (p.slug === 'kneeup') {
  await writeFile(path.join(out,'kneeup.html'), page('KneeUp — Wearable concept & motion | Wan Boyang', 'KneeUp wearable concept, I-shaped motion structure and promotional video by Wan Boyang.', await readFile(path.join(root,'kneeup-case.html'),'utf8')));
  continue;
}
if (p.slug === 'polyband') {
  await writeFile(path.join(out,'polyband.html'), page('PolyBand — Modular music concept | Wan Boyang', 'A team project exploring a modular instrument concept, companion app, MVP scope and physical mockup feedback.', await readFile(path.join(root,'polyband-case.html'),'utf8')));
  continue;
}
if (p.slug === 'torras') {
  await writeFile(path.join(out,'torras.html'), page('TORRAS — Industry intelligence workflow | Wan Boyang', 'How I researched, structured and tested an AI-assisted industry update workflow during my TORRAS internship.', await readFile(path.join(root,'torras-case.html'),'utf8')));
  continue;
}
await writeFile(path.join(out,`${p.slug}.html`),page(`${p.name} — Wan Boyang`,p.summary,`
<a class="breadcrumb" href="index.html#selected-work">All selected work</a><section class="detail-hero"><p class="eyebrow">PROJECT 0${i+1} / ${esc(p.category)}</p><h1>${esc(p.name)}</h1><p class="lead">${esc(p.summary)}</p><div class="project-actions">${p.repository?external(p.repository,'View GitHub repository'):''}${p.prototype?external(p.prototype,'Open prototype'):'<a class="text-link" href="#prototype">Prototype · TODO</a>'}</div></section>
${graphic(p,true)}<div class="case-layout"><aside class="case-index"><p class="small-label">PROJECT NOTES</p><nav aria-label="On this page"><a href="#context">01 / Context</a><a href="#contribution">02 / My contribution</a><a href="#process">03 / Design & process</a><a href="#outcomes">04 / Outcomes & evidence</a><a href="#prototype">05 / Prototype</a></nav></aside><div class="case-content"><section id="context"><p class="eyebrow">01 / CONTEXT</p><h2>The starting point</h2>${todo(p.context)}</section><section id="contribution"><p class="eyebrow">02 / MY CONTRIBUTION</p><h2>My part in the work</h2>${todo(p.contribution)}<p class="todo">TODO: Add dates, team context and ownership boundaries.</p></section><section id="process"><p class="eyebrow">03 / DESIGN & PROCESS</p><h2>Decisions, made visible</h2>${todo(p.process)}</section><section id="outcomes"><p class="eyebrow">04 / OUTCOMES & EVIDENCE</p><h2>${p.slug==='torras'?'Approximately 60% less time':'What the work shows'}</h2>${todo(p.outcome)}${todo(p.evidence)}</section><section id="prototype"><p class="eyebrow">05 / PROTOTYPE</p><h2>Explore the work</h2>${p.prototype?external(p.prototype,'Open interactive prototype'):'<p class="todo">TODO: Add a publicly accessible prototype or demo link. No prototype is linked yet.</p>'}${p.repository?`<p>${external(p.repository,'Browse the project repository')}</p>`:''}</section></div></div><div class="next-project"><span class="small-label">NEXT PROJECT</span><a href="${next.slug}.html">${esc(next.name)}</a></div>`));
}
await writeFile(path.join(out,'about.html'),page('About & Research — Wan Boyang','Wan Boyang’s education, research interests, team projects and design practice.',await readFile(path.join(root,'about-case.html'),'utf8'),'about'));
await writeFile(path.join(out,'contact.html'),page('Contact — Wan Boyang',"Have a project, opportunity, or idea in mind? I'd love to hear from you.",`<section class="contact-page"><div class="contact-intro"><p class="eyebrow">LET'S CONNECT</p><h1><span>Let's talk about</span><em>what's next.</em></h1><p class="lead">Have a project, opportunity, or idea in mind? I'd love to hear from you.</p></div><div class="contact-form-panel">${contactForm}</div></section>`,'contact'));
await writeFile(path.join(out,'404.html'),page('Page not found — Wan Boyang','This page could not be found.',`<section class="page-hero"><p class="eyebrow">404</p><h1>Nothing here.<br><em>Back to the work.</em></h1><a class="button" href="index.html">Return home</a></section>`));
console.log('Built 7 static HTML pages in dist/. Contact form JavaScript included; no package dependencies.');

// Calmpa: extend the existing portfolio build with an independent project page.
// The original report is stored in web-uploadable parts and restored without changes.
const calmpaSource = path.join(root, 'calmpa');
const calmpaOutput = path.join(out, 'calmpa');
const calmpaPartsDir = path.join(root, 'calmpa-report-parts');
const calmpaReportManifest = JSON.parse(await readFile(path.join(calmpaPartsDir, 'manifest.json'), 'utf8'));
const { createHash: calmpaCreateHash } = await import('node:crypto');
const calmpaSha256 = bytes => calmpaCreateHash('sha256').update(bytes).digest('hex');
const calmpaValidDigest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
if (calmpaReportManifest.version !== 1 ||
    calmpaReportManifest.output !== 'calmpa/documents/calmpa-full-report.pdf' ||
    !Number.isSafeInteger(calmpaReportManifest.bytes) || calmpaReportManifest.bytes <= 0 ||
    !calmpaValidDigest(calmpaReportManifest.sha256) ||
    !Array.isArray(calmpaReportManifest.parts) || calmpaReportManifest.parts.length === 0) {
  throw new Error('Calmpa: invalid full-report manifest.');
}
const calmpaReportBuffers = [];
for (const [index, part] of calmpaReportManifest.parts.entries()) {
  const expectedName = `report.part-${String(index + 1).padStart(2, '0')}`;
  if (part.file !== expectedName || !Number.isSafeInteger(part.bytes) || part.bytes <= 0 ||
      !calmpaValidDigest(part.sha256)) {
    throw new Error(`Calmpa: invalid report part metadata at position ${index + 1}.`);
  }
  const bytes = await readFile(path.join(calmpaPartsDir, part.file));
  if (bytes.length !== part.bytes || calmpaSha256(bytes) !== part.sha256) {
    throw new Error(`Calmpa: report part verification failed: ${part.file}.`);
  }
  calmpaReportBuffers.push(bytes);
}
const calmpaFullReport = Buffer.concat(calmpaReportBuffers);
if (calmpaFullReport.length !== calmpaReportManifest.bytes ||
    calmpaSha256(calmpaFullReport) !== calmpaReportManifest.sha256) {
  throw new Error('Calmpa: reconstructed full report failed verification.');
}
await cp(calmpaSource, calmpaOutput, { recursive: true });
const calmpaReportPath = path.join(out, 'calmpa', 'documents', 'calmpa-full-report.pdf');
await mkdir(path.dirname(calmpaReportPath), { recursive: true });
await writeFile(calmpaReportPath, calmpaFullReport);
console.log(`Built Calmpa in dist/calmpa/. Original report verified: ${calmpaFullReport.length} bytes, SHA-256 ${calmpaReportManifest.sha256}.`);
