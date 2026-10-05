---
title: EN-DC 下 NR 的测量与 B1/B2 事件使用
chapter: 5
difficulty: 中
frequency: 高
tags: [EN-DC, 测量, B1, B2]
---

## 一句话答案

EN-DC 下 NR 的测量由 LTE 侧（MeNB）配置并下发：MeNB 通过 LTE 的 RRCConnectionReconfiguration 携带 NR 测量对象（NR 频点/SSB）与 B1/B2 报告配置，UE 测到 NR 邻区好于门限后上报，MeNB 据此触发 SN Addition/SN change；B2 用于 NR 覆盖恶化时先开测量再找新 SN。由于 UE 同时驻留 LTE 和 NR 两个载波，测 NR 需要测量 GAP 或 UE 具备无 GAP 能力，测量结果全部先报给 LTE 侧再经 MeNB 协调到 SgNB。

## 详细展开

**1. 测量配置的下发路径**

- 测量配置由 **MeNB 决定**（SgNB 可经 SgNB Addition Required/Required Ack 流程提需求，但最终由 MeNB 统一下发）；
- 承载在 LTE RRC 消息中：measObject（含 NR 的 ARFCN/频点、SSB 子载波间隔、SSB 周期）+ reportConfig（B1/B2 门限、hysteresis、timeToTrigger）+ measId 关联；
- UE 按 LTE 侧测量框架执行，上报也回 LTE 侧。

**2. B1/B2 在 EN-DC 的具体用法**

| 事件 | EN-DC 场景用途 |
|---|---|
| B1（NR 邻区 > 门限） | 触发 **SN Addition**（首次添加 SgNB）或 **SN change**（换 SgNB）；NR 覆盖恢复时重建 SCG |
| B2（LTE 服务 < 门限1 且 NR 邻区 > 门限2） | LTE 覆盖弱、需要 NR 分流的场景；或 LTE 覆盖边缘仍能通过 NR 提速的判断 |
| （LTE 内 A 事件） | 同时共存：A2 开 NR 测量 GAP，A1 关 NR 测量，B1 触发添加 |

**3. 完整联动示例（首次 SN Addition）**

1. UE 在 LTE 连接态，MeNB 配置 NR 测量（B1 事件 + GAP）；
2. UE 测到 NR SSB RSRP 超门限且持续 TTT → 上报 B1 事件（含 NR 频点、PCI、RSRP）；
3. MeNB 判决发起 SgNB Addition：X2 SgNB Addition Request → SgNB 回 SCG 配置容器 → MeNB 经 RRCConnectionReconfiguration 下发 NR 配置；
4. UE 在 PSCell 上 CFRA 随机接入，SCG 建立，此后 NR 侧测量（用于 SN change）仍由 MeNB 配置（或经 SN 协调）。

**4. 关键工程要点**

- **GAP 与速率的矛盾**：GAP 期间 LTE 数据传输中断，影响吞吐；无 GAP 测量（UE 能力支持、频点组合允许）是现网优化重点；
- **测量不到 NR 的排查链**：MeNB 是否下发 NR 邻频点测量配置 → GAP 是否生效 → NR 小区 SSB 是否可检测（覆盖/干扰/参数）→ UE 能力是否支持该 EN-DC 组合；
- **NSA 与 SA 测量的差异**：SA 下 NR 测量（A 事件）由 gNB 自己配自己收；EN-DC 下一切经 LTE 中转，信令路径与参数体系都挂在 LTE 测量框架上。

## 关联考点

- B 事件基础：[事件 B1/B2 的含义与异系统测量流程](ch05-q021-b1-b2-events.md)
- NSA 测量背景：[NSA 终端如何驻留 LTE 并测量 NR（B1/B3 事件与系统消息配合）](../01-无线基础与演进/ch01-q014-nsa-measurement-b1-b3.md)
- 添加流程：[SN Addition 辅节点添加流程与信令](ch05-q027-sn-addition.md)

## 面试追问

- **为什么 EN-DC 下 NR 测量结果报给 LTE 而不是直接给 NR？** —— 要点：EN-DC 的控制面锚点在 MeNB，SRB1 终结在 LTE，所有 RRC 上行（含测量报告）只走 LTE；NR 侧（SgNB）对 UE 的控制都需 MeNB 中转，这是"锚点集中控制"的架构决定的。
- **SN change 的测量（NR 内 A 事件）由谁配置？** —— 要点：NR 侧小区间测量（A3/A5 等）在 EN-DC 下可由 SgNB 通过 SgNB Modification 流程请求 MeNB 代为下发，最终仍嵌入 LTE RRC 消息；SN change 的测量判决链是"UE 测 NR → 报 MeNB → MeNB 与 SN 协商 → SN change"。
- **UE 报了 B1 但 SN Addition 失败，可能什么原因？** —— 要点：SgNB 接纳拒绝（资源/许可证）、X2 链路问题、UE 能力不支持该 NR 频段组合、SCG 配置下发后 UE 侧建立失败（回 SCG failure）；排查要分层看 X2 信令、SgNB 日志与 UE 上报，不能只盯空口测量。
