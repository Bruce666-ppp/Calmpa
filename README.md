# Calmpa — Pause gently

Standalone Calmpa project website by Boyang Wan.

Public website: https://bruce666-ppp.github.io/Calmpa/
Repository: https://github.com/Bruce666-ppp/Calmpa

## Build and preview

```sh
npm run build
npm run check
npm run preview -- 4174
```

Edit `calmpa/index.html`, `calmpa/styles.css`, `calmpa/app.js` and the assets/documents inside `calmpa/`. `scripts/build.mjs` copies only that project into a fresh `dist/`, restores the original full report from `calmpa-report-parts/`, and checks the original SHA-256. `scripts/check.mjs` validates the standalone site and document links. GitHub Actions builds and deploys `dist/` on a push to `main`.

The original full report is `12211730万博扬FYP Report.pdf` (42 pages); the final poster is `海报终版.pdf` (3 sheets). Both document buttons open original PDFs in new tabs. Never edit the binary report parts; retain the complete manifest and both parts.

Keep `node_modules`, `.env`, credentials and generated output outside Git. Update the standalone source, run the build/check commands, and commit to this repository's `main` branch to publish.
