# Wan Boyang — Portfolio + Calmpa

Complete static personal portfolio: homepage, KneeUp, PolyBand, TORRAS, About / Research, Contact, and the Calmpa case study. HTML, CSS, vanilla JavaScript and dependency-free Node.js scripts. Node.js 22 is used in GitHub Actions.

## Run locally

From this project folder:

```sh
npm run build
npm run check
npm run preview -- 4174
```

Open http://127.0.0.1:4174/. If npm is unavailable but Node.js is installed, run `node scripts/build.mjs`, `node scripts/check.mjs` and `node scripts/serve.mjs 4174` instead. Rebuild after editing; do not edit `dist/` directly.

## Source files

- `scripts/build.mjs`: generates the portfolio, copies Calmpa and restores its complete report.
- `scripts/check.mjs`: recursively checks all HTML, local links, anchors, media references, document buttons and report SHA-256.
- `scripts/serve.mjs`: local server with byte-range support for video/PDF.
- `content.json`, `*-case.html`, `styles.css`: portfolio content and styling.
- `contact-form.html`, `contact.js`: existing Formspree contact form.
- `assets/`: original portfolio images, KneeUp video and Portfolio.pdf.
- `calmpa/`: Calmpa HTML, CSS, JavaScript, original project imagery and public documents.
- `calmpa-report-parts/`: full original report in two binary files, each below the GitHub web upload file limit. Keep both parts and `manifest.json`. The build verifies each part and the restored PDF with SHA-256, then writes `dist/calmpa/documents/calmpa-full-report.pdf`. The source parts are not deployed.
- `.github/workflows/pages.yml`: builds, checks and deploys `dist/` on pushes to `main`.
- `dist/`: generated site, ignored by Git.

Original full report: `12211730万博扬FYP Report.pdf` (42 pages). Final poster: `海报终版.pdf` (3 sheets), stored as `calmpa/documents/calmpa-poster-final.pdf`. Report SHA-256: `1292e438921a4453bd22df173ae85d92bf7e91790ae21e128409c4e3eebc5064`.

## GitHub Pages

Target repository: https://github.com/Bruce666-ppp/Calmpa

Homepage after successful deployment: https://bruce666-ppp.github.io/Calmpa/

Calmpa case study: https://bruce666-ppp.github.io/Calmpa/calmpa/

In repository Settings → Pages, choose **GitHub Actions** as the source. Push complete source to `main`. The workflow builds and checks the site, then deploys `dist/`. If Pages is enabled after the first push, run **Deploy portfolio to GitHub Pages** manually in Actions.

All local links are relative and support the `/Calmpa/` project path. Details are standalone HTML documents (`kneeup.html`, `polyband.html`, `torras.html`, and `calmpa/index.html`) and support direct access and refresh.

Only this new Calmpa repository is a deployment target. The previous Wan repository is not modified.

## Update later

```sh
npm run build
npm run check
git remote -v
git add .
git commit -m "Update portfolio"
git push origin main
```

Confirm `origin` is `https://github.com/Bruce666-ppp/Calmpa.git` before pushing. Successful Actions runs update Pages automatically. Upload source files, not `dist/`, when using GitHub's website. Keep all folders intact.

## Contact form and public files

The existing public Formspree endpoint is retained. The browser validates email/message, disables repeat submissions, reports success only after the service accepts the message, and retains input after errors. Delivery depends on Formspree and its account/domain settings; mock testing does not confirm actual email delivery. Verify the new Pages domain in Formspree if your account restricts allowed domains. Do not place email passwords or private service keys in frontend files.

`.env`, `node_modules`, credentials, private key formats, generated output and local hosting configuration are excluded from Git. The full report and poster are intentionally public portfolio resources.
