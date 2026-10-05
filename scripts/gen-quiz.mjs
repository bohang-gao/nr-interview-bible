#!/usr/bin/env node
// 扫描全部题目 md，抽取四个固定小节，生成 docs/.vitepress/generated/quiz.json
// 供 SelfTest.vue 自测组件使用：sections.{brief,detail,followups} 为 markdown-it 渲染后的 HTML
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const MarkdownIt = require('markdown-it');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const docsDir = path.join(root, 'docs');
const outDir = path.join(docsDir, '.vitepress', 'generated');
const outFile = path.join(outDir, 'quiz.json');

const questionsFile = path.join(outDir, 'questions.json');
if (!fs.existsSync(questionsFile)) {
  console.error('[gen-quiz] 缺少 questions.json，请先运行 gen-index.mjs');
  process.exit(1);
}
const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

const md = new MarkdownIt({ html: false, linkify: false, breaks: false });

// 把正文里的相对链接（.md 后缀）按「题目自身所在目录」解析为站内绝对路径。
// HTML 会在任意页面经 v-html 渲染，相对路径会错，故一律归一为 /章目录/文件名。
function toSiteAbsolute(href, dirName) {
  // 外链与锚点保持原样
  if (/^(https?:)?\/\//.test(href) || href.startsWith('#')) return href;
  // 站内绝对链接（/xx 开头）不动
  if (href.startsWith('/')) return href;
  const [p, hash] = href.split('#');
  if (!p.endsWith('.md')) return href; // 非题目文件，原样保留
  const resolved = path.posix.normalize(path.posix.join(dirName, p));
  return `/${resolved}${hash ? `#${hash}` : ''}`;
}

function rewriteLinks(markdown, dirName) {
  // 仅处理 () 内以 .md 结尾（可带 #锚点）的链接
  return markdown.replace(
    /\]\(([^)\s]+\.md)(#[^)\s]*)?\)/g,
    (whole, p, hash = '') => `](${toSiteAbsolute(p, dirName)}${hash})`
  );
}

// 抽取小节：## 一句话答案 / ## 详细展开 / ## 面试追问
// 「关联考点」不进自测，但也要作为切分边界，否则 detail 会横跨它
function extractSections(text, dirName) {
  const headings = [
    ['brief', '## 一句话答案'],
    ['detail', '## 详细展开'],
    ['skip', '## 关联考点'],
    ['followups', '## 面试追问'],
  ];
  const lines = text.split(/\r?\n/);
  // 定位各 heading 的行号，切分为 [headingLine+1, nextHeadingLine)
  const marks = [];
  for (const [key, marker] of headings) {
    const line = lines.findIndex((l) => l.trim() === marker);
    if (line < 0) fail(`题目缺少小节「${marker}」`);
    marks.push([key, line]);
  }
  marks.sort((a, b) => a[1] - b[1]);
  const sections = {};
  for (const [key, line] of marks) {
    if (key === 'skip') continue;
    const nextLine = marks
      .map(([, l]) => l)
      .filter((l) => l > line)
      .sort((a, b) => a - b)[0];
    const end = nextLine === undefined ? lines.length : nextLine;
    const chunk = lines
      .slice(line + 1, end)
      .join('\n')
      .trim();
    sections[key] = md.render(rewriteLinks(chunk, dirName)).trim();
  }
  return sections;
}

function fail(msg) {
  console.error(`[gen-quiz] ${msg}`);
  process.exit(1);
}

const items = [];

for (const q of questions) {
  const abs = path.join(docsDir, q.file);
  const text = fs.readFileSync(abs, 'utf8');
  const dirName = path.dirname(q.file);
  const sections = extractSections(text, dirName);
  for (const key of ['brief', 'detail', 'followups']) {
    if (!sections[key]) fail(`section ${key} 为空：${q.file}`);
  }
  items.push({
    id: q.id,
    title: q.title,
    url: q.url,
    chapter: q.chapter,
    chapterName: q.chapterName,
    difficulty: q.difficulty,
    frequency: q.frequency,
    sections,
  });
}

fs.mkdirSync(outDir, { recursive: true });
const payload = {
  count: items.length,
  generatedAt: new Date().toISOString(),
  items,
};
fs.writeFileSync(outFile, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(
  `[gen-quiz] 已生成 ${outFile}，共 ${items.length} 题（sections: brief/detail/followups）`
);
