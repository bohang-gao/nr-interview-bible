---
title: 测量配置三要素（测量对象/报告配置/测量标识）与 GAP
chapter: 5
difficulty: 中
frequency: 高
tags: [测量配置, measObject, reportConfig, 测量 GAP]
---

## 一句话答案

NR 测量配置由三要素构成：测量对象（measObject，定义测谁的频点/参考信号）、报告配置（reportConfig，定义怎么报——事件触发/周期、门限、迟滞、触发时间）、测量标识（measId，把两者绑在一起交给 UE 执行）；当目标频点不在 UE 收发机带宽内时，需要配置测量 GAP——在指定周期里暂停收发、把射频调到异频/异系统测量，GAP 模式（如 40 ms 周期）按需激活。

## 详细展开

**1. 三要素关系**

```
measObjectNR ──┐
               ├── measId ──→ 下发给 UE 执行
reportConfig ──┘
```

| 要素 | 关键内容 | 典型配置 |
|---|---|---|
| measObjectNR | ssbFrequency（频点）、ssbSubcarrierSpacing、幅值偏移 freqOffsetOFDM、SMTC 周期、referenceSignalCSIs-RS（CSI-RS 测量时） | 每个被测频点一个 |
| reportConfig | reportType（eventA1~A6/eventB、periodical）、触发门限、hysteresis、timeToTrigger、reportAmount/reportInterval、相关 RS 类型 | 每种报告策略一个 |
| measId | 把 measObject 与 reportConfig 绑定 | 一个 measId = 一条完整测量任务 |

- UE 能力（bandCombination、measAndMobilityParameters）决定可测频段组合与 GAP 需求；网络按能力+邻区配置生成三要素。

**2. 测量 GAP**

- **作用**：单射频链 UE 无法边服务边测异频，网络下发 gapConfig（如 GP0：约 6 ms 窗口 / 40 ms 周期）让 UE 在 GAP 期间暂停当前小区收发，调谐到目标频点测量。
- **模式**：NR 定义 per-UE GAP（gapUE）与 per-FR GAP，支持 40 ms 与 80 ms 等周期；GAP 是否需要由 UE 频段组合能力（measGap 相关字段）与目标频点相对服务频点的关系决定。
- **代价**：GAP 期间无本小区收发，影响吞吐与时延——因此同频测量优先免 GAP，异频测量尽量用多链路 UE 或 SMTC 控制测量窗口。

**3. 配置下发与生效**

- RRCReconfiguration 携带 measConfig（measObjectToAddModList、reportConfigToAddModList、measIdToAddModList、gapConfig 等），UE 侧按 measId 逐一执行。
- SMTC（SSB 测量时机配置）限制 UE 在哪些时间窗测 SSB，与 SSB 周期对齐，降低耗电。
- 测量结果通过 MeasurementReport（SRB1）上报，作为切换判决输入。

## 关联考点

- 事件体系：[事件 A1–A6 的含义与典型使用场景](ch05-q020-events-a1-a6.md)
- 波束测量：[波束管理整体流程](../03-MIMO与波束管理/ch03-q005-beam-management-flow.md)
- NSA 测量：[NSA 终端如何驻留 LTE 并测量 NR](../01-无线基础与演进/ch01-q014-nsa-measurement-b1-b3.md)

## 面试追问

- **measId 为什么要存在？** —— 要点：把"测什么"与"怎么报"解耦复用——同一个频点对象可配不同报告策略（如 A3 与周期报告），同一报告策略可套多个频点；measId 是网络灵活组合、UE 无歧义执行的关键。
- **GAP 对业务有什么影响，怎么减少？** —— 要点：GAP 期间暂停调度，吞吐与时延受损；减少手段包括优先同频测量、按 UE 能力用双链路免 GAP、精配 SMTC 缩窄测量窗、仅在需要切换时才激活 GAP。
- **SSB 测量与 CSI-RS 测量在配置上的区别？** —— 要点：SSB 测量配 ssbFrequency+SMTC，用于同频/异频小区级移动性；CSI-RS 测量在 measObject 的 referenceSignalCSIs-RS 中列举资源，用于连接态精细移动性（如 CFRA 准备）与波束级测量，粒度更细但配置更重。
