#!/usr/bin/env node
// 把全部题目合并生成 docs/print.md（打印 / 导出 PDF 专用页，构建期生成物，勿手改）
// 链接处理：相对 .md 链接改写为相对 docs/ 根的路径（保留 .md 后缀，VitePress 编译期重写）；
// 站内绝对链接（/xx 开头）不动。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const docsDir = path.join(root, 'docs');
const outFile = path.join(docsDir, 'print.md');

const questionsFile = path.join(docsDir, '.vitepress', 'generated', 'questions.json');
if (!fs.existsSync(questionsFile)) {
  console.error('[gen-print] 缺少 questions.json，请先运行 gen-index.mjs');
  process.exit(1);
}
const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

function fail(msg) {
  console.error(`[gen-print] ${msg}`);
  process.exit(1);
}

// 相对 docs/ 根的 .md 链接：./y.md 或 ../NN-目录/y.md → ./NN-目录/y.md
function rewriteForPrint(markdown, dirName) {
  return markdown.replace(
    /\]\(([^)\s]+\.md)(#[^)\s]*)?\)/g,
    (whole, p, hash = '') => {
      if (p.startsWith('/')) return whole; // 站内绝对链接不动
      if (/^(https?:)?\/\//.test(p)) return whole; // 外链不动
      const resolved = path.posix.normalize(path.posix.join(dirName, p));
      return `](./${resolved}${hash})`;
    }
  );
}

// 提取 frontmatter 之后的正文
function bodyOf(text, relFile) {
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!m) fail(`文件缺少 frontmatter：${relFile}`);
  return text.slice(m[0].length).replace(/^\s+/, '');
}

const parts = [];

for (const q of questions) {
  const abs = path.join(docsDir, q.file);
  const text = fs.readFileSync(abs, 'utf8');
  const dirName = path.dirname(q.file);
  const body = rewriteForPrint(bodyOf(text, q.file), dirName);
  parts.push(
    `# ${q.chapterName} · ${q.title}\n\n` +
      `> 难度：${q.difficulty} ｜ 频率：${q.frequency}\n\n` +
      body.trim() +
      '\n'
  );
}

const header = [
  '---',
  'title: 打印/导出PDF',
  'outline: [2]',
  '---',
  '',
  `本页收录全部 ${questions.length} 题的完整解析，专供打印或导出 PDF 离线使用。`,
  '',
  '<PrintExport />',
  '',
].join('\n');

fs.writeFileSync(outFile, header + parts.join('\n---\n\n'), 'utf8');
console.log(`[gen-print] 已生成 ${outFile}，共 ${parts.length} 题`);
