---
title: PDCP duplication 的作用与适用场景
chapter: 4
difficulty: 中
frequency: 中
tags: [PDCP, duplication, 可靠性, URLLC]
---

## 一句话答案

PDCP duplication（数据重复/复制传输）把同一 PDCP PDU 通过多条 RLC 信道（对应不同小区或载波）发送两份，接收侧 PDCP 按 SN 去重，用"路径分集"降低单腿失败概率，提升可靠性与降低时延。它是 NR 支撑 URLLC 可靠性指标（如 10⁻⁵ 级误块率）的关键手段之一，典型场景是高可靠低时延业务、边缘覆盖增强。

## 详细展开

**工作原理**：

1. PDCP 层把要发的数据 PDU（和控制 PDU）复制成两份；
2. 两份分别交给两个关联的 RLC 实体（duplicate RLC 与 primary RLC），走不同逻辑信道；
3. 两条逻辑信道映射到不同的小区组（MCG/SN）或同一小区组的不同载波（CA 场景，需要激活 duplication 的辅助小区）；
4. 接收侧两个 RLC 都可能收到，重复的 PDCP PDU 在 PDCP 按 SN 丢弃一份；
5. MAC 层对 duplication 逻辑信道有特殊 LCP 规则：不允许把复制信道的数据和原始信道数据一起复用到同一个 TB（保证真正分路径）。

**激活与控制**：

- RRC 配置哪些 DRB 支持 duplication 及其关联的 RLC 承载；
- MAC CE（Duplication RLC activation/deactivation）动态开关 per-DRB 的 duplication（CA 载波场景按小区逐个控制）；
- 网络按业务需求/链路质量动态启停，避免无谓的资源翻倍。

**收益与代价**：

| 维度 | 说明 |
|---|---|
| 可靠性 | 两条独立路径叠加，单腿误码/丢包不再致命，等效可靠性显著提升 |
| 时延 | 首次正确接收即成功，减少等待 RLC 重传的时延 |
| 代价 | 空口资源近乎翻倍、干扰增加，只能在少量承载上按需启用 |

**适用场景归纳**：

- URLLC 承载（工业控制、电网差动保护等）；
- 覆盖边缘/HARQ 反复失败用户（用分集换吞吐不如先保住可靠性）；
- 高铁/高频移动等链路快速波动的场景；
- 双连接（ MN/SN 两腿）下跨小区组 duplication 天然路径独立，可靠性最稳。

**与重传机制的关系**：duplication 是"预防性"分集，降低触发重传的概率；RLC ARQ/HARQ 是"补救性"重传——三层互补，共同构成 NR 可靠性体系。

## 关联考点

- [PDCP 层主要功能与 PDCP SN 长度选择](ch04-q005-pdcp-functions-sn.md)
- [MAC CE 的常见类型与用途](ch04-q018-mac-ce-types.md)
- [HARQ 与 RLC ARQ 的分工协作关系](ch04-q020-harq-arq-split.md)
- [RLC 三种模式 TM/UM/AM 的适用承载类型](ch04-q010-rlc-modes.md)

## 面试追问

- **duplication 的两条腿能不能是同一小区？** —— 不能同小区同载波重复（同路径无分集价值且 MAC 禁止同 TB 复用复制信道），标准要求两腿对应不同小区组或 CA 下不同载波（辅小区需激活）。
- **为什么 MAC 要禁止原始信道与复制信道进同一 TB？** —— 同一 TB 内单点出错两份一起错，失去路径分集意义；强制分 TB/分路径才能体现"独立信道"的可靠性增益。
- **接收端怎么去重？** —— 按 PDCP SN：同一 SN 的 PDU 只递交一份，先到先递交，后到的副本丢弃；这也是 duplication 配置要求 DRB 按 SN 重排序去重的原因。
