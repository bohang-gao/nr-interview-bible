你在为「NR通信面试宝典」生成本批题目。先读项目根目录 PLAN.md 第 4 节（题目格式规范）与第 8 节（质量红线），严格遵守。

本章：第 {{CH_NUM}} 章「{{CH_NAME}}」，目录 docs/{{CH_DIR}}/。
本批生成第 {{START}} 至 {{END}} 题（共 {{COUNT}} 题），文件名 ch{{CH_NUM2}}-qNNN-<英文slug>.md，qNNN 三位数字从 {{START3}} 连续编号到 {{END3}}，slug 为小写英文与连字符。

题目清单（每行对应一题，按序落盘；标题可润色但不得偏离原意）：

{{TOPICS}}

本章特殊要求（NTN 章，基于 3GPP R17 规范撰写）：
0. 规范检索（必须）：本地规范索引命令 `python "D:/Download/code/3gpp/spec_search.py" <关键词> [--spec 规范号] [--limit N]`，索引含 R17 全套 38 系（309 文档/9.9 万段）。每题落盘前至少执行 2 次相关检索（如 K-offset 题搜 "K offset" --spec 38331 与 cellSpecificKoffset；TA 题搜 ta-Common --spec 38213），核对术语与参数后作答；检索结果与你的知识冲突时以检索到的规范原文为准
1. 每题 frontmatter 五字段齐全：title、chapter: {{CH_NUM}}、difficulty（易/中/难）、frequency（高/中/低）、tags（2-4 个中文标签，可含 NTN/卫星 等）
2. 正文四节顺序固定：## 一句话答案 / ## 详细展开 / ## 关联考点 / ## 面试追问；「详细展开」末尾加一行 **规范依据**：TS/TR 号 + 章节（写检索确认过的大方向，如 TS 38.331 §5.8；规范号必须真实，不确定具体小节就只写规范号，宁缺毋滥）
3. 术语规范：中文规范名 + 英文缩写首次出现给全称；数值（轨道高度、时延量级、频段号）符合 3GPP TR 38.821/38.811 通识
4. title 不得与本批其他题重复；只允许创建/修改本批 qNNN 范围内的文件
5. 若 python scripts/lint-content.py 报 error 且涉及本批文件，必须修到 0；其他章 warning 属分批构建正常
6. 不要运行站点构建，不要动 scripts/ 与 .vitepress/

完成后运行 python scripts/lint-content.py 确认 error 为 0。最后输出：本批创建的文件清单 + 每题使用的检索关键词一览 + lint 输出结尾。
