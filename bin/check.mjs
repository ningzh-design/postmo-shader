#!/usr/bin/env node
// node bin/check.mjs <file.glsl>: runs a shader through Postmo's own import,
// declaration parser, renderer and loop check in headless Chrome, prints what
// it found (as plain lines an AI can read) and writes PNG frames to look at.
//
//   node bin/check.mjs examples/checker.glsl [--out dir] [--size 540x675] [--param key=value]… [--json] [--runner path-or-url]
//
// The renderer is Postmo's own, fetched from the site (https://postmo.pages.dev/kit/runner.js,
// or --runner / POSTMO_RUNNER) and cached, so the check always matches the live editor.
// Exit code 0 when the shader compiles, 1 when it does not, 2 on a usage error.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { homedir } from 'node:os';

const KIT_SYNTAX = 1;
const RUNNER = 'https://postmo.pages.dev/kit/runner.js';
const args = process.argv.slice(2);
if (args[0] === 'check') args.shift();
const usage = () => {
  console.error('Usage: node bin/check.mjs <file.glsl> [--out dir] [--size WxH] [--param key=value]… [--json] [--runner path-or-url]');
  process.exit(2);
};
const valued = new Set(['--out', '--size', '--param', '--runner']);
const file = args.find((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
if (!file) usage();
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const size = (opt('--size') ?? '540x675').match(/^(\d+)x(\d+)$/);
if (!size) usage();
const params = Object.fromEntries(args.flatMap((a, i) => (args[i - 1] === '--param' ? [a.split('=')] : [])).map(([k, v]) => [k, Number(v)]));
const json = args.includes('--json');
const stem = basename(file).replace(/\.[^.]+$/, '');
const outDir = resolve(opt('--out') ?? join('postmo-check', stem));

let playwright;
try { playwright = await import('playwright-core'); } catch {
  try { playwright = await import('playwright'); } catch {
    console.error('postmo-shader needs playwright-core: run npm install in the postmo-shader folder');
    process.exit(2);
  }
}
const code = await readFile(file, 'utf8');

// Postmo's renderer: a local file or a URL; from the site it is cached (and
// revalidated by ETag), so the check also works offline once it has run.
async function loadRunner() {
  const from = opt('--runner') ?? process.env.POSTMO_RUNNER ?? RUNNER;
  if (!/^https?:/.test(from)) return readFile(resolve(from), 'utf8');
  const dir = join(process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache'), 'postmo-shader');
  const cached = join(dir, 'runner.js'), tag = join(dir, 'runner.etag');
  const old = await readFile(cached, 'utf8').catch(() => null);
  const etag = old ? await readFile(tag, 'utf8').catch(() => '') : '';
  try {
    const res = await fetch(from, { headers: etag ? { 'If-None-Match': etag } : {} });
    if (res.status === 304 && old) return old;
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await res.text();
    await mkdir(dir, { recursive: true });
    await writeFile(cached, text);
    await writeFile(tag, res.headers.get('etag') ?? '');
    return text;
  } catch (err) {
    if (old) { console.error(`Could not reach ${from} (${err.message}); using the cached renderer`); return old; }
    console.error(`Could not fetch Postmo's renderer from ${from}: ${err.message}`);
    process.exit(2);
  }
}
const runner = await loadRunner();

// Google Chrome when installed (it has the GPU path); else Playwright's Chromium.
const launch = async () => {
  const flags = { headless: true, args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] };
  try { return await playwright.chromium.launch({ ...flags, channel: 'chrome' }); } catch {}
  try { return await playwright.chromium.launch(flags); } catch {
    console.error('No Chrome found: install Google Chrome, or run npx playwright install chromium');
    process.exit(2);
  }
};
const browser = await launch();
let result;
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0"><script>${runner.replace(/<\/script/g, '<\\/script')}</script></body>`);
  if (errors.length) throw new Error(errors.join('\n'));
  if (!(await page.evaluate(() => typeof window.postmoCheck === 'function'))) throw new Error('The renderer did not load');
  const syntax = await page.evaluate(() => window.postmoSyntax ?? 1);
  if (syntax > KIT_SYNTAX) console.error(`Postmo now reads declaration syntax ${syntax}; this kit knows ${KIT_SYNTAX}: git pull the newest kit`);
  result = await page.evaluate(([c, o]) => window.postmoCheck(c, o), [code, { width: +size[1], height: +size[2], params, name: stem }]);
} finally {
  await browser.close();
}

const written = [];
if (result.frames.length) {
  await mkdir(outDir, { recursive: true });
  for (const f of result.frames) {
    const name = `${{ 'frame 0': 'frame-0', '¼ loop': 'quarter-loop', '½ loop': 'half-loop' }[f.label] ?? f.label.replace(/[^a-z0-9]+/gi, '-')}.png`;
    const path = join(outDir, name);
    await writeFile(path, Buffer.from(f.png.split(',')[1], 'base64'));
    written.push([f.label, path]);
  }
}

if (json) {
  console.log(JSON.stringify({ ...result, frames: written.map(([label, path]) => ({ label, path })) }, null, 2));
} else {
  const lines = [];
  const from = { postmo: 'a Postmo shader', webgl1: 'WebGL 1 code (converted)', shadertoy: 'Shadertoy code (wrapped)', isf: 'ISF (converted)' }[result.format] ?? result.format;
  lines.push(`${basename(file)}: "${result.name}", ${from}`);
  for (const n of result.notes) lines.push(`  import: ${n}`);
  lines.push(result.compiled ? 'OK compiles' : 'FAIL does not compile');
  for (const e of result.errors) lines.push(`  error${e.line ? ` line ${e.line}` : ''}: ${e.message}`);
  if (result.params.length) {
    lines.push(`params (${result.params.length}): ${result.params.map(p => `${p.label} [${p.key}] ${p.min}–${p.max} step ${p.step} = ${p.value}${p.options ? ` (${p.options.join(', ')})` : ''}`).join('; ')}`);
  } else lines.push('params: none (declare some: uniform float x; // @param Label min max step default)');
  lines.push(result.colors.length ? `colours (${result.colors.length}): ${result.colors.map(c => `${c.label} ${c.value}`).join('; ')}` : 'colours: none (declare some: uniform vec3 c; // @color Label #rrggbb)');
  if (result.compiled) {
    lines.push(result.loop === 'loops' ? `OK loops seamlessly (seam ${result.seam.seam.toFixed(2)}, largest step ${result.seam.max.toFixed(2)})`
      : result.loop === 'time' ? 'NOTE plays over time with uTime (does not loop)'
      : `WARN does not loop: jumps at the loop point (seam ${result.seam.seam.toFixed(2)} > largest step ${result.seam.max.toFixed(2)})`);
    if (!result.moves) lines.push('NOTE nothing moves');
    if (result.seedChanges === false) lines.push('NOTE the seed does not change the picture (use snoise / hash12 / hash13, or seedJitter for placed shapes)');
    else if (result.seedChanges) lines.push('OK the seed changes the pattern');
    lines.push(`${result.msPerFrame > 50 ? 'WARN' : 'OK'} ${result.msPerFrame.toFixed(1)} ms per frame at ${size[1]}×${size[2]}${result.msPerFrame > 50 ? ' (heavy: it may stall the editor at full size)' : ''}`);
  }
  for (const a of result.advice) lines.push(`  advice${a.line ? ` line ${a.line}` : ''}: ${a.message}`);
  for (const [label, path] of written) lines.push(`frame ${label}: ${path}`);
  console.log(lines.join('\n'));
}
process.exit(result.compiled ? 0 : 1);
