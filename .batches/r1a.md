你是「NR通信面试宝典」的技术审校员。任务：只核对下面列出的 12 个题目文件中的数值与计算断言，产出报告。

待审文件（相对项目根）：
docs/01-无线基础与演进/ch01-q012-lte-nr-frame-structure-diff.md
docs/02-物理层/ch02-q001-frame-structure.md
docs/02-物理层/ch02-q002-numerology-scs.md
docs/02-物理层/ch02-q003-scs-slot-calculation.md
docs/02-物理层/ch02-q018-al-blind-decode.md
docs/02-物理层/ch02-q035-harq-process-rtt.md
docs/02-物理层/ch02-q043-prach-ro-calculation.md
docs/02-物理层/ch02-q045-timing-advance.md
docs/02-物理层/ch02-q048-rb-re-bandwidth-calc.md
docs/02-物理层/ch02-q050-ssb-vs-data-coverage.md
docs/02-物理层/ch02-q051-ul-alignment-guard-period.md
docs/02-物理层/ch02-q054-256qam-mcs-spectral-efficiency.md

工作方式（提高效率）：每轮并行读 3-4 个文件；每题至少 1 次 spec_search 检索关键参数（如 `python "D:/Download/code/3gpp/spec_search.py" numerology --spec 38211`、`blind decoding --spec 38213`、`nbPreamble` 等），检索结论与自己知识冲突时以规范原文为准；查不到的用通识判断并标「凭通识」。

判定：✅ 正确 / ⚠️ 存疑（数值偏差或表述不严谨）/ ❌ 错误（给出正确值与规范依据）。

产出（唯一允许写的文件：.batches/review-numeric-a.md，不得修改题目文件）：
1. 统计行：12 题中 ✅/⚠️/❌ 数量
2. ⚠️/❌ 逐条：文件名、断言摘录、规范依据（含检索词）、建议改法
3. 低优先级观察
最后 stdout：统计行 + ❌/⚠️ 文件名列表。
