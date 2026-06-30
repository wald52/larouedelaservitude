#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const jsFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (full.endsWith('.js') || full.endsWith('.mjs')) jsFiles.push(full);
  }
}

function rel(file) { return path.relative(root, file).replaceAll(path.sep, '/'); }

function checkImport(specifier, fromFile) {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) return;
  const base = specifier.startsWith('/') ? root : path.dirname(fromFile);
  const resolved = path.resolve(base, specifier);
  const candidates = path.extname(resolved) ? [resolved] : [`${resolved}.js`, `${resolved}.mjs`, path.join(resolved, 'index.js')];
  if (!candidates.some(existsSync)) {
    failures.push(`${rel(fromFile)} imports missing module "${specifier}"`);
  }
}

function scanJavaScript(file, source) {
  const staticImportRe = /import\s+(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImportRe = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
  const exportFromRe = /export\s+[^'";]+?\s+from\s+["']([^"']+)["']/g;
  for (const re of [staticImportRe, dynamicImportRe, exportFromRe]) {
    let match;
    while ((match = re.exec(source))) checkImport(match[1], file);
  }
}

function scanHtml(file) {
  const source = readFileSync(file, 'utf8');
  const scriptSrcRe = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = scriptSrcRe.exec(source))) checkImport(match[1], file);

  const moduleScriptRe = /<script\b(?=[^>]*\btype=["']module["'])[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = moduleScriptRe.exec(source))) scanJavaScript(file, match[1]);
}

walk(root);
for (const file of jsFiles) scanJavaScript(file, readFileSync(file, 'utf8'));
scanHtml(path.join(root, 'index.html'));

if (failures.length) {
  console.error('Import consistency check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Import consistency check passed (${jsFiles.length} JavaScript files + index.html).`);
