---
tags: [concept, development, ruoyi-claude, 工作流]
title: 开发流程 ruoyi-claude
type: concept
---

# 开发流程 — ruoyi-claude 项目

> 基于通用开发工作流的 ruoyi-claude 项目实施流程
> 原始参考：[[wiki/concepts/development/git-workflow|Git 工作流]]

---

## 特性实现流程

### 0. 研究 & 复用（任何实现前必须执行）
- **GitHub 代码搜索优先**：实现前搜索现有代码
- **库文档其次**：使用 Context7 或官方文档确认 API 行为
- **Exa 最后**：前两者不足时使用 Exa
- **检查包注册表**：npm/PyPI/crates.io 等，优先使用成熟库
- **搜索可适配的实现**：开源项目中找到 80%+ 匹配的方案

### 1. 先计划
- 使用 **planner** agent 创建实施计划
- 编码前输出规划文档：PRD、架构图、系统设计、技术文档、任务列表
- 识别依赖和风险
- 分解为多个阶段

### 2. TDD 方法
- 使用 **tdd-guide** agent
- 先写测试（RED）
- 实现以通过测试（GREEN）
- 重构（IMPROVE）
- 验证 80%+ 覆盖率

### 3. 代码审查
- 编写代码后立即使用 **code-reviewer** agent
- 处理 CRITICAL 和 HIGH 问题
- 尽可能修复 MEDIUM 问题

### 4. 提交 & 推送
- 详细的提交消息
- 遵循常规提交格式（参见 Git 工作流）

---

## ruoyi-claude 专属规范

### 子 agent 分工

| Agent | 职责 |
|-------|------|
| backend-developer | Java 后端（Controller/Service/Mapper/Feign/Nacos） |
| mini-program-developer | 微信小程序前端 |
| frontend-developer | Vue 2 管理端前端 |
| dba | MySQL 数据库设计/迁移/优化 |
| project-manager | 需求分解/任务分配/进度跟踪 |
| code-reviewer | 代码审查 |
| build-error-resolver | 构建错误修复 |

### 跨服务调用
- 必须通过 `mall-api` 模块的 Feign 接口
- 禁止直接依赖调用

### 数据库访问
- 使用 MCP Server 中的 MySQL 连接服务

### 版本记录
- 每次修改文件时，记录修改内容及版本号到 `version.md`

---

## 参考

- [[wiki/concepts/development/coding-style|编码规范]]
- [[wiki/concepts/development/git-workflow|Git 工作流]]
- [[projects/english/_README|ruoyi-claude 项目架构]]
