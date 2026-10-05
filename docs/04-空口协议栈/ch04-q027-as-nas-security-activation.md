---
title: AS 安全与 NAS 安全的激活时机与流程
chapter: 4
difficulty: 中
frequency: 中
tags: [安全, AS 安全, NAS 安全]
---

## 一句话答案

NAS 安全由 AMF 发起：鉴权完成后通过 SECURITY MODE COMMAND 激活，保护注册区内的所有 NAS 消息；AS 安全由 gNB 发起：在 RRC 重配置前用 SecurityModeCommand 激活，此后 SRB1 及后续 DRB 均受保护。顺序上 NAS 安全先于 AS 安全，AS 内部又是先 SRB（完整性+加密）后 DRB（加密为主）。

## 详细展开

**NAS 安全激活**：

- **发起方**：AMF（核心网侧）。
- **消息**：Security mode command（含选择的 NAS 算法与 KSI，密钥由 Kamf 派生 Knas-int/Knas-enc）→ UE 回 Security mode complete。
- **保护起点**：complete 消息本身即受新安全保护；激活前最初一两条 NAS（如注册请求）是明文。
- **覆盖范围**：UE 与 AMF 间所有 NAS 消息，跨 gNB/切换不重做（除非重新注册或 AMF 要求）。

**AS 安全激活**：

- **发起方**：gNB（在收到 AMF 下发的 UE 安全能力与 KgNB 后）。
- **流程**：gNB 下发 SecurityModeCommand（选定的 RRC 完整性/加密算法）→ UE 校验完整性并回复 SecurityModeComplete → 此后 SRB 消息带完整性与加密保护 → 网络再通过 RRCReconfiguration 建立 DRB（DRB 自建立起启用加密）。
- **完整性范围**：SRB 的 PDCP 全部受完整性保护；DRB 只加密不做完整性保护（性能权衡，靠 GTP-U/外层机制兜底）。
- **时机约束**：必须在建立任何 DRB 前完成；网络也会在此前后下发 UE 安全能力核对，防止降级攻击（比对 NAS 与 AS 上报的能力列表一致）。

**对比表**：

| 维度 | NAS 安全 | AS 安全 |
|---|---|---|
| 发起者 | AMF | gNB |
| 密钥源 | Kamf | KgNB |
| 保护对象 | NAS 消息（UE↔AMF） | SRB 全保护；DRB 仅加密 |
| 激活消息 | NAS SecurityModeCommand | RRC SecurityModeCommand |
| 持久性 | 注册期内持续有效 | 每次进入 CONNECTED 都要激活；切换/重建时密钥刷新 |

**异常处理**：UE 收到 SecurityModeCommand 校验完整性失败则丢弃并回建链失败路径，防止假基站用弱算法劫持。

## 关联考点

- [NR 安全密钥体系（K 到 KgNB/KAMF 的推导链）](ch04-q026-nr-key-hierarchy.md)
- [PDCP 加密与完整性保护范围（AS 层哪些加密哪些不加密）](ch04-q007-pdcp-ciphering-integrity.md)
- [NAS 注册流程要点（鉴权/安全模式/注册区域更新）](../05-关键信令流程/ch05-q013-nas-registration-flow.md)
- [SRB0–SRB3 的用途与差异](ch04-q024-srb0-to-srb3.md)

## 面试追问

- **为什么 DRB 不做完整性保护？** —— PDCP 完整性保护每包都要算 MAC-I，对大流量业务开销过大；且用户面数据在 GTP-U/传输网有外层校验，3GPP 因此只为 SRB 做完整性、DRB 仅加密（Rel-18 起讨论 UP 完整性但非空口 DRB 常态）。
- **AS 安全激活失败会怎样？** —— UE 不会用未受保护的方式继续，通常导致连接建立终止/释放，UE 回 IDLE 重新尝试；这是有意的失败即断，杜绝明文回退。
- **重建后 AS 安全要重新激活吗？** —— 不需要走 SecurityModeCommand：重建本身依赖安全上下文校验（重建请求受完整性保护），成功后沿用刷新后的密钥直接恢复保护，这正是"只有激活过安全才能重建"的原因。
