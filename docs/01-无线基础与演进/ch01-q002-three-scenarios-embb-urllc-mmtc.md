---
title: eMBB/uRLLC/mMTC 三大应用场景及各自关键指标
chapter: 1
difficulty: 易
frequency: 高
tags: [应用场景, eMBB, uRLLC, mMTC]
---

## 一句话答案

5G 定义了三大应用场景：增强移动宽带（eMBB, enhanced Mobile Broadband）主打高速率，超可靠低时延通信（uRLLC, ultra-Reliable and Low-Latency Communications）主打低时延高可靠，海量机器类通信（mMTC, massive Machine-Type Communications）主打海量连接。ITU 在 5G 需求报告中为每类场景给出了量化的关键能力指标，是面试必须能脱口而出的数字。

## 详细展开

三大场景面向的业务完全不同，因此网络设计侧重点不同：

| 场景 | 典型业务 | 关键指标（ITU 通识口径） |
|---|---|---|
| eMBB | 4K/8K 视频、VR/AR、大文件下载 | 峰值速率：下行 20 Gbps、上行 10 Gbps；用户体验速率 100 Mbps（下行）；区域流量容量 10 Tbps/km² |
| uRLLC | 工业自动化、自动驾驶、远程手术、电网差动保护 | 空口时延：上行/下行各 1 ms；可靠性 99.999%（1 ms 内丢包概率 10⁻⁵） |
| mMTC | 智能抄表、传感器网络、智慧城市 | 连接密度 100 万设备/km²；终端低功耗（电池数年级）、低成本 |

补充说明：

1. **eMBB** 是 5G 商用部署最先落地的场景，当前 NSA/SA 网络提供的增强宽带业务都属于此类；峰值速率依赖大带宽（100 MHz FR1 / 400 MHz FR2）、massive MIMO 多层传输和高阶调制（256QAM，部分场景 256QAM 上行）。
2. **uRLLC** 依赖短时隙调度（mini-slot）、更大子载波间隔（60/120 kHz）、时隙内重复传输与 PDCP 复制（duplication）等机制保障时延与可靠性的平衡。
3. **mMTC** 在 5G 阶段主要仍由 NB-IoT/eMTC 等 LTE 演进技术承载，NR 原生 mMTC 特性在后续版本持续增强；考察重点通常是连接密度与低功耗设计思路。
4. 除三大场景外，ITU 还定义了若干横向能力指标，常被追问的包括：移动性 500 km/h、能效与频谱效率较 4G 提升 3 倍等。

面试口播技巧：先报场景名与业务例子，再各报一个最核心的数字（20 Gbps / 1 ms+99.999% / 100 万/km²），条理清晰即可。

## 关联考点

- 5G NR 与 LTE 的主要设计差异：[LTE 到 NR](./ch01-q001-nr-vs-lte-design.md)
- FR1 与 FR2 频段范围及传播特点：[FR1/FR2](./ch01-q009-fr1-fr2-bands.md)
- 载波聚合与双连接的区别与联系：[CA 与 DC](./ch01-q011-ca-vs-dc.md)

## 面试追问

- **uRLLC 的"1 ms + 99.999%"是在什么条件下定义的？** —— 要点：是 ITU 对空口（Uu 口）的要求，指 32 字节包在 1 ms 内传输成功概率 99.999%；实际端到端时延还要加上传输网、核心网与业务处理时延。
- **mMTC 为什么当前主要由 NB-IoT 承载而不是 NR？** —— 要点：NB-IoT 已成熟商用且深度覆盖、功耗优化到位；NR mMTC 相关特性（覆盖增强、RedCap 等中速物联）按版本演进，RedCap 定位介于 eMBB 与 NB-IoT 之间的中速物联。
- **峰值速率 20 Gbps 依赖哪些技术要素？** —— 要点：大带宽（FR2 400 MHz）、高阶调制 256QAM、massive MIMO 最高 8 流（对应 4 层×2 极化方向的 MIMO 层数上限口径）、更短的 TTI；同时说明这是理想条件下的理论峰值。
