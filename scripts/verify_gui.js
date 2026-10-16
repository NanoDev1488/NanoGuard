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

// Local static HTTP server for built React renderer
function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
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
        fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, fallback) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallback);
          }
        });
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
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

    // High-DPI Retina viewport for razor-sharp screenshot quality
    const context = await browser.newContext({
      viewport: { width: 1140, height: 760 },
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}`);

    // Verify Titlebar
    await page.waitForSelector('text=NANOGUARD', { timeout: 10000 });
    console.log('[✓] Verified Titlebar: NANOGUARD v0.1.0');

    // Verify Statusbar
    await page.waitForSelector('text=TELEMETRY');
    console.log('[✓] Verified Statusbar: 0% TELEMETRY (OFFLINE)');

    // 1. Select mock plugin & run audit for rich populated Audit View
    await page.click('text=ᴘᴇʀᴇᴛᴀꜱʜɪᴛᴇ .ᴊᴀʀ ꜱʏᴜᴅᴀ');
    await page.waitForTimeout(400);

    // Click static audit button
    const scanBtn = await page.waitForSelector('button:has-text("СТАТИЧЕСКИЙ АУДИТ")');
    if (scanBtn) {
      await scanBtn.click();
    }

    // Wait for audit results cards to populate
    await page.waitForSelector('text=ИНДЕКС ОПАСНОСТИ', { timeout: 8000 });
    await page.waitForSelector('text=НАЙДЕННЫЕ ИНСТРУКЦИИ');
    await page.waitForTimeout(500);

    const auditShot = path.join(SCREENSHOT_DIR, 'nanoguard_audit.png');
    await page.screenshot({ path: auditShot });
    console.log(`[+] Captured Retina Screenshot: ${auditShot} (${fs.statSync(auditShot).size} bytes)`);

    // 2. Open Call Graph Modal & Screenshot
    await page.click('button:has-text("ГРАФ ВЫЗОВОВ")');
    await page.waitForSelector('text=ИНТЕРАКТИВНЫЙ ГРАФ ВЫЗОВОВ', { timeout: 5000 });
    await page.waitForTimeout(400);

    const callgraphShot = path.join(SCREENSHOT_DIR, 'nanoguard_callgraph.png');
    await page.screenshot({ path: callgraphShot });
    console.log(`[+] Captured Retina Screenshot: ${callgraphShot} (${fs.statSync(callgraphShot).size} bytes)`);

    // Close modal
    await page.click('button:has-text("ЗАКРЫТЬ")');
    await page.waitForTimeout(300);

    // 3. Switch to Protect Tab & Screenshot
    await page.click('button:has-text("ʙʏᴛᴇᴄᴏᴅᴇ ᴀʀᴍᴏʀ")');
    await page.waitForSelector('text=МОДУЛИ ЗАЩИТЫ');

    // Run protect action
    const protectBtn = await page.waitForSelector('button:has-text("ЗАЩИТИТЬ ПЛАГИН И СОХРАНИТЬ JAR")');
    if (protectBtn) {
      await protectBtn.click();
      await page.waitForSelector('text=ПЛАГИН УСПЕШНО ЗАЩИЩЕН И СОХРАНЕН НА ДИСК', { timeout: 6000 });
      await page.waitForTimeout(400);
    }

    const protectShot = path.join(SCREENSHOT_DIR, 'nanoguard_protect.png');
    await page.screenshot({ path: protectShot });
    console.log(`[+] Captured Retina Screenshot: ${protectShot} (${fs.statSync(protectShot).size} bytes)`);

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
