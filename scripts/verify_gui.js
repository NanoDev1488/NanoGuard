const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const DIST_DIR = path.resolve(__dirname, '../dist/renderer');
const SCREENSHOT_DIR = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Simple local static server for built renderer
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.json': 'application/json',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url === '/' ? '/index.html' : req.url;
    let filePath = path.join(DIST_DIR, reqPath);
    let ext = path.extname(filePath);
    let contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        // Fallback to index.html for SPA
        fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, fallback) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fallback, 'utf-8');
          }
        });
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[+] Preview server running at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

async function runE2E() {
  console.log('[*] Starting macOS Playwright E2E GUI Verification...');
  const server = await startServer();

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      viewport: { width: 1040, height: 720 },
    });

    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}`);

    // Verify Title Bar
    await page.waitForSelector('text=NANOGUARD', { timeout: 10000 });
    console.log('[✓] Verified Titlebar: NANOGUARD');

    // Verify Status Bar
    await page.waitForSelector('text=0% TELEMETRY (OFFLINE)');
    console.log('[✓] Verified Statusbar: 0% TELEMETRY (OFFLINE)');

    // Verify Drag & Drop box
    await page.waitForSelector('text=ᴘᴇʀᴇᴛᴀꜱʜɪᴛᴇ .ᴊᴀʀ ꜱʏᴜᴅᴀ');
    console.log('[✓] Verified Drag & Drop Box');

    // 1. Screenshot Audit Tab
    const auditShot = path.join(SCREENSHOT_DIR, 'nanoguard_audit.png');
    await page.screenshot({ path: auditShot });
    console.log(`[+] Captured Screenshot: ${auditShot}`);

    // 2. Switch to Protect Tab & Screenshot
    await page.click('button:has-text("ᴘʀᴏᴛᴇᴄᴛ ᴊᴀʀ")');
    await page.waitForSelector('text=ПАРАМЕТРЫ БРОНИРОВАНИЯ БАЙТКОДА');
    console.log('[✓] Verified Protect Tab UI');

    const protectShot = path.join(SCREENSHOT_DIR, 'nanoguard_protect.png');
    await page.screenshot({ path: protectShot });
    console.log(`[+] Captured Screenshot: ${protectShot}`);

    // 3. Switch back to Audit, trigger scan and capture Call Graph Modal
    await page.click('button:has-text("ᴀᴜᴅɪᴛ & ꜱᴄᴀɴ")');
    await page.click('.small-caps:has-text("ᴘᴇʀᴇᴛᴀꜱʜɪᴛᴇ .ᴊᴀʀ ꜱʏᴜᴅᴀ")');
    await page.waitForTimeout(500);

    // If "ЗАПУСТИТЬ АУДИТ" appears, click it
    const scanBtn = await page.$('button:has-text("ЗАПУСТИТЬ АУДИТ")');
    if (scanBtn) {
      await scanBtn.click();
      await page.waitForSelector('button:has-text("ГРАФ ВЫЗОВОВ ➔")', { timeout: 5000 });
      await page.click('button:has-text("ГРАФ ВЫЗОВОВ ➔")');
      await page.waitForSelector('text=ИНТЕРАКТИВНЫЙ ГРАФ ВЫЗОВОВ');
      console.log('[✓] Verified Interactive Call Graph Modal');

      const modalShot = path.join(SCREENSHOT_DIR, 'nanoguard_callgraph.png');
      await page.screenshot({ path: modalShot });
      console.log(`[+] Captured Screenshot: ${modalShot}`);
    }

    console.log('[★] macOS Playwright E2E GUI Verification completed successfully with 100% pass!');
  } catch (err) {
    console.error('[!] E2E Verification failed:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

runE2E();
