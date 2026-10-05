---
title: "UCI 承载内容：SR/HARQ-ACK/CSI 的复用与编码"
chapter: 2
difficulty: 难
frequency: 高
tags: [UCI, HARQ-ACK, CSI]
---

## 一句话答案

上行控制信息（UCI, Uplink Control Information）在 PUCCH 或 PUSCH 上承载三类内容：调度请求（SR, Scheduling Request）表达"我有数据要发"，混合自动重传请求确认（HARQ-ACK, Hybrid ARQ-ACKnowledge）反馈接收对错，信道状态信息（CSI, Channel State Information）汇报信道质量。三者常需在同一 PUCCH 上复用，复用规则的核心是：HARQ-ACK 优先级最高、不能丢弃；CSI 在没有专用资源时可舍弃或降级；比特数决定编码方式和 PUCCH 格式选择。

## 详细展开

**三类 UCI 内容**：

- **SR**：1 bit 正/负请求，周期性配置资源；正 SR 触发随机接入或缓冲状态报告流程。
- **HARQ-ACK**：每个码块组（CBG）或传输块 1 bit（ACK/NACK），支持空间绑定（多流合并为 1 bit）；时延敏感，必须按 k1 指示的时隙准时反馈。
- **CSI**：含信道质量指示（CQI）、预编码矩阵指示（PMI）、秩指示（RI）、层指示（LI）等，比特数从几 bit 到上百 bit。

**同一 PUCCH 上的复用规则（优先级：ACK > SR > CSI）**：

1. **HARQ-ACK 单独存在**：按比特数选 Format 0/1（≤2 bit）或 2/3（更多）。
2. **ACK + SR**：正 SR 时借用 SR 的 PUCCH 资源同时携带 ACK；负 SR 时仍在 ACK 自己的资源上发送（gNB 由此反推 SR 为负）。
3. **ACK + CSI**：网络预先配置了"带 CSI 的 PUCCH 资源"；若本次无匹配资源且不满足同时发送条件，**UE 丢弃 CSI 只发 ACK**——ACK 不可丢，CSI 可以后补。
4. **三者都有**：SR 为正时 ACK+CSI 放在 SR 资源上，或按配置的复用格式（Format 2/3/4）联合编码。

**PUSCH 上的复用**：动态调度的 PUSCH 若与 PUCCH 的 CSI/ACK 时域重叠，UCI 在 PUSCH 上复用，位置有规定：HARQ-ACK 靠近 DMRS 附近（解调可靠性最高），CSI 靠频谱边缘放置。配置授权（CG）PUSCH 上也可复用 CSI。

**编码要点**：UCI 比特数不同编码方式不同——1-2 bit 直接序列选择/重复；3-11 bit 用（32, O）Reed-Muller 类块码；更大比特用 Polar 码。比特数还决定 PUCCH 格式切换（小比特 Format 0/1，大比特 Format 2/3），这套"比特数→编码→格式→资源"的级联选择是面试深挖点。

## 关联考点

- [PUCCH 五种格式（Format 0-4）的区别与适用场景](/02-物理层/ch02-q021-pucch-formats)
- [CSI 上报量 CQI/PMI/RI/LI/CRI 的含义与关系](/02-物理层/ch02-q031-csi-report-quantities)
- [速率匹配与冗余版本 RV 在 HARQ 重传中的作用](/02-物理层/ch02-q029-rate-matching-rv-harq)
- 动态调度与 SPS/CG 的应用场景（本章后续）

## 面试追问

- **为什么 CSI 可以丢、ACK 不能丢？** —— ACK 丢了 gNB 会误判传输失败或成功，引发错的重传/新传，破坏 HARQ 状态机；CSI 丢一轮只损失一次调度参考，下个周期还有，业务无损。
- **PUSCH 上为什么 ACK 要靠近 DMRS？** —— ACK 比 CSI 关键，放在信道估计质量最好的位置（DMRS 附近/低时延扩展区域）能最大化其可靠性，是"重要比特挑好位置"的映射设计。
- **A-CSI（非周期 CSI）怎么发？** —— 由 DCI 触发，在指定 PUSCH 上随数据一起或单独上报，比特量大、按需低时延，适合快速链路自适应与波束管理。
