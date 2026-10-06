# NR 通信面试宝典 — 实现方案

> 状态：已评审定稿 · 执行方式：Hermes 编排 + Claude Code 分批生成

## 1. 目标与形态

- **产品**：NR(5G) 通信面试知识库，约 300 题，覆盖 8 大知识域，全覆盖均衡（按面试频率加权）
- **形态**：VitePress 静态文档站（本地 dev 预览，产物可部署 GitHub Pages / Vercel）
- **功能**：全文搜索、难度/频率标签筛选、每日一题/随机抽题页
- **内容**：AI 生成（3GPP 术语规范），用户人工审核把关

## 2. 技术栈

| 组件 | 选型 |
|---|---|
| 站点框架 | VitePress 1.x（Node ≥ 18） |
| 搜索 | 内置 local search（minisearch，中文可配） |
| 筛选/抽题 | 自定义 Vue 组件 + 构建期生成的 questions.json 索引 |
| 内容 | Markdown + YAML frontmatter（内容与展示分离） |
| 校验 | Node 脚本生成索引 + Python 脚本 lint frontmatter/查重 |

## 3. 目录结构

```
hermes_prj/
├── package.json                # docs:dev / docs:build / docs:index 脚本
├── PLAN.md                     # 本文件
├── scripts/
│   ├── gen-index.mjs           # 扫描 frontmatter → questions.json
│   ├── gen-chapter-toc.mjs     # 生成各章导读页题目列表
│   └── lint-content.py         # frontmatter 完整性 / title 查重 / 题量核对
└── docs/
    ├── .vitepress/
    │   ├── config.mts          # 导航、侧边栏、local search
    │   ├── theme/index.ts      # 自定义组件注册
    │   └── generated/questions.json   # 构建期生成，勿手改
    ├── index.md                # 首页（hero + 快速入口）
    ├── bank.md                 # 题库总索引（筛选器组件）
    ├── daily.md                # 每日一题/随机抽题
    └── 01-无线基础与演进/
        ├── index.md            # 本章导读 + 题目列表
        └── ch01-q001-lte-to-nr.md ...   # 每题一个文件
```

## 4. 题目格式规范（frontmatter 合同）

文件名：`chNN-qMMM-<英文slug>.md`（三位题号，章内递增，保证排序与 diff 稳定）

```markdown
---
title: 什么是 NR 的参数集（Numerology）？
chapter: 2
difficulty: 中        # 易 | 中 | 难
frequency: 高         # 高 | 中 | 低
tags: [物理层, 帧结构]
---

## 一句话答案
（30 秒口播版，2-3 句，先给结论）

## 详细展开
（原理 + 参数 + 示例，必要时用表格/公式，控制在 300-800 字）

## 关联考点
- 相邻知识点链接（相对路径）

## 面试追问
- **追问1？** —— 答题要点
```

## 5. 章节与题量分配（共 302）

| 章 | 主题 | 题量 |
|---|---|---|
| 1 | 无线基础与演进：LTE→NR 演进、SA/NSA、EN-DC、FR1/FR2 | 30 |
| 2 | 物理层：帧结构/numerology、BWP、信道与信号、调制编码 | 56 |
| 3 | MIMO 与波束管理：massive MIMO、波束赋形、QCL、CSI 反馈 | 35 |
| 4 | 空口协议栈：SDAP/PDCP/RLC/MAC/PHY、RRC 状态、HARQ/ARQ | 40 |
| 5 | 关键信令流程：随机接入、寻呼、测量与切换、RRC 重配 | 40 |
| 6 | 组网与架构：CU/DU 分离、5GC、网络切片、QoS 流 | 30 |
| 7 | 射频与网优：AAU、功控、KPI 指标、常见问题排查 | 40 |
| 8 | 场景与软技能：项目经验话术、中英术语对照、手撕概念题 | 31 |
| 9 | NTN 卫星通信：轨道/链路、时延与多普勒补偿、NTN 流程与场景 | 20 |

## 6. 站点功能实现要点

- **搜索**：`config.mts` 启用 `themeConfig.search.provider: 'local'`，配置中文分词参数
- **筛选**：`gen-index.mjs` 在 dev/build 前扫描全部题目 → `questions.json`（title/path/chapter/difficulty/frequency/tags）；`bank.md` 内嵌 Vue 筛选组件（章节、难度、频率、tag 多选，客户端过滤）
- **每日一题**：`daily.md` —— 按当日日期 hash 确定性选题（同一天所有人同题）+ "换一题"随机按钮 + 原题跳转
- **章节导读**：`gen-chapter-toc.mjs` 生成每章 `index.md` 的题目列表（链接 + 难度/频率徽标）

## 7. 执行计划（Claude Code 分批，共 13 批）

| 阶段 | 内容 | 批次数 |
|---|---|---|
| P0 | 脚手架：package.json、config、theme、示例题 2 道、lint/索引脚本 | 1 |
| P1–P9 | 各章内容生成（每批 ≤30 题，print mode，大章拆批） | 11 |
| P10 | 筛选页 + 每日一题页 + 章节导读生成 | 1 |
| P11 | `docs:build` 验证、断链检查、题量核对 | 1 |

**单批执行模式**：

```
claude -p "<批任务提示词：本章清单+格式规范+文件名规则>"
  --allowedTools Read,Write,Edit,Glob --max-turns 40
```

**批后校验（Hermes 自动）**：`lint-content.py` 检查 frontmatter 完整性、title 查重、题量计数 → 不合格仅重跑该批，失败不扩散。

## 8. 质量红线

- 术语：统一 3GPP 中文规范名，英文缩写首次出现给全称，如"混合自动重传请求（HARQ, Hybrid Automatic Repeat reQuest）"
- 数值（峰值速率、时延、频段号、子载波间隔）须符合 3GPP 38 系列通识；不确定的规范表号不引用
- 生成内容由用户人工审核，审核意见作为补批回灌

## 9. 验收标准

- [x] 题目全部落盘且 lint 通过，章题量与第 5 节一致
- [x] `npm run docs:dev` 正常，搜索可用
- [x] 筛选页、每日一题页功能正常
- [x] `npm run docs:build` 零报错、无断链

## 10. 建成后使用

```
npm install
npm run docs:dev      # http://localhost:5173
npm run docs:build    # 产物 docs/.vitepress/dist
```
