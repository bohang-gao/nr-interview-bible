---
title: NSA/SA 常见部署选项 Option 3/3a/3x 与 Option 2 的差异
chapter: 1
difficulty: 中
frequency: 高
tags: [组网, Option, NSA, SA]
---

## 一句话答案

Option 系列描述 5G 基站（gNB）、4G 基站（eNB）、4G 核心网（EPC）与 5G 核心网（5GC）的组合方式：Option 3/3a/3x 是"4G 锚点 + EPC"的 NSA 组网，三者的区别在于用户面数据在 LTE 与 NR 间的分拆位置；Option 2 是"新空口 + 5GC"的 SA 组网。记住 3 系列看用户面分流点、Option 2 看核心网，即可串起全图。

## 详细展开

Option 编号逻辑：1 表示 4G 全套，2 表示 NR 直连 5GC，3 表示"NR 依托 4G/EPC"，4、5、7 系列分别是"5G 锚点连 EPC"与"4G 依托 5G 侧"的过渡形态。面试重点掌握 3 系列内部差异与 Option 2：

| 选项 | 控制面锚点 | 核心网 | 用户面（U 面）走向 | 特点 |
|---|---|---|---|---|
| Option 3 | eNB（MeNB） | EPC | 数据经 MeNB 分拆：主承载在 LTE 侧分出 SCG 承载（PDCP 层在 MeNB 分流） | 分流与聚合逻辑都在 MeNB，MeNB 处理负担最大 |
| Option 3a | eNB（MeNB） | EPC | 数据经 EPC/S-GW 分流到两条独立承载：一条走 eNB、一条走 gNB，MeNB 不做数据分流 | MeNB 只管控制面，用户面各走各的，对 MeNB 硬件要求低 |
| Option 3x | eNB（MeNB） | EPC | 数据经 MeNB 分拆，但大流量数据（如 5G 承载）由 NR 侧作为分流点（split 承载由 gNB 侧协助） | 3 的增强版：NR 吞吐高，让 gNB 承担更多分流处理，MeNB 只处理小包/低速率部分 |
| Option 2 | gNB（独立） | 5GC | NR 直连 5GC，无 LTE 参与 | 完整 5G 能力：切片、SBA、uRLLC、VoNR 演进基础 |

记忆要点：

1. **3 系列共同点**：控制面都锚定在 LTE（MCG 侧），终端的 RRC 与移动性管理由 eNB 主导；核心网都是 EPC。
2. **3/3x 与 3a 的本质区别**：分流发生在锚点基站（3/3x，对应 split bearer）还是核心网（3a，对应两条独立承载）。3x 是 3 的演进，把分流"重活"交给处理能力更强的 gNB。
3. **商用主流是 Option 3x**：因为 NR 用户面能力远强于 LTE，分流点放在 NR 侧可获得更优吞吐与更低的锚点升级成本。
4. **Option 2 与 3 系列不可比的是核心网能力**：3 系列无论怎么分流都受限于 EPC，无法提供切片与 5GC QoS。

补充：Option 4/4a（5G 锚点 + 5GC，LTE 作辅站）与 Option 7/7a/7x（4G 锚点但连 5GC）用于 NSA→SA 过渡期，了解即可。

## 关联考点

- NSA 与 SA 的区别及演进路径：[NSA 与 SA](./ch01-q003-nsa-vs-sa-evolution.md)
- EN-DC 中控制面与用户面走向：[控制面与用户面](./ch01-q006-en-dc-cp-up.md)
- MCG/SCG/split bearer 的区别：[承载类型](./ch01-q007-bearer-types.md)

## 面试追问

- **Option 3x 相比 Option 3 改在哪里，为什么商用选 3x？** —— 要点：3 的分流点在 MeNB，5G 大流量全部经 MeNB 转发，锚点负荷重；3x 把分流点移到 gNB（大包直接从核心网到 gNB），MeNB 只处理小数据流，锚点改动小、总吞吐更高。
- **Option 3a 下终端如何聚合两条承载的速率？** —— 要点：分流发生在核心网/S-GW，形成两条独立 E-RAB，一条映射 LTE 一条映射 NR；速率聚合在 PDCP 之上的端到端流层面体现，不需要 MeNB 做数据面复制分发。
- **Option 2 与 Option 3x 在语音方案上有什么不同？** —— 要点：3x 下语音由 VoLTE 承载（走 LTE）；Option 2 初期若无 VoNR，可通过 EPS fallback 回落到 4G 打电话，成熟后演进 VoNR。
