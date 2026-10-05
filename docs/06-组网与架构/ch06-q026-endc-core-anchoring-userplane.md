---
title: EN-DC 双连接下的核心网锚定与用户面走向
chapter: 6
difficulty: 难
frequency: 中
tags: [EN-DC, NSA, 锚点, 用户面]
---

## 一句话答案

EN-DC（E-UTRA-NR Dual Connectivity）是 NSA 组网形态：eNB 为主节点（MN，Master Node）连 EPC，gNB 为辅节点（SN，Secondary Node），NR 不直接连核心网。控制面始终锚定在 MeNB（走 MME），用户面则可有两条支路：MCG 承载经 eNB 走 EPC，SCG 承载直接从 gNB 经 S1-U 到 SGW/PGW——即 NR 侧用户面可以"抄近道"直连核心网，不必绕经 eNB。

## 详细展开

**1. 控制面走向（全锚定在 eNB）**

- UE 与 MeNB 之间是 RRC（SRB1/SRB2），gNB 侧的 SRB3 可选存在（仅处理 NR 侧部分测量/重配，减轻 MeNB 负担，但 RRC 终点仍在 MeNB）。
- NAS 信令终点在 MME，路径：UE → MeNB → MME。
- MeNB 与 SgNB 之间走 X2-C：SN 添加/修改/释放、SCG 变更等由 MeNB 决策发起（MeNB 是"总指挥"）。

**2. 用户面走向（承载体类型决定路径）**

| 承载类型 | 数据路径 | 特点 |
|---|---|---|
| MCG bearer | UE → eNB → S1-U → SGW/PGW | 全部流量走 eNB，NR 不承载该业务 |
| SCG bearer | UE → gNB → S1-U → SGW/PGW | NR 流量直连核心网，不经 eNB，是分流主力 |
| Split bearer | UE → eNB/gNB 分流 → 经 X2-U 汇聚到 eNB → S1-U → 核心 | eNB 是汇聚点，PDCP 在 eNB |

- 关键理解：**EN-DC 没有 PDCP 层在 gNB 侧的"NR-only master"形态**；split bearer 的 PDCP 在 MeNB，SCG bearer 的 PDCP 在 SgNB。
- S1-U 上从 SgNB 直发的 GTP 隧道由 MME/S-GW 配置：SN 添加时 MeNB 经 X2 传来 SN 侧 GTP 信息，MME 通知 SGW 建立直达隧道。

**3. 与核心网的连接关系**

- gNB 在 EN-DC 中通过 S1 与 EPC 相连（S1-U 用户面 + 有限 S1-C 类信令由 MeNB 代管），并非独立站：它的"合法性"来自 MeNB 的 SN 添加。
- 演进对比：SA 组网中 gNB 直连 5GC（NG 接口），AMF/SMF 才是它的控制/会话归属——这是 NSA 与 SA 在"谁连核心网"上的本质区别。

**4. 面试速记口诀**

- 控制面：一个大脑（MeNB），一个司令部（MME）。
- 用户面：两条腿走路（MCG 走 eNB，SCG 走 gNB 直连），三条承载类型（MCG/Split/SCG）。

## 关联考点

- 架构基础：[EN-DC 架构与角色（MN/SN）](../01-无线基础与演进/ch01-q005-en-dc-architecture.md)
- 控制面细节：[EN-DC 的控制面与用户面分离](../01-无线基础与演进/ch01-q006-en-dc-cp-up.md)
- 承载类型：[EN-DC 承载类型（MCG/Split/SCG）](../01-无线基础与演进/ch01-q007-bearer-types.md)
- SN 流程：[SN 添加流程](../05-关键信令流程/ch05-q027-sn-addition.md)

## 面试追问

- **SCG 承载为什么能让 gNB 直连 SGW？MME 知道吗？** —— 要点：知道。SN 添加/修改过程中，MeNB 把 SgNB 的 GTP 地址信息（经 X2-C 拿到）通过 S1 的 E-RAB 修改过程告知 MME，MME 再通知 SGW 更新隧道端点，于是 SGW 直连 gNB 建立第二隧道。核心网视角是"一个 E-RAB 两个可能的隧道端点"，与双连接架构语义一致。
- **EN-DC 中 gNB 有没有自己的核心网控制面连接？** —— 要点：没有独立的 NG/N2 连接（连的是 EPC 而非 5GC，且 S1-C 语义由 MeNB 主导）；gNB 的控制面行为由 MeNB 经 X2-C 驱动。这也是 NSA 阶段"切片、VoNR、5GC 新特性"都用不了的根因——NR 只是 EPC 的一块"加速板"。
- **从用户面视角，NSA 向 SA 升级后发生了什么变化？** —— 要点：控制面从 MeNB/MME 体系切换为 gNB 直连 5GC（NG-C 到 AMF），NAS 端点变为 AMF；用户面锚点从 SGW/PGW 变为 UPF（N3 直达），PDU 会话替代 EPS 承载，QoS flow 与 SDAP 层登场；双连接由"EN-DC（4G 主）"转为 NR-DC 或纯 SA——gNB 从"辅节点"升格为"主节点"。

---

*难度提示：难 | 相关规范方向：37.340（NR 双连接）、23.401（EPC 侧承载管理）*
