# NR 通信面试宝典

5G NR 面试知识库：**9 大知识域、320 题**（含 NTN 卫星通信章，题目附 3GPP 规范依据），VitePress 静态站点。

**在线阅读**：<https://bohang-gao.github.io/nr-interview-bible/>

功能：全文搜索 · 章节/难度/频率/标签筛选 · 每日一题 · 自测模式（抽题/记分/错题回顾）· 打印导出 PDF。

内容规格（目录结构、frontmatter 合同、章节题量）见 [PLAN.md](./PLAN.md)。

## 在线使用（任何设备，无需安装）

浏览器打开上面的在线地址即可；手机可「添加到主屏幕」当 App 用。

**导出 PDF**：站内「打印/PDF」页 → 点「打印 / 导出 PDF」→ 打印目标选「另存为 PDF」→ 勾选「背景图形」。

**自测**：站内「自测」页 → 选章节/难度/题量 → 逐题先自答再对答案 → 结束页看错题。

## 本地开发

```bash
git clone https://github.com/bohang-gao/nr-interview-bible.git
cd nr-interview-bible
npm install            # 安装依赖（Node ≥ 18）
npm run docs:dev       # 本地开发预览 http://localhost:5173
npm run docs:build     # 构建产物到 docs/.vitepress/dist
npm run docs:preview   # 预览构建产物
npm run docs:lint      # 内容校验（frontmatter / 标题查重 / 题量核对），加 --strict 更严
npm run docs:index     # 重新生成索引、章节目录、自测与打印数据（dev/build 前自动执行）
```

## 如何修改 / 新增题目

1. 题目文件在 `docs/<章目录>/chNN-qMMM-<slug>.md`，每题一个文件。
2. 格式（完整规范见 [PLAN.md](./PLAN.md) 第 4 节；章节划分与题量分配见第 5 节）：

   ```markdown
   ---
   title: 题目（全库唯一）
   chapter: 2              # 章号，须与目录编号一致
   difficulty: 中          # 易 | 中 | 难
   frequency: 高           # 高 | 中 | 低
   tags: [物理层, 帧结构]
   ---

   ## 一句话答案
   ## 详细展开
   ## 关联考点
   ## 面试追问
   ```

3. 改完自检并发布：

   ```bash
   npm run docs:lint       # 0 error 才继续
   git add -A && git commit -m "修正 ch02-q035"
   git push                # 推送后 GitHub Actions 自动构建，约 2 分钟线上生效
   ```

4. 新增一章：在 `docs/` 建目录 `NN-章名/`（含 `index.md`，带 `<!-- QUESTIONS-TOC:BEGIN/END -->` 标记），把题目文件放进去；然后同步两处配置——`docs/.vitepress/config.mts` 的 `chapters` 数组与 `scripts/lint-content.py` 的 `EXPECTED_COUNTS`——再本地跑 `npm run docs:index` 自动更新导读与索引。

## 站点功能说明

| 页面 | 说明 |
|---|---|
| `/bank` 题库 | 章节下拉 + 难度/频率单选 + 标签多选（AND 组合），数据来自 `docs/.vitepress/generated/questions.json` |
| `/daily` 每日一题 | 按日期 hash 确定性选题 + 随机换题 |
| `/selftest` 自测 | 章节/难度多选抽题，会/不会记分，错题回顾；数据来自 `generated/quiz.json` |
| `/print` 打印/PDF | 全库合并页，打印样式自动分页；由 `scripts/gen-print.mjs` 生成 |

`generated/*.json` 与 `docs/print.md` 均由 `npm run docs:index` 生成，**不要手改**。

## 部署

GitHub Pages + Actions：推送到 `main` 自动构建部署（工作流见 `.github/workflows/deploy.yml`，项目页以 `--base /nr-interview-bible/` 构建）。部署状态见仓库 Actions 页。

## 内容生成管线（维护者参考）

本项目内容由 Claude Code 分批生成（批次编排文件在 `.batches/`）：`chapters.json` 是全量题目设计清单，`gen-batch.py` 按模板生成批次提示词，`content-template.md` / `ntn-template.md` 为通用与 NTN 章模板（NTN 模板强制要求写题前用本地 3GPP 规范库 `spec_search.py` 检索核对）。复用该方法做新主题知识库时，参考 Hermes skill `claude-code-content-site`。
