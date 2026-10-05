---
title: EN-DC 双连接的基本概念与整体架构
chapter: 1
difficulty: 中
frequency: 高
tags: [EN-DC, 双连接, NSA]
---

## 一句话答案

EN-DC（E-UTRA-NR Dual Connectivity）指终端同时连接一个 LTE 主节点（MeNB, Master eNB）和一个 NR 辅节点（SgNB, Secondary gNB）的双连接架构，是 NSA（Option 3 系列）的空口实现基础。控制面由 MeNB 统一掌管（终端只有一条 RRC 连接），用户面可同时在 LTE 与 NR 上传输以聚合速率。

## 详细展开

双连接（DC, Dual Connectivity）的通用定义：终端（UE）在 RRC_CONNECTED 态下同时使用两个调度节点的无线资源，两个节点通过 Xn/X2 接口相连、至少一个共享同一核心网。EN-DC 是 DC 在"4G 锚点 + 5G 辅站"场景的特例（E-UTRA + NR）。

整体架构要素：

1. **节点角色**：
   - MeNB（Master eNB）：LTE 主节点，终结与 MME 的控制面（S1-MME），负责 RRC 连接与移动性管理。
   - SgNB（Secondary gNB）：NR 辅节点，提供 NR 用户面资源，通过 X2-C 接口与 MeNB 交互，通过 S1-U 直连 S-GW（或经 MeNB 中转）传输数据。
2. **接口**：
   - X2-C：MeNB 与 SgNB 之间的控制面接口，承载 SgNB 添加/修改/释放等流程消息。
   - S1-U：SgNB 用户面到 S-GW 的直接隧道（Option 3a/3x 部署下）。
3. **控制面原则**：终端只与 MeNB 有一条 RRC 连接；SgNB 生成 NR 侧的无线资源控制消息（SgNB 产生的 RRC 消息经 MeNB 转发给终端，即 NR RRC via E-UTRA RRC），终端向 SgNB 的反馈也由 MeNB 路由。
4. **用户面原则**：按承载类型决定走向——MCG bearer 只走 LTE、SCG bearer 只走 NR、split bearer 在 MeNB PDCP 层分拆同时走两侧（详见承载类型专题）。
5. **核心网视角**：MeNB 终结 S1-MME；用户面锚点在 S-GW，根据承载类型将数据发往 eNB 和/或 gNB。

时序上的典型动作：终端先在 LTE 上完成 RRC 连接与安全激活，随后 MeNB 通过 X2 发起 SgNB Addition，SgNB 完成 NR 侧配置后，终端开始使用 NR 资源。

一句话架构图（文字版）：

```
        S1-MME            S1-U
 MME ←—— MeNB ——→ S-GW ←—— SgNB
            |   X2-C / X2-U    ↑
            └————————UE————————┘
       （LTE+NR 空口同时连接）
```

## 关联考点

- EN-DC 控制面与用户面走向：[控制面与用户面](./ch01-q006-en-dc-cp-up.md)
- MCG/SCG/split bearer 区别：[承载类型](./ch01-q007-bearer-types.md)
- SCG 添加与变更流程：[SCG 流程](./ch01-q008-scg-procedures.md)
- Option 3/3a/3x 与 Option 2 差异：[部署选项](./ch01-q004-deployment-options.md)

## 面试追问

- **EN-DC 与普通载波聚合（CA）的区别是什么？** —— 要点：CA 的多个成员载波由同一个基站调度、只有一个 MAC 层；DC 有两个独立节点各自有 MAC/PHY，各自调度与 HARQ，节点间只需 Xn/X2 半静态协调；EN-DC 还叠加了跨 RAT（LTE+NR）这一维度。
- **终端为什么只有一条 RRC 连接？** —— 要点：保证移动性控制的单一权威（MeNB），避免双控制面冲突；SgNB 的 NR RRC 消息以容器方式嵌在 LTE RRC 中下发，测量报告也由 MeNB 收集后按需转发 SgNB。
- **SgNB 是否有独立的移动性控制权？** —— 要点：没有。SgNB 只能控制 NR 侧资源（如 SCG 内的移动性、波束管理），跨节点变更（SCG 变更/释放）由 MeNB 发起或经 MeNB 执行；SN 变更时可能涉及数据前传以保证无损。
