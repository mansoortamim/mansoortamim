// Renders a LinkedIn image card (1080x1350, 4:5) from a JSON spec.
// Usage: node linkedin-agent/render_card.js spec.json out.png
// Spec: { "kicker": "...", "title": "...", "subtitle": "...",
//         "items": [{"head": "...", "body": "..."}], "footer": "...", "author": "..." }
const fs = require('fs');
const { chromium } = require('playwright');

const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function html(spec) {
  const items = (spec.items || []).map((it, i) => `
    <li><span class="n">${String(i + 1).padStart(2, '0')}</span>
      <div><div class="h">${esc(it.head)}</div>${it.body ? `<div class="b">${esc(it.body)}</div>` : ''}</div></li>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;font-family:Inter,sans-serif;background:#0f2540;color:#fff;
       display:flex;flex-direction:column;padding:88px 84px 72px}
  .k{font:600 26px Inter;letter-spacing:.14em;text-transform:uppercase;color:#7fb2e5}
  .t{font:800 78px/1.06 'Inter Display',Inter;letter-spacing:-.02em;margin-top:28px}
  .s{font:500 34px/1.35 Inter;color:#c9d8ea;margin-top:28px;max-width:860px}
  ul{list-style:none;margin-top:56px;display:flex;flex-direction:column;gap:22px}
  li{display:flex;gap:28px;align-items:flex-start;background:#16304f;border-left:6px solid #4f9be0;
     border-radius:10px;padding:26px 30px}
  .n{font:700 30px 'JetBrains Mono',monospace;color:#4f9be0;min-width:44px;padding-top:2px}
  .h{font:650 33px/1.25 Inter}
  .b{font:400 26px/1.35 Inter;color:#b5c7dc;margin-top:6px}
  .f{margin-top:auto;border-top:2px solid #2a4a70;padding-top:32px;display:flex;justify-content:space-between;align-items:flex-end;gap:40px}
  .fq{font:650 34px/1.3 Inter;color:#fff;max-width:720px}
  .a{font:500 24px Inter;color:#7fb2e5;white-space:nowrap}
  </style></head><body>
  ${spec.kicker ? `<div class="k">${esc(spec.kicker)}</div>` : ''}
  <div class="t">${esc(spec.title)}</div>
  ${spec.subtitle ? `<div class="s">${esc(spec.subtitle)}</div>` : ''}
  ${items ? `<ul>${items}</ul>` : ''}
  <div class="f"><div class="fq">${esc(spec.footer || '')}</div><div class="a">${esc(spec.author || '')}</div></div>
  </body></html>`;
}

(async () => {
  const [specPath, out] = process.argv.slice(2);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.setContent(html(spec), { waitUntil: 'load' });
  const overflow = await page.evaluate(() => document.body.scrollHeight > 1350);
  await page.screenshot({ path: out, type: out.endsWith('.jpg') ? 'jpeg' : 'png', quality: out.endsWith('.jpg') ? 92 : undefined });
  await browser.close();
  if (overflow) { console.error('WARNING: content overflows 1350px; shorten the text'); process.exit(2); }
  console.log('wrote', out);
})();
