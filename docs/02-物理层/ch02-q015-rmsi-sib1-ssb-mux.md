---
title: "RMSI/SIB1 调度与 SSB 的时频复用关系"
chapter: 2
difficulty: 难
frequency: 中
tags: [SIB1, RMSI, SSB]
---

## 一句话答案

RMSI（Remaining Minimum System Information，其余最小系统信息）即 SIB1，是除 MIB 外 UE 接入必需的最小系统信息，由 SI-RNTI 加扰的 PDCCH（在 CORESET#0）调度 PDSCH 承载。SIB1 与 SSB 可分时复用、可频分共存，协议定义了明确的复用图样，且 SIB1 与关联的 SSB 需保持准共址以便波束对准。

## 详细展开

**调度机制**：

- MIB 的 pdcch-ConfigSIB1 指示 CORESET#0 的频域位置/SCS 与关联搜索空间（查预定义表项）。
- SIB1 在 SI-RNTI（系统信息 RNTI）加扰的 PDCCH 上周期性调度，PDSCH 时频位置由 DCI 1_0 指示。
- SIB1 的传输周期由网络配置（SIB1 以 160 ms 为基本周期，可在周期内多次重复发送，重复次数与时域位置在调度 DCI/配置中体现）。

**与 SSB 的复用图样**（核心考点）：

SIB1 的 PDSCH 与 SSB 在同一载波上共存，协议定义时分/频分两类基本方式：

| 复用方式 | 特点 |
|---|---|
| 时分复用（不同符号，PDSCH 与 SSB 不重叠） | SIB1 可用整时隙资源，吞吐好；SIB1 调度须避开 SSB 符号 |
| 频分复用（不同频域位置） | 时间上可并行，调度灵活；要求频域上错开 SSB 的 20 RB |

无论哪种方式，PDSCH/SIB1 的映射必须避开 SSB 占用的 RE（速率匹配）。

**波束关联**：SSB 是按波束轮发（扫描）的，SIB1 若不与 SSB 波束对准，偏远处 UE 收不到。因此 SIB1 与"关联 SSB"满足准共址（QCL）关系：UE 收到某 SSB 后，按预定义周期图样在该 SSB 关联的时域位置接收 SIB1 调度——每个发送的 SSB 都有配套的 SIB1 传输机会（通过 k_SSB 相关参数与调度周期约束）。

**MSG2 之后**：随机接入的 MSG2（RAR）也复用同样的公共搜索空间/CORESET#0 机制调度，因此 SIB1 的调度框架是整个"接入前公共信道"体系的基础。

## 关联考点

- [PBCH 内容（MIB）与 PBCH DMRS 设计](/02-物理层/ch02-q013-pbch-mib-dmrs)
- [初始 BWP 与 SIB1 中 BWP 配置的关系](/02-物理层/ch02-q009-initial-bwp-sib1)
- [系统信息 SI window 与 on-demand SI 机制](/02-物理层/ch02-q016-si-window-on-demand)
- 随机接入流程（第 5 章）

## 面试追问

- **SIB1 为什么也叫 RMSI？** —— Release 15 最初把"接入必需的最小剩余系统信息"称为 RMSI，规范定稿后其载体就是 SIB1，两个名字在工程交流中混用。
- **SIB1 和 SSB 谁先出现？UE 的接收顺序是什么？** —— 先解 SSB 拿 MIB，MIB 指出 CORESET#0 与搜索空间，UE 再盲检 SI-RNTI 收 SIB1；没有 SSB 就没有 SIB1 的接收入口。
- **OSI（其他系统信息）和 SIB1 的调度有什么不同？** —— SIB1 周期性广播；OSI 可周期广播或按需（on-demand）由 UE 请求后发送，其调度配置本身在 SIB1 中给出。
