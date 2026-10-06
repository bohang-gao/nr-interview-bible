---
tags:
  - concept
  - development
  - ruoyi-claude
  - 编码规范
title: 编码规范 ruoyi-claude
type: concept
---

# 编码规范 — ruoyi-claude 项目

> 基于通用编码规范的 ruoyi-claude 项目适用准则
> 原始参考：[[wiki/concepts/development/development-workflow|开发流程]]

---

## 核心原则：不可变性

**始终创建新对象，绝不修改现有对象。**

```
// ❌ 错误：原处修改
modify(original, field, value) → 改变了 original

// ✅ 正确：返回新副本
update(original, field, value) → 返回新对象，original 不变
```

**理由**：不可变数据防止隐藏副作用，简化调试，支持安全并发。

---

## 文件组织

| 原则              | 说明          |
| --------------- | ----------- |
| **多小文件 > 少大文件** | 高内聚、低耦合     |
| **200-400 行**   | 典型文件大小      |
| **800 行上限**     | 单个文件最大行数    |
| **按功能/领域组织**    | 不按类型组织      |
| **提取工具类**       | 大幅模块中提取公共逻辑 |

---

## 错误处理

- 每层显式处理错误
- 用户界面 → 友好错误提示
- 服务端 → 详细日志上下文
- 绝不静默吞掉错误

---

## 输入验证

- 所有系统边界验证用户输入
- 使用基于 schema 的验证（可用时）
- 快速失败 + 清晰错误消息
- 绝不信任外部数据（API 响应、用户输入、文件内容）

---

## 质量检查清单

- [ ] 代码可读且命名良好
- [ ] 函数 < 50 行
- [ ] 文件 < 800 行
- [ ] 嵌套不超过 4 层
- [ ] 错误处理完整
- [ ] 无硬编码值（使用常量或配置）
- [ ] 无突变（使用不可变模式）

---

## 参考

- [[wiki/concepts/development/development-workflow|开发流程]]
- [[projects/english/_README|ruoyi-claude 项目架构]]
