import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FRAMES_DIR = path.join(ROOT, 'docs', 'frames');
const OUT_GIF = path.join(ROOT, 'docs', 'demo.gif');
const URL = 'http://localhost:3001';

mkdirSync(FRAMES_DIR, { recursive: true });

let frameIndex = 0;
async function shot(page, label = '') {
  const file = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(4, '0')}.png`);
  await page.screenshot({ path: file, fullPage: false });
  frameIndex++;
  if (label) console.log(`  📸 ${label}`);
  return file;
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Repeat a frame N times to control display duration in the GIF
async function hold(page, ms, label = '') {
  const steps = Math.max(1, Math.round(ms / 150));
  for (let i = 0; i < steps; i++) await shot(page, i === 0 ? label : '');
}

async function deleteAllTasks(page) {
  while (true) {
    const btn = page.locator('text=remover').first();
    if (!(await btn.isVisible().catch(() => false))) break;
    await btn.hover();
    await btn.click();
    await wait(600);
  }
}

async function run() {
  console.log('🎬 Launching browser…');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 800, height: 680 } });
  const page = await ctx.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });
  await wait(500);

  // ── Clear the board ───────────────────────────────────────────────────────
  await deleteAllTasks(page);

  // ════════════════════════════════════════════════════════════════════════════
  // PARTE 1 — Tarefa manual (sem IA)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n📌 Part 1: Manual task (sem IA)');
  await hold(page, 800, 'initial state');

  const titleInput = page.locator('input[placeholder*="Revisar"]');
  await titleInput.click();
  await hold(page, 300, 'clicked title input');

  const manualTask = 'Revisar o relatório mensal';
  for (const char of manualTask) {
    await titleInput.type(char, { delay: 30 });
    if (frameIndex % 4 === 0) await shot(page);
  }
  await hold(page, 400, 'typed manual task');

  await page.locator('button:has-text("Adicionar")').click();
  await wait(1200);
  await hold(page, 600, 'task added');

  // Mark as complete
  const checkbox = page.locator('li').filter({ hasText: manualTask }).locator('button').first();
  await checkbox.click();
  await wait(700);
  await hold(page, 800, 'task completed');

  // ════════════════════════════════════════════════════════════════════════════
  // PARTE 2 — Geração com IA
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n🤖 Part 2: AI generation');

  const goalInput = page.locator('input[placeholder*="Docker"]');
  await goalInput.click();
  await hold(page, 300, 'clicked goal input');

  const goal = 'Aprender Docker do zero';
  for (const char of goal) {
    await goalInput.type(char, { delay: 35 });
    if (frameIndex % 4 === 0) await shot(page);
  }
  await hold(page, 400, 'typed goal');

  await page.locator('button:has-text("Gerar")').click();
  await hold(page, 300, 'clicked Gerar');

  // Wait for spinner then for results (up to 30s)
  console.log('  ⏳ Waiting for AI response…');
  for (let i = 0; i < 60; i++) {
    await wait(500);
    await shot(page);
    const hasIA = await page.locator('text=IA').first().isVisible().catch(() => false);
    if (hasIA) break;
  }
  await hold(page, 1200, 'AI tasks appeared');

  // scroll down to show all tasks
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  await hold(page, 800, 'scrolled to bottom');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await hold(page, 600, 'scrolled back to top');

  await browser.close();

  // ── Build GIF with ffmpeg ─────────────────────────────────────────────────
  console.log('\n🎞  Building GIF with ffmpeg…');
  const ffmpegCmd = [
    'ffmpeg -y',
    `-framerate 8`,
    `-pattern_type glob -i "${FRAMES_DIR}/frame_*.png"`,
    `-vf "fps=8,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer"`,
    `"${OUT_GIF}"`,
  ].join(' ');

  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`\n✅ GIF saved to: ${OUT_GIF}`);
}

run().catch(err => { console.error(err); process.exit(1); });
