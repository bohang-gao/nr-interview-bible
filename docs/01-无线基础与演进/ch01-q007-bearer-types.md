---
title: MCG bearer、SCG bearer 与 split bearer 的区别及选择
chapter: 1
difficulty: 中
frequency: 高
tags: [EN-DC, 承载, MCG, SCG]
---

## 一句话答案

双连接下每个 E-RAB 按用户面走向分为三类：MCG bearer（主小区组承载）只走 LTE 主节点，SCG bearer（辅小区组承载）只走 NR 辅节点，split bearer（分拆承载）在锚点 PDCP 层分拆后同时走两侧。选择原则是：追求 NR 高速率用 SCG/split，强调业务连续性用 MCG/split，核心网侧分流不增加锚点负担用 SCG。

## 详细展开

以 EN-DC（Option 3 系列）为例，三类承载的完整对比：

| 维度 | MCG bearer | SCG bearer | split bearer |
|---|---|---|---|
| 用户面走向 | 仅 MeNB（LTE） | 仅 SgNB（NR） | MeNB PDCP 分拆，LTE+NR 并行 |
| 核心网连接 | S1-U 终结在 MeNB | S1-U 直连 SgNB | S1-U 终结在 MeNB |
| NR 侧速率贡献 | 无 | 全部 | 一部分 |
| SCG 失败时业务 | 不受影响 | 该承载业务中断（待重配恢复） | 数据自动回落 LTE 侧，不中断 |
| 锚点处理负担 | 无数据面分流 | 无 | 有（MeNB PDCP 复制分发） |
| 对应部署选项 | — | Option 3a 典型 | Option 3/3x 典型 |

补充两个延伸概念：

1. **NR 侧 split（Option 3x）**：split bearer 的变体——分流点仍在锚点侧 PDCP，但 NR 承担大流量。工程上常把"Option 3x 的 split bearer"与"3a 的 SCG bearer"对照记忆：前者锚点参与分流，后者完全不参与。
2. **PDCP 层是分界点**：无论哪种类型，两个节点的 MAC/PHY 完全独立，各自的 HARQ、调度互不干扰；分拆与聚合发生在 PDCP（分组数据汇聚协议，Packet Data Convergence Protocol）层，这正是双连接协议设计的关键——PDCP 之上"一个逻辑通道"，之下"两条腿走路"。

**选择逻辑**（网络侧决策，终端被动执行）：

- 默认策略：绝大多数流量应走 NR，因此 QCI=9 之类的默认承载通常配为 SCG bearer 或 split bearer。
- 语音/QCI=1 承载：NSA 下语音走 VoLTE，即 MCG bearer，天然保障连续性。
- NR 覆盖不稳或负载高的场景：配 split bearer，利用 NR 可用即加速、失效即回落的自适应特性。
- 锚点容量受限的热点场景：配 SCG bearer，绕过 MeNB 用户面。

面试时若被问"split bearer 与 SCG bearer 谁更好"，标准答法：split 用锚点资源换鲁棒性，SCG 用锚点零负担换单点依赖，取决于锚点容量与 NR 覆盖质量，无绝对优劣。

## 关联考点

- EN-DC 控制面与用户面走向：[控制面与用户面](./ch01-q006-en-dc-cp-up.md)
- Option 3/3a/3x 部署选项差异：[部署选项](./ch01-q004-deployment-options.md)
- SCG 添加、修改、变更与失败流程：[SCG 流程](./ch01-q008-scg-procedures.md)
- EN-DC 基本概念与架构：[EN-DC](./ch01-q005-en-dc-architecture.md)

## 面试追问

- **SCG bearer 对应的 NR 侧无线链路失败后，业务怎么办？** —— 要点：终端上报 SCG 失败信息（经 MeNB），MeNB 发起 SgNB 释放或重添加；期间 SCG bearer 数据缓存于 SgNB/MeNB 并尽可能前传（data forwarding），恢复后继续传输；split/MCG bearer 则始终有 LTE 兜底。
- **split bearer 的下行分流比例是固定的吗？** —— 要点：不是固定比例，由 MeNB PDCP 根据两条腿的调度结果/缓存状态动态分发；上行则由终端按网络下发的分流门限等参数决定。
- **为什么说 PDCP 层的设计使 DC 成为可能？** —— 要点：PDCP 提供按序递交、重排与安全功能，天然适合作为跨节点聚合点；RLC 以下各节点独立，避免了跨节点实时协同 MAC 调度的复杂度——这正是 DC 与 CA 的架构分界。
