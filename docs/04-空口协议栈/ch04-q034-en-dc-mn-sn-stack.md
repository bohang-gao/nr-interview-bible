---
title: EN-DC 下主节点/辅节点协议栈的差异
chapter: 4
difficulty: 中
frequency: 中
tags: [EN-DC, 双连接, 协议栈]
---

## 一句话答案

EN-DC 中主节点（MN）是 LTE eNB、辅节点（SN）是 NR gNB，两节点各持一套完整协议栈，差异集中在：MN 侧控制面以 LTE RRC 为根（SIB/测量/移动性主责）、核心面锚在 EPC，SN 侧用 NR RRC 并可经 SRB3 直连 UE；用户面上谁终结 PDCP 决定承载形态，MN 终结为 MCG/split，SN 终结为 SCG 承载。

## 详细展开

**控制面对比**：

| 维度 | MN（LTE eNB） | SN（NR gNB） |
|---|---|---|
| RRC 版本 | E-UTRA RRC（主控） | NR RRC（辅控） |
| 核心接口 | S1-MME（MME） | S1-U/S-GW 用户面经 MN 汇聚；控制经 X2-C 由 MN 代理（SN 不直连 MME） |
| 系统广播 | 主小区广播 LTE SIB | NR 侧通过专用信令（NR RRC 消息封装 SNRadioBearerConfig 等）经 MN 转给 UE |
| UE 能力管理 | 汇总上报，含双连接能力 | 提供侧能力给 MN 汇总 |
| 移动性主控 | 小区切换/重定向决策在 MN | SN 侧变更（SCG 变更）由 SN 决策、MN 协调 |

**SRB3 的角色**：SN 侧测量上报（NR 邻区/波束）与 SN 内重配确认可走 SRB3 由 UE 直发 SN，不经 MN 转发；未配 SRB3 则全部走 LTE SRB1 由 MN 中转——这是 EN-DC 控制面时延优化的重要选项。

**用户面三种形态与协议栈落点**：

1. **MCG bearer**：PDCP 在 MN（可选用 LTE PDCP 或 NR PDCP 的选项差异对应不同部署），RLC/MAC/PHY 全在 LTE 腿。
2. **SCG bearer**：PDCP 在 SN（NR PDCP），数据经 MN 转发（S1-U 到 MN 再 X2-U 到 SN）后全走 NR 腿。
3. **Split bearer**：PDCP 在 MN，RLC 以下在两腿各一套，PDCP 分流聚合——Option 3x 以此为主，大流量走 NR 腿、控制与保底走 LTE 腿。

**安全/密钥差异**：MCG 承载用 MN 的 LTE 密钥体系（KeNB），SCG 承载用 SN 的 NR 密钥体系（S-KgNB 类），split 承载按 PDCP 所在节点取密钥——双连接下"一 UE 双密钥域"是面试常踩的坑。

**上层一致性**：NAS 永远只连 MME（经 MN）；SDAP 仅存在于 NR PDCP 之上的承载，LTE PDCP 承载没有 QFI 概念。

## 关联考点

- [EN-DC 双连接的基本概念与整体架构](../01-无线基础与演进/ch01-q005-en-dc-architecture.md)
- [MCG bearer、SCG bearer 与 split bearer 的区别及选择](../01-无线基础与演进/ch01-q007-bearer-types.md)
- [SRB0–SRB3 的用途与差异](ch04-q024-srb0-to-srb3.md)
- [DRB 与 QoS flow 的映射关系（含主辅节点拆分）](ch04-q025-drb-qos-flow-mapping.md)

## 面试追问

- **SN 有没有自己的核心网控制面连接？** —— 没有：EN-DC 下 SN 控制面经 X2-C 挂在 MN 下，S1-MME 只有 MN 连 MME；SN 的用户面可经 MN 中转（或部分部署经 MN 直 S1-U），这就是"MN 代理控制"的架构特点。
- **为什么 split 承载要求 PDCP 只在一侧？** —— PDCP 承担加密、SN 编号、重排序，若两侧各有一套会产生两套 SN 与两把密钥，接收端无法拼序；必须单点 PDCP 向下分流，RLC/MAC 独立并行才是合法结构。
- **SRB3 与 SN 变更的关系？** —— SCG 变更（换 SN 或换 SN 小区）通常由 SN 依据 SRB3 收到的 NR 测量上报快速决策，减少 MN 中转时延；没配 SRB3 时测量上报绕行 MN，变更决策链路更长。
