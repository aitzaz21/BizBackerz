/**
 * Generates client/public/og-image.jpg at 1200×630 px.
 *
 * Uses the system Chrome installation + puppeteer-core.
 * Run from the project root:
 *   node scripts/generate-og-image.js
 */

const path    = require('path')
const fs      = require('fs')
const puppeteer = require(path.join(__dirname, '..', 'node_modules', 'puppeteer-core'))

const CHROME    = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const LOGO_PATH = path.join(__dirname, '..', 'client', 'public', 'logo', 'navbar.png')
const OUT_PATH  = path.join(__dirname, '..', 'client', 'public', 'og-image.jpg')

async function generate() {
  const logoB64 = fs.readFileSync(LOGO_PATH).toString('base64')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1200px; height: 630px;
      overflow: hidden;
      background: #030912;
      font-family: 'Poppins', 'Inter', system-ui, sans-serif;
      position: relative;
    }

    /* Grid */
    .grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(42,139,255,0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(42,139,255,0.045) 1px, transparent 1px);
      background-size: 65px 65px;
    }

    /* Glow orbs */
    .glow-a {
      position: absolute; top: -120px; left: -120px;
      width: 620px; height: 620px; border-radius: 50%;
      background: radial-gradient(circle, rgba(42,139,255,0.16) 0%, transparent 65%);
    }
    .glow-b {
      position: absolute; bottom: -100px; right: -100px;
      width: 520px; height: 520px; border-radius: 50%;
      background: radial-gradient(circle, rgba(56,217,169,0.11) 0%, transparent 65%);
    }
    .glow-c {
      position: absolute; top: 50%; right: 8%; transform: translateY(-50%);
      width: 220px; height: 220px; border-radius: 50%;
      background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%);
    }

    /* Accent lines */
    .line-top    { position: absolute; top: 0;    left: 0; right: 0; height: 3px;
                   background: linear-gradient(90deg, rgba(42,139,255,0.85), rgba(56,217,169,0.6), transparent); }
    .line-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
                   background: linear-gradient(90deg, transparent, rgba(42,139,255,0.45), rgba(56,217,169,0.3), transparent); }

    /* Domain badge — top-right corner */
    .badge {
      position: absolute; top: 28px; right: 36px;
      padding: 5px 14px; border-radius: 100px;
      background: rgba(42,139,255,0.1);
      border: 1px solid rgba(42,139,255,0.22);
      font-size: 12px; font-weight: 600;
      color: rgba(82,173,255,0.8);
      letter-spacing: 0.12em;
    }

    /* Live indicator — top-left */
    .live {
      position: absolute; top: 32px; left: 36px;
      display: flex; align-items: center; gap: 7px;
      font-size: 11px; font-weight: 700;
      color: rgba(56,217,169,0.7);
      letter-spacing: 0.18em; text-transform: uppercase;
    }
    .live-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #38d9a9;
      box-shadow: 0 0 10px #38d9a9;
    }

    /* Main content */
    .content {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center;
      padding: 80px 80px 60px;
    }

    /* Logo */
    .logo {
      height: 112px; width: auto;
      margin-bottom: 28px;
      object-fit: contain;
    }

    /* Wordmark */
    .wordmark {
      font-weight: 800; font-size: 76px;
      color: #f1f5f9;
      letter-spacing: 0.07em;
      line-height: 1; margin-bottom: 14px;
    }

    /* Gradient divider */
    .divider {
      width: 380px; height: 2px; margin: 0 auto 18px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(42,139,255,0.8) 20%,
        rgba(56,217,169,0.55) 70%,
        transparent 100%);
    }

    /* Tagline */
    .tagline {
      font-weight: 500; font-size: 13px;
      color: rgba(255,255,255,0.32);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      margin-bottom: 32px;
    }

    /* Service pills */
    .pills { display: flex; gap: 9px; justify-content: center; flex-wrap: wrap; }
    .pill {
      padding: 5px 14px; border-radius: 100px;
      background: rgba(42,139,255,0.07);
      border: 1px solid rgba(42,139,255,0.16);
      font-size: 10px; font-weight: 600;
      color: rgba(82,173,255,0.85);
      letter-spacing: 0.05em; white-space: nowrap;
    }
    .pill.teal {
      background: rgba(56,217,169,0.07);
      border-color: rgba(56,217,169,0.16);
      color: rgba(56,217,169,0.85);
    }
  </style>
</head>
<body>
  <div class="grid"></div>
  <div class="glow-a"></div>
  <div class="glow-b"></div>
  <div class="glow-c"></div>
  <div class="line-top"></div>
  <div class="line-bottom"></div>

  <div class="live"><div class="live-dot"></div>Virtual Assistance</div>
  <div class="badge">bizbackerz.com</div>

  <div class="content">
    <img class="logo"
      src="data:image/png;base64,${logoB64}"
      alt="BizBackerz" />
    <div class="wordmark">BIZBACKERZ</div>
    <div class="divider"></div>
    <div class="tagline">Delegate to Dominate</div>
    <div class="pills">
      <span class="pill">Admin Support</span>
      <span class="pill teal">Social Media</span>
      <span class="pill">Lead Generation</span>
      <span class="pill teal">Customer Support</span>
      <span class="pill">Content Creation</span>
      <span class="pill teal">Accounting</span>
    </div>
  </div>
</body>
</html>`

  console.log('Launching Chrome…')
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })

    /* Small pause so custom fonts fully paint */
    await new Promise(r => setTimeout(r, 1200))

    await page.screenshot({
      path:    OUT_PATH,
      type:    'jpeg',
      quality: 92,
      clip:    { x: 0, y: 0, width: 1200, height: 630 },
    })

    console.log('OG image saved →', OUT_PATH)
  } finally {
    await browser.close()
  }
}

generate().catch(err => {
  console.error('Failed to generate OG image:', err.message)
  process.exit(1)
})
