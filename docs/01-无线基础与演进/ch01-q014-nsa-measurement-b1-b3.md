---
title: NSA 终端如何驻留 LTE 并测量 NR（B1/B3 事件与系统消息配合）
chapter: 1
difficulty: 难
frequency: 高
tags: [NSA, 测量, B1事件, EN-DC]
---

## 一句话答案

NSA 终端始终先驻留在 LTE 上（由 SIB1 中 upperLayerIndication 等参数指示存在 NR 上层），MeNB 通过 RRC 重配下发针对 NR 的测量配置；当终端满足 NR 侧的 B1 事件（邻区 NR 信号好于门限）或 LTE 侧 B3 事件（邻 LTE 小区优于服务小区，用于锚点切换）时上报测量报告，MeNB 据此发起 SgNB 添加或锚点切换。整条链路是"LTE 驻留 → NR 测量 → 事件上报 → SN 添加"。

## 详细展开

**1. 驻留阶段：怎么知道这里有 5G？**

LTE 小区在系统消息（SIB1）中携带 upperLayerIndication，告知终端本小区上层可接入 NR（即本小区可作 EN-DC 锚点）。终端据此：

- 保持 LTE 驻留与移动性管理（NSA 终端的 RRC/IDLE 行为完全是 LTE 逻辑）；
- 知道该 LTE 频点是"锚点候选"，小区重选优先级可被专门设置（把锚点频点优先级抬高，引导终端驻留到锚点）。

**2. 测量配置：MeNB 下发三件套**

进入 RRC_CONNECTED 后，MeNB 通过 RRCConnectionReconfiguration 下发：

- **NR 测量对象**：NR ARFCN（频点）+ 待测 SSB 的时频位置（SSB 频率、半帧定时等），告诉终端"去哪里找 NR"。
- **报告配置**：事件类型与门限——重点是 B1（Inter RAT：邻区量好于绝对门限）与 A2/A1（LTE 服务小区变差/变好，用于启停 NR 测量）。
- **测量标识/上报方式**：周期性或事件触发，报告含 NR 小区的 PCI、ARFCN、RSRP/RSRQ。

关键配合关系：为省电，网络常配 **A2 门限启动 NR 测量、A1 门限关闭 NR 测量**（LTE 信号差时才开 NR 测量，恢复后关掉）；这是"测量开关"的经典设计。

**3. 事件含义与用途**

| 事件 | 定义 | NSA 用途 |
|---|---|---|
| B1 | 异系统邻区（NR）质量高于绝对门限 | 触发 SN 添加/变更的核心事件（NR 覆盖好，上 5G） |
| B2 | 服务小区变差 且 异系统邻区变好 | 兼顾"LTE 不行了 + NR 可以了"的场景 |
| B3 | 同频/异频邻区优于服务小区（偏移+滞后） | LTE 锚点小区间的切换判决（锚点移动性） |
| A2/A1 | 服务小区低于/高于门限 | 启动/停止 NR 测量的开关 |

**4. 完整链路举例**

1. 终端驻留 LTE 锚点小区（SIB1 带 upperLayerIndication）。
2. 连接态收到 NR 测量配置（B1 事件，NR SSB RSRP 门限）。
3. 走近 5G 站：NR SSB RSRP 越过门限并满足触发时间（timeToTrigger）+ 滞后，终端上报 B1（含 NR PCI/频点/RSRP）。
4. MeNB 判定后向对应 gNB 发 SgNB Addition Request，走标准 SN 添加流程（详见 SCG 流程专题）。
5. 锚点移动时，B3 事件触发 LTE 邻区切换；若目标锚点下 NR 配置不同，MeNB 切换后重新下发 NR 测量配置或直接携带 SN 添加。

**排查视角**（网优面试加分）：NSA 用户"看不到 5G"的常见断点依次是——SIB1 无 upperLayerIndication、未下发 NR 测量对象、B1 门限过高、终端 NR 能力未上报（UECapability 里不支持 EN-DC 组合）。

## 关联考点

- SCG 添加、修改、变更与失败流程：[SCG 流程](./ch01-q008-scg-procedures.md)
- EN-DC 双连接基本概念：[EN-DC](./ch01-q005-en-dc-architecture.md)
- MCG/SCG/split bearer 区别：[承载类型](./ch01-q007-bearer-types.md)

## 面试追问

- **B1 与 B2 事件在 NSA 中如何取舍？** —— 要点：B1 只看 NR 门限，适合"NR 好就去"的主动添加；B2 要求 LTE 服务小区同时变差，适合负载迁移或覆盖边缘场景；商用网络添加多用 B1，少数场景配 B2。
- **为什么用 A2/A1 控制 NR 测量的启停？** —— 要点：NR SSB 测量需要终端在 LTE 调度间隙做异频/异制式采样，功耗明显；LTE 信号好时没必要持续测 NR，A2（变差）开测、A1（恢复）停测可显著省电。
- **锚点切换后 NR 为什么可能掉？** —— 要点：切换后新 MeNB 需重新下发 NR 测量/添加，若切换是盲切（目标锚点无 NR 覆盖或未配 NR 测量），SN 会被释放；跨锚点移动的"锚点切换 + SN 变更"时序配合是 NSA 移动性的主要掉话来源。
