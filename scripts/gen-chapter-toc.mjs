#!/usr/bin/env node
// 把各章题目列表写入章节 index.md 的 QUESTIONS-TOC 标记之间（幂等）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const docsDir = path.join(root, 'docs');
const genFile = path.join(docsDir, '.vitepress', 'generated', 'questions.json');

function fail(msg) {
  console.error(`[gen-chapter-toc] ${msg}`);
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(genFile, 'utf8'));

const chapterDirs = fs
  .readdirSync(docsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\d{2}-/.test(d.name))
  .map((d) => d.name)
  .sort();

const BEGIN = '<!-- QUESTIONS-TOC:BEGIN -->';
const END = '<!-- QUESTIONS-TOC:END -->';

let touched = 0;
let skipped = 0;

for (const dirName of chapterDirs) {
  const chapter = parseInt(dirName.slice(0, 2), 10);
  const indexFile = path.join(docsDir, dirName, 'index.md');
  if (!fs.existsSync(indexFile)) {
    console.warn(`[gen-chapter-toc] 跳过（index.md 不存在）：${dirName}`);
    skipped++;
    continue;
  }
  const content = fs.readFileSync(indexFile, 'utf8');
  if (!content.includes(BEGIN)) {
    console.warn(`[gen-chapter-toc] 跳过（无 ${BEGIN} 标记）：${dirName}/index.md`);
    skipped++;
    continue;
  }

  const beginCount = content.split(BEGIN).length - 1;
  const endCount = content.split(END).length - 1;
  if (beginCount !== 1 || endCount !== 1) {
    fail(`章节 index.md 的 QUESTIONS-TOC 标记不配对或重复：${dirName}/index.md`);
  }
  const beginIdx = content.indexOf(BEGIN);
  const endIdx = content.indexOf(END);
  if (endIdx < beginIdx) {
    fail(`章节 index.md 的 QUESTIONS-TOC 标记顺序错误：${dirName}/index.md`);
  }

  const qs = questions.filter((q) => q.chapter === chapter);
  const lines = qs.map(
    (q) =>
      `- [${q.title}](${q.url}) — 难度${q.difficulty} · 频率${q.frequency}${
        q.tags.length ? ` · ${q.tags.join(' / ')}` : ''
      }`
  );
  const toc = `${BEGIN}\n${qs.length ? lines.join('\n') + '\n' : ''}${END}`;
  const next = content.slice(0, beginIdx) + toc + content.slice(endIdx + END.length);
  fs.writeFileSync(indexFile, next, 'utf8');
  touched++;
}

console.log(`[gen-chapter-toc] 更新 ${touched} 章，跳过 ${skipped} 章`);
