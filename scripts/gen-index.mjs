#!/usr/bin/env node
// 扫描 docs 下各章节目录的 ch*-q*.md，解析 frontmatter，生成 docs/.vitepress/generated/questions.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const docsDir = path.join(root, 'docs');
const outDir = path.join(docsDir, '.vitepress', 'generated');
const outFile = path.join(outDir, 'questions.json');

// 章节：目录名 -> 章号（目录名形如 01-无线基础与演进）
const chapterDirs = fs
  .readdirSync(docsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\d{2}-/.test(d.name))
  .map((d) => d.name)
  .sort();

function fail(msg) {
  console.error(`[gen-index] ${msg}`);
  process.exit(1);
}

// 轻量容错解析 frontmatter：只支持 title/chapter/difficulty/frequency/tags（tags 为 [a, b] 流式数组）
function parseFrontmatter(text, relFile) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) fail(`文件缺少 frontmatter：${relFile}`);
  const lines = m[1].split(/\r?\n/);
  const data = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) fail(`frontmatter 行无法解析（${relFile}）：${line}`);
    const key = kv[1];
    let value = kv[2].trim();
    if (value === '[') {
      // 流式数组：跨行收集直到 ]
      const items = [];
      let j = i + 1;
      for (; j < lines.length; j++) {
        const t = lines[j].trim().replace(/,$/, '');
        if (t === ']') break;
        if (t) items.push(t.replace(/^['"]|['"]$/g, ''));
      }
      if (j >= lines.length) fail(`frontmatter tags 数组未闭合（${relFile}）`);
      data[key] = items;
      i = j;
    } else if (value.startsWith('[')) {
      // 单行数组 [a, b]
      if (!value.endsWith(']')) fail(`frontmatter 数组未闭合（${relFile}）：${key}`);
      const inner = value.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        : [];
    } else {
      // 标量：去掉包裹引号
      data[key] = value.replace(/^['"](.*)['"]$/, '$1');
    }
  }
  return data;
}

const entries = [];

for (const dirName of chapterDirs) {
  const chapter = parseInt(dirName.slice(0, 2), 10);
  const chapterName = dirName.slice(3);
  const files = fs
    .readdirSync(path.join(docsDir, dirName), { withFileTypes: true })
    .filter((f) => f.isFile() && /^ch\d{2}-q\d{3}-[a-z0-9-]+\.md$/.test(f.name))
    .map((f) => f.name)
    .sort();

  for (const file of files) {
    const relFile = path.posix.join(dirName, file);
    const abs = path.join(docsDir, dirName, file);
    const fm = parseFrontmatter(fs.readFileSync(abs, 'utf8'), relFile);
    for (const key of ['title', 'chapter', 'difficulty', 'frequency', 'tags']) {
      if (fm[key] === undefined || fm[key] === '') {
        fail(`frontmatter 缺少字段 ${key}：${relFile}`);
      }
    }
    const fmChapter = Number(fm.chapter);
    if (!Number.isInteger(fmChapter)) fail(`frontmatter chapter 非数字：${relFile}`);
    if (!Array.isArray(fm.tags)) fail(`frontmatter tags 不是数组：${relFile}`);
    const qnum = file.match(/^ch\d{2}-q(\d{3})-/)[1];
    entries.push({
      id: `ch${String(fmChapter).padStart(2, '0')}-q${qnum}`,
      file: relFile,
      url: `/${dirName}/${file.replace(/\.md$/, '')}`,
      title: fm.title,
      chapter: fmChapter,
      chapterName,
      qnum: Number(qnum),
      difficulty: fm.difficulty,
      frequency: fm.frequency,
      tags: fm.tags,
    });
  }
}

entries.sort((a, b) => a.chapter - b.chapter || a.qnum - b.qnum);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(entries, null, 2) + '\n', 'utf8');
console.log(`[gen-index] 已生成 ${outFile}，共 ${entries.length} 题`);
