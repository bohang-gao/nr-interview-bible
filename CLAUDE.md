# 项目规范（coding-style / development-workflow / git-workflow 落地）

本文件把三份规范文档固化为对每次会话生效的指令。完整版见同目录：
`coding-style.md`、`development-workflow.md`、`git-workflow.md`、`agents-and-commands.md`。

## 编码规范（coding-style）

- **不可变性**：始终创建新对象，绝不修改现有对象。`update(x, ...)` 返回新对象，不改 `x`。
- **文件组织**：多小文件 > 少大文件；200-400 行典型，**800 行硬上限**；按功能/领域组织，不按类型组织。
- **函数**：< 50 行；嵌套 ≤ 4 层（超了就早返回或提取）。
- **错误处理**：每层显式处理；UI 层友好提示、服务端详细日志；**绝不静默吞错**。
- **输入验证**：所有系统边界（用户输入、API 响应、文件内容）验证；优先 schema 验证；快速失败 + 清晰错误消息。
- **无硬编码**：值走常量或配置。

## 开发流程（development-workflow）

1. **研究先行**：实现前先搜仓库现有实现 → 查库文档（本地依赖真实版本优先）→ 找 80%+ 匹配的成熟方案，能复用不新写。
2. **先计划**：复杂功能用 /plan 产出计划，用户确认后才编码。
3. **TDD**：新功能/修 Bug 走 RED → GREEN → REFACTOR，覆盖率 80%+（/tdd）。
4. **审查**：代码写完立即审查（/code-review），CRITICAL/HIGH 必须修。
5. **提交**：通过 /verify 四关后按 Git 规范提交。

**多 Agent 分工**：backend-developer（后端）、frontend-developer（管理端）、mini-program-developer（小程序）、dba（数据库）、pm（拆卡）、code-reviewer（审查）、build-error-resolver（构建）。跨服务调用必须走接口层（如 Feign），禁止直接依赖调用。

## Git 规范（git-workflow）

```
<类型>: <描述 ≤72字符>

<正文：为什么改，引用 issue/任务编号>
```

类型：`feat` `fix` `refactor` `docs` `test` `chore` `perf` `ci`。

- 正文讲"为什么"，不只讲"改了什么"。
- PR：分析完整提交历史（不只最近一笔）、`git diff <base>...HEAD` 看全量、附测试计划。
- 不 amend 已推送提交；不加 `--no-verify`；不 force push 主干。

## 子员工约束（Hermes 派单场景）

- 卡的 assignee 必须是 `~/.claude/agents/` 里真实存在的 agent 名，带 `cc-` 前缀（防抢单）。
- 执行者只动卡面「文件域」内文件；「禁区」一律不碰。
- 零提交且零工作区变化 ≠ 完成，判 blocked。
