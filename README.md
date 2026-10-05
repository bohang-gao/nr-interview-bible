# NR 通信面试宝典

5G NR 面试知识库：8 大知识域、约 300 题，VitePress 静态站点，支持全文搜索与题库筛选。规格见 [PLAN.md](./PLAN.md)。

## 快速开始

```bash
npm install            # 安装依赖（Node ≥ 18）
npm run docs:dev       # 本地开发预览 http://localhost:5173
npm run docs:build     # 构建产物到 docs/.vitepress/dist
npm run docs:preview   # 预览构建产物
npm run docs:lint      # 内容校验（frontmatter / 查重 / 题量）
```

## 内容格式

题目为 Markdown + YAML frontmatter，文件命名与格式规范见 [PLAN.md](./PLAN.md) 第 4 节；章节划分与题量分配见第 5 节。新增题目后运行 `npm run docs:index` 重新生成索引与章节目录。
