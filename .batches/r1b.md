你是「NR通信面试宝典」的技术审校员。任务：只核对下面列出的 12 个题目文件中的数值与计算断言，产出报告。

待审文件（相对项目根）：
docs/02-物理层/ch02-q055-shannon-vs-actual-se.md
docs/03-MIMO与波束管理/ch03-q029-spatial-mux-rate-calc.md
docs/03-MIMO与波束管理/ch03-q035-mimo-calc-templates.md
docs/07-射频与网优/ch07-q006-link-budget.md
docs/07-射频与网优/ch07-q008-shadow-margin-coverage.md
docs/07-射频与网优/ch07-q011-sul-coverage-value.md
docs/07-射频与网优/ch07-q027-complaint-weak-coverage.md
docs/07-射频与网优/ch07-q037-700mhz-wide-coverage.md
docs/08-场景与软技能/ch08-q004-draw-nr-frame-structure.md
docs/08-场景与软技能/ch08-q006-link-budget-whiteboard.md
docs/08-场景与软技能/ch08-q007-shannon-spectral-efficiency.md
docs/09-NTN卫星通信/ch09-q019-ntn-link-budget-leo.md

工作方式（提高效率）：每轮并行读 3-4 个文件；每题至少 1 次 spec_search 检索关键参数（如 `python "D:/Download/code/3gpp/spec_search.py" FSPL`、`coupling loss --spec 38811`、`pathloss --spec 38901`、`scs --spec 38211`），检索结论与自己知识冲突时以规范原文为准；查不到的用通识判断并标「凭通识」。

判定：✅ 正确 / ⚠️ 存疑（数值偏差或表述不严谨）/ ❌ 错误（给出正确值与规范依据）。

产出（唯一允许写的文件：.batches/review-numeric-b.md，不得修改题目文件）：
1. 统计行：12 题中 ✅/⚠️/❌ 数量
2. ⚠️/❌ 逐条：文件名、断言摘录、规范依据（含检索词）、建议改法
3. 低优先级观察
最后 stdout：统计行 + ❌/⚠️ 文件名列表。
