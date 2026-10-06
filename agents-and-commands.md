
# Agent 与命令体系

> Claude Code 的全部子 Agent 和 slash 命令参考手册
> 适用项目：[[projects/english/_README|ruoyi-claude]]

---

## 全局 Agent 体系设计

### 层级结构

Agent 定义采用**两级优先级**体系：

```
~/.claude/agents/              # 全局 Agent（用户级，所有项目共享）
└── <agent-name>.md

<project>/.claude/agents/      # 项目 Agent（项目级，覆盖全局同名 agent）
└── <agent-name>.md
```

- **全局目录** `~/.claude/agents/`：所有项目共享
- **项目目录** `<project>/.claude/agents/`：可选的覆盖，优先级高于全局同名
- **查找顺序**：先找项目目录 → 没找到再找全局目录

### Agent 配置文件格式

每个 Agent 是一个 Markdown 文件，frontmatter 声明元数据，正文是系统指令：

```markdown
---
name: <agent-name>              # 必填，Agent 唯一标识符
description: <一句话描述>          # 必填，供用户/系统选择时识别用途
tools: <工具列表>                # 必填，该 Agent 可用的工具白名单
model: <模型类型>                # 可选，默认继承主会话模型
---

## 完成须知

<任何 Agent 启动时必须要做的事情>

# Agent Title — 中文职责标题

你是一名 <角色定义>，专门负责 <范围描述>。

## 技术栈                    # 可选

## 编码规范                    # 可选

## 注意事项                    # 可选
```

### 必填字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `name` | Agent 唯一 ID，用于 `Agent({ subagent_type: "..." })` 调用 | `backend-developer` |
| `description` | 用户可见的一句话描述 | `Java 后端开发工程师 — 负责 Spring Cloud 微服务...` |
| `tools` | 可用工具白名单 | `["Read", "Grep", "Glob", "Bash", "Write", "Edit", "Agent"]` |

### 模型选择策略

| 模型 | 适用场景 | Agent 示例 |
|------|----------|------------|
| `sonnet` | 主流开发工作（编码/审查/设计） | `backend-developer`, `code-reviewer`, `frontend-developer` |
| `haiku` | 低成本高频任务（项目经理/分类） | `project-manager` |
| `opus` | 深度推理/架构决策 | `planner`, `architect` |

### 全局 Agent 列表

| Agent                                  | 角色                          | 模型     | 工具                    |
| -------------------------------------- | --------------------------- | ------ | --------------------- |
| **backend-developer**                  | Java 后端开发（Spring Cloud 微服务） | sonnet | 读写+Agent              |
| **mini-program-developer**             | 微信小程序前端开发                   | sonnet | 读写+Agent              |
| **frontend-developer**                 | Vue 2 + Element UI 管理端开发    | sonnet | 读写+Agent              |
| **dba**                                | MySQL DBA — 数据库设计/迁移/优化     | sonnet | 读+SQL                 |
| **project-manager**                    | 项目经理 — 需求拆解/进度跟踪/风控         | haiku  | 读写+TodoWrite+Workflow |
| **code-reviewer**                      | 全栈代码审查/质量检测/安全审计            | sonnet | 只读+Agent              |
| **planner**                            | 实现计划制定专家                    | opus   | 只读                    |
| **architect**                          | 软件架构 — 系统设计/技术决策            | sonnet | 只读                    |
| **build-error-resolver**               | 构建错误修复                      | sonnet | 读写                    |
| **java-reviewer**                      | Java/Spring Boot 代码审查       | sonnet | 只读                    |
| **security-reviewer**                  | 安全漏洞检测/修复                   | sonnet | 读写                    |
| **doc-updater**                        | 文档和 Codemap 更新              | sonnet | 读写                    |
| **e2e-runner**                         | Playwright E2E 测试           | sonnet | 读写+浏览器                |
| **refactor-cleaner**                   | 死代码清理/重构                    | sonnet | 读写                    |
| **rust/go/python/cpp/kotlin-reviewer** | 各语言代码审查                     | sonnet | 只读                    |
| **java-build-resolver**                | Java/Maven/Gradle 构建错误修复    | sonnet | 读写                    |
| **rust/go/cpp/kotlin-build-resolver**  | 各语言构建错误修复                   | sonnet | 读写                    |
| **loop-operator**                      | 自主 Agent 循环监控               | sonnet | 读写                    |
| **chief-of-staff**                     | 沟通分诊（邮件/Slack/LINE）         | sonnet | 读写                    |
| **harness-optimizer**                  | Agent Harness 配置优化          | sonnet | 读写                    |
| **docs-lookup**                        | 库/框架文档查询                    | sonnet | 读+搜索                  |
| **tdd-guide**                          | TDD 强制方法论                   | sonnet | 读写                    |
| **tars**                               | 通用编程助手                      | sonnet | 读写                    |
|                                        |                             |        |                       |

### 项目级覆盖规则

```bash
mkdir -p <project>/.claude/agents/
cp ~/.claude/agents/backend-developer.md <project>/.claude/agents/
# 修改项目级 Agent 内容匹配本项目技术栈
# 项目级文件优先级高于全局同名
```

### 添加新 Agent 步骤

```bash
# 1. 创建全局 Agent 定义文件
cat > ~/.claude/agents/<name>.md << 'EOF'
---
name: <name>
description: <一句话职责描述>
tools: ["Read", "Grep", "Glob", "Bash", "Write", "Edit", "Agent"]
model: sonnet
---

# Agent Title

你是一名 <角色定义>...

## 技术栈

...

## 编码规范

...
EOF

# 2. 更新项目文档的全量 Agent 列表
```

### 设计原则

1. **全局先行**：Agent 定义优先放 `~/.claude/agents/`，所有项目共享
2. **项目按需覆盖**：仅当技术栈不同时创建 `.claude/agents/` 同名文件
3. **职责单一**：每个 Agent 只做一件事
4. **最小权限**：工具白名单给最小集
5. **模型匹配成本**：sonnet(开发) / haiku(PM) / opus(架构)
6. **审查强制**：开发者 Agent 完成须知中强制调用 code-reviewer

---

## Agent 新 Session 失效排查

### 常见症状

新开 session 后，Agent 调不通、并行派发不生效、子 agent 卡死。

### 排查三步

```bash
# 1️⃣ 验证 AGENT_TEAMS 开关
grep "AGENT_TEAMS" ~/.claude/settings.json

# 2️⃣ 验证 agent 注册文件
ls ~/.claude/agents/ | head -5

# 3️⃣ 验证权限模式
grep "defaultMode" ~/.claude/settings.json
```

| 检查项 | ✅ 正常输出 |
|--------|------------|
| AGENT_TEAMS | `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"` |
| agents 目录 | `backend-developer.md`, `code-reviewer.md` 等 |
| defaultMode | `"defaultMode": "bypassPermissions"` |

### 根因：`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 丢失

**现象：** 上一 session 能用，新 session 就不行了。`Agent` 工具的 `name`/`subagent_type` 参数不生效。

**常见丢失场景：**

| 场景 | 说明 |
|------|------|
| 代理工具链切换 | API proxy 重写 settings.json 排除了 `AGENT_TEAMS` |
| 手动编辑出错 | 修改 settings.json 误删了字段 |
| 版本升级回退 | Claude Code 升级重建 settings 丢失实验性开关 |
| 多设备同步冲突 | 旧版 settings 覆盖了新版 |

**修复：**

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "65536"
  },
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```

### 根因：项目无 `.claude/settings.json`

**现象：** 全局配置被覆盖时所有项目一起受影响。

**修复：** 为项目创建独立的 settings.json：

```bash
mkdir -p <project>/.claude/
cat > <project>/.claude/settings.json << 'EOF'
{
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
EOF
```

### 一行确认命令

```bash
CLAUDE_CODE=$(grep -c "AGENT_TEAMS.*1" ~/.claude/settings.json)
AGENTS_COUNT=$(ls ~/.claude/agents/*.md 2>/dev/null | wc -l)
PERM=$(grep -c "bypassPermissions" ~/.claude/settings.json)
echo "AGENT_TEAMS=$CLAUDE_CODE Agents=$AGENTS_COUNT Bypass=$PERM"
echo "STABLE=$([ $CLAUDE_CODE -gt 0 ] && [ $AGENTS_COUNT -gt 5 ] && [ $PERM -gt 0 ] && echo '✅' || echo '❌')"
```

### Agent 载入原理

1. **Claude Code 启动时**：读 `settings.json` 的 `env` 段，`AGENT_TEAMS=1` 启用隐式团队
2. **启动时**：扫描 `~/.claude/agents/*.md` 和 `project/.claude/agents/*.md`，注册可用 agent 类型
3. **用到 Agent 工具时**：按 `subagent_type` 查找对应 md 文件（文件名匹配）
4. **项目级覆盖**：项目目录有同名文件则用它，否则回退全局

### settings.json 配置速查

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```

---

## Slash 命令体系

通过 `/命令名` 在 Claude Code 中调用的快捷命令，定义在 `~/.claude/commands/`。

### 开发工作流

| 命令              | 功能                             | 用法        |
| --------------- | ------------------------------ | --------- |
| `/plan`         | 复述需求 → 评估风险 → 逐步计划，等确认后才写代码    | 复杂功能前     |
| `/tdd`          | 强制 TDD：RED → GREEN → 重构 → 80%+ | 新功能/Bug修复 |
| `/code-review`  | 全面安全+质量审查未提交变更                 | 代码写完后     |
| `/verify`       | 运行全面验证代码库状态                    | 提交前       |
| `/quality-gate` | 对文件或项目范围运行 ECC 质量流水线           | 发布前       |
| `/bug`          | 将发现的问题自动记录到 Obsidian Bug 清单    | 发现Bug时    |
| `/checkpoint`   | 创建工作流检查点（create/verify/list）   | 阶段完成时     |

### 语言专精

| 命令               | 语言     | 功能                        |
| ---------------- | ------ | ------------------------- |
| `/rust-build`    | Rust   | 修复构建/借用检查/依赖              |
| `/rust-review`   | Rust   | 所有权/生命周期/unsafe 审查        |
| `/rust-test`     | Rust   | TDD + cargo-llvm-cov 80%+ |
| `/go-build`      | Go     | 修复构建/vet/linter           |
| `/go-review`     | Go     | 惯用模式/并发安全/错误处理            |
| `/go-test`       | Go     | TDD + go test -cover 80%+ |
| `/kotlin-build`  | Kotlin | 修复构建/编译/依赖                |
| `/kotlin-review` | Kotlin | 惯用模式/空安全/协程               |
| `/kotlin-test`   | Kotlin | TDD + Kover 80%+          |
| `/cpp-build`     | C++    | 修复构建/CMake/链接             |
| `/cpp-review`    | C++    | 内存安全/现代C++/并发             |
| `/cpp-test`      | C++    | TDD + gcov/lcov           |
| `/python-review` | Python | PEP8/类型提示/安全              |
| `/gradle-build`  | Gradle | 修复 Android/KMP 构建         |

### 多模型协作

| 命令 | 功能 |
|------|------|
| `/multi-plan` | 多模型协作规划 — 上下文检索 + 双模型分析 |
| `/multi-workflow` | 多模型协作开发 — 前端→Gemini，后端→Codex |
| `/multi-backend` | 后端专注流程（研究→构思→计划→执行→优化→审查）|
| `/multi-frontend` | 前端专注流程 |
| `/multi-execute` | 多模型并行执行 |
| `/model-route` | 按任务复杂度推荐模型层级 |
| `/orchestrate` | 顺序/tmux/worktree 编排指导 |

### 并行与自主

| 命令 | 功能 |
|------|------|
| `/devfleet` | 通过 DevFleet 编排并行 Agent |
| `/loop-start` | 启动自主循环模式 |
| `/loop-status` | 检查循环状态 |
| `/pm2` | 自动分析项目生成 PM2 服务命令 |
| `/claw` | NanoClaw v2 REPL |
| `/aside` | 回答快速问题不中断当前任务 |

### 构建与修复

| 命令 | 功能 |
|------|------|
| `/build-fix` | 递增式修复构建和类型错误 |
| `/refactor-clean` | 安全识别和移除死代码 |
| `/harness-audit` | 运行仓库 Harness 审计 |

### 文档与知识

| 命令 | 功能 |
|------|------|
| `/docs` | 通过 Context7 查询最新文档 |
| `/update-codemaps` | 生成 token 精简的架构文档 |
| `/update-docs` | 根据源码同步文档 |
| `/skill-create` | 分析 Git 历史生成 SKILL.md |
| `/skill-health` | Skill 组合健康仪表板 |
| `/evolve` | 分析本能并生成进化结构 |
| `/learn` | 提取当前会话模式为 skill |
| `/prompt-optimize` | 优化草稿提示词 |
| `/eval` | 管理评测驱动开发工作流 |
| `/test-coverage` | 分析测试覆盖率达 80%+ |

### 会话管理

| 命令 | 功能 |
|------|------|
| `/save-session` | 保存会话状态到 `~/.claude/sessions/` |
| `/resume-session` | 恢复最近保存的会话 |
| `/sessions` | 管理会话历史、别名、元数据 |
| `/projects` | 列出已知项目和本能统计 |
| `/promote` | 项目级本能提升到全局 |
| `/instinct-export` | 导出本感到文件 |
| `/instinct-import` | 从文件导入本感到项目/全局 |
| `/instinct-status` | 查看本能状态 |

### E2E 与安全

| 命令 | 功能 |
|------|------|
| `/e2e` | 生成并运行 Playwright E2E 测试 |
| `/security-review` | 安全漏洞检测 |
| `/security-scan` | 安全扫描 |

---

## Agent 调用方式

### 方式一：Agent 工具（对话中派发）

```javascript
Agent({
  subagent_type: "backend-developer",
  prompt: "在 mall-moudle 新增 xxx 接口...",
  run_in_background: true
})

Agent({
  subagent_type: "code-reviewer",
  prompt: "审查 mall-moudle 的代码变更..."
})

Agent({
  subagent_type: "project-manager",
  prompt: "分解需求为任务..."
})
```

### 方式二：claude agent CLI 命令

> 需要先启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

```bash
claude agent list                          # 查看所有可用 agent
claude agent planner                       # 进入专用对话模式
claude agent backend-developer --prompt "" # 直接传任务
claude agent --bg backend-developer --prompt "" # 后台运行
claude agents                              # 查看后台运行中的 agent
claude agents --view                       # 可视化面板
```

### Workflow Subagent Dispatch

> 解决子 agent 后台权限弹窗无人确认卡死的问题

```
Agent 工具 → 子 agent → Edit/Write → 弹窗（无人确认） → ❌ 卡死
Workflow 脚本 → agent() → 子 agent → Edit/Write → ✅ 直接通过
```

```javascript
export const meta = {
  name: 'task-name',
  description: '任务一句话描述',
  phases: [{ title: 'Do' }]
}

phase('Do')
const result = await agent(
  '详细任务指令...',
  { label: 'task', agentType: 'backend-developer' }
)
return { result }
```

**并行：**

```javascript
phase('Parallel')
const [a, b] = await parallel([
  () => agent('任务1...', { label: 'task-1' }),
  () => agent('任务2...', { label: 'task-2' }),
])
return { a, b }
```

| 测试方式 | 子 agent 写文件 |
|----------|----------------|
| Agent 工具 `mode: default` | ❌ 弹窗卡住 |
| Agent 工具 `mode: bypassPermissions` | ❌ 弹窗卡住 |
| Agent 工具 `mode: dontAsk` | ❌ 弹窗卡住 |
| Agent 工具 `mode: auto` | ❌ 被 auto classifier 拒绝 |
| **Workflow 脚本 `agent()`** | ✅ **正常写入** |

### 方式三：/agent 内部命令

```
/agent planner
/agent code-reviewer
/agent backend-developer
```

### 调用 Slash 命令

```
/plan
/tdd
/code-review
/bug 模块: mall-mini-program | 分类页点击报错
```

---

## 参考

- [[wiki/concepts/development/development-workflow|开发流程]]
- [[wiki/concepts/development/coding-style|编码规范]]
- [[projects/english/_README|ruoyi-claude 项目架构]]
