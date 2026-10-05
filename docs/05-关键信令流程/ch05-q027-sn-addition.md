---
title: SN Addition 辅节点添加流程与信令
chapter: 5
difficulty: 中
frequency: 高
tags: [SN Addition, EN-DC, SCG]
---

## 一句话答案

SN Addition（辅节点添加）是主节点（MN）为 UE 增加辅节点（SN）以建立 SCG 的流程，EN-DC 下即 eNB 通过 X2 向 gNB 请求添加 SgNB。核心信令为 SgNB Addition Request/Acknowledge，其中 SgNB 内部生成 SCG 配置容器，由 MN 通过 RRCConnectionReconfiguration（EN-DC 下为 LTE 的 RRC 连接重配置，携带 NR 的辅小区组配置）下发给 UE，UE 回复后 MN 通知 SN 完成添加，随后 UE 与 NR 侧建立同步并可开始收发数据。

## 详细展开

**1. 流程步骤（EN-DC 视角，MN = eNB，SN = SgNB）**

1. **触发条件**：LTE 锚点侧收到 NR 邻区测量报告（EN-DC 下典型为 B1 事件：NR 邻区好于门限），或负载/策略触发；
2. **MN → SN**：经 X2/Xn 发 **SgNB Addition Request**，携带 UE 能力（含 NR 能力）、SCG 承载需求、MN 侧安全密钥 S-KgNB 衍生输入、测量结果等；
3. **SN 准备资源**：做接纳控制，分配 NR 侧资源（SpCell/SCG SCell 配置、随机接入配置），生成 SCG 配置容器（NR RRCReconfiguration 消息），回 **SgNB Addition Request Acknowledge**；
4. **MN 下发空口配置**：MN 将 SN 的容器嵌入 **RRCConnectionReconfiguration**（LTE RRC 消息，内含 nr-SecondaryCellGroupConfig 与 SCG 承载配置）发给 UE；SCG 承载若为 split/SCG 类型，还需完成 PDCP 层面的承载变更；
5. **UE 接入 NR**：UE 按专用随机接入配置在 PSCell 上发起免竞争随机接入（CFRA），与 NR 取得上行同步；
6. **完成通知**：UE 回 RRCConnectionReconfigurationComplete 给 MN；MN → SN 发 **SgNB Reconfiguration Complete**（含 UE 在 NR 侧的 C-RNTI），SN 开始调度，流程结束。

**2. 关键点**

| 关键点 | 说明 |
|---|---|
| 密钥 | MN 依据自身密钥衍生 S-KgNB 传给 SN，SN 生成自己的 AS 安全上下文，与 MN 相互独立 |
| 承载形态 | 可配 MCG bearer（不加 SN 承载，仅控制面 SCG）、split bearer 或 SCG bearer，决定 NR 侧是否分担用户面 |
| 测量前提 | EN-DC 添加依赖 LTE 侧配置的 NR 测量（B1/B3 事件 + 测量 GAP），测量不到 NR 就无从添加 |
| SN 侧随机接入 | 走 CFRA（专用前导码），避免与 NR 小区内其他 CBRA 用户冲突，接入更快 |

**3. SA 下的对应流程**

SA（NR 独立组网）下的对应概念是"NR 内 SN Addition"（CU/DU 架构或 NR-NR 双连接），信令逻辑同构：MN 通过 Xn 请求、SN 回容器、MN 融合后经 RRCReconfiguration 下发、UE 在 PSCell 随机接入完成。

## 关联考点

- SCG 流程总览：[SCG 添加、修改、变更与失败的典型流程](../01-无线基础与演进/ch01-q008-scg-procedures.md)
- EN-DC 架构：[EN-DC 双连接的基本概念与整体架构](../01-无线基础与演进/ch01-q005-en-dc-architecture.md)
- 添加失败处理：[SCG failure 流程与失败信息上报](ch05-q034-scg-failure-report.md)

## 面试追问

- **SN Addition 时 UE 需要重新做安全激活吗？** —— 要点：不需要完整重做。MN 衍生 S-KgNB 传给 SN，SN 侧自行建立 AS 安全（PDCP 加密/完整性保护），对 NAS 层透明；UE 侧由 MN 通知后按 SN 的安全配置处理 SCG 承载，MN 与 SN 的安全上下文相互独立。
- **如果 UE 一直测不到 NR 小区，SN Addition 会怎样？** —— 要点：流程根本不会触发——EN-DC 添加以 B1 事件测量报告为前提；需排查 LTE 侧是否配置了 NR 邻频点测量、测量 GAP 是否分配、NR 小区 SSB 是否可检测、以及终端能力是否支持 EN-DC 组合。
- **SN Addition 和载波聚合加 SCell 有什么区别？** —— 要点：CA 加 SCell 是同一 gNB 内增加载波，配置经一条 RRC 消息即可，无跨节点信令与独立密钥；SN Addition 是跨节点（跨 gNB）添加小区组，涉及 X2/Xn 协商、独立安全上下文、独立调度器与 PDCP 分拆决策，复杂度高一个量级。
