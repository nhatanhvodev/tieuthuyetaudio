import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'test-screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
});

const page = await context.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));

try {
  // 1. Homepage
  console.log('1. Homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(outDir, '01-homepage-mobile.png'), fullPage: false });
  console.log('   -> 01-homepage-mobile.png');

  const loginBtn = await page.$('text=Đăng nhập');
  const registerBtn = await page.$('text=Đăng ký');
  console.log(`   SiteHeader auth: Đăng nhập=${!!loginBtn}, Đăng ký=${!!registerBtn}`);

  // Check if user dropdown exists (when logged in)
  const userAvatar = await page.$('[data-user-menu]');
  console.log(`   User menu present: ${!!userAvatar}`);

  // 2. Scroll to see shelves
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(outDir, '02-homepage-scrolled-mobile.png'), fullPage: false });
  console.log('   -> 02-homepage-scrolled-mobile.png');

  // Check what series cards are rendered
  const cardLinks = await page.$$eval('a[href^="/truyen/"]', els => els.slice(0, 5).map(e => ({
    href: e.getAttribute('href'),
    text: e.textContent?.substring(0, 60)
  })));
  console.log(`   Series cards found: ${cardLinks.length}`);
  cardLinks.forEach(c => console.log(`     - ${c.href}: ${c.text}`));

  // 3. Navigate directly to a series detail page
  console.log('2. Series detail page...');
  if (cardLinks.length > 0) {
    const firstHref = cardLinks[0].href;
    await page.goto(`http://localhost:3000${firstHref}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(outDir, '03-series-detail-mobile.png'), fullPage: false });
    console.log(`   -> 03-series-detail-mobile.png (${firstHref})`);
  } else {
    console.log('   No series cards to navigate to');
  }

  // 4. Search page
  console.log('3. Search page...');
  await page.goto('http://localhost:3000/tim-kiem', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, '04-search-mobile.png'), fullPage: false });
  console.log('   -> 04-search-mobile.png');

  // 5. Genre page
  console.log('4. Genre page...');
  await page.goto('http://localhost:3000/the-loai', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, '05-genre-mobile.png'), fullPage: false });
  console.log('   -> 05-genre-mobile.png');

  // 6. Library/browse all page
  console.log('5. Library page...');
  await page.goto('http://localhost:3000/truyen', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, '06-library-mobile.png'), fullPage: false });
  console.log('   -> 06-library-mobile.png');

  // 7. Community page
  console.log('6. Community page...');
  await page.goto('http://localhost:3000/cong-dong', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, '07-community-mobile.png'), fullPage: false });
  console.log('   -> 07-community-mobile.png');

  // 8. MobileNav items
  console.log('7. MobileNav...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const navItems = await page.$$eval('nav a', els => els.map(e => e.textContent?.trim()));
  console.log(`   Items: ${JSON.stringify(navItems)} (count: ${navItems.length})`);

  // 9. MiniPlayer state
  const playerBar = await page.$('[class*="fixed"][class*="bottom"]');
  console.log(`   Player/bar fixed bottom: ${!!playerBar}`);

  // 10. Theme
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`   Theme: ${theme}`);

  // 11. Desktop full page
  console.log('8. Desktop viewport...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(outDir, '08-homepage-desktop.png'), fullPage: true });
  console.log('   -> 08-homepage-desktop.png');

  // 12. VIP page
  console.log('9. VIP page...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3000/vip', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, '09-vip-mobile.png'), fullPage: false });
  console.log('   -> 09-vip-mobile.png');

  // 13. Login page
  console.log('10. Login page...');
  await page.goto('http://localhost:3000/dang-nhap', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, '10-login-mobile.png'), fullPage: false });
  console.log('   -> 10-login-mobile.png');

  // 14. Story card hover effect (desktop)
  console.log('11. Story card hover...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const card = await page.$('a[href^="/truyen/"]');
  if (card) {
    await card.hover();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(outDir, '11-card-hover-desktop.png'), fullPage: false });
    console.log('   -> 11-card-hover-desktop.png');
  }

} finally {
  // Report
  console.log('\n=== ERRORS ===');
  if (errors.length === 0) {
    console.log('No console errors detected');
  } else {
    const unique = [...new Set(errors)];
    console.log(`${unique.length} unique error(s):`);
    unique.forEach((e, i) => console.log(`  ${i+1}. ${e.substring(0, 200)}`));
  }
  await browser.close();
}

console.log(`\nScreenshots: ${outDir}`);
