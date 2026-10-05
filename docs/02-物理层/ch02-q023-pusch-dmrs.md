---
title: "PUSCH 信道结构与 DMRS（类型1/类型2、前置 DMRS）"
chapter: 2
difficulty: 中
frequency: 高
tags: [PUSCH, DMRS, 上行]
---

## 一句话答案

物理上行共享信道（PUSCH, Physical Uplink Shared Channel）在时频资源上由数据、解调参考信号（DMRS, Demodulation Reference Signal）、相位跟踪参考信号（PTRS）和可能的 UCI 复用组成。DMRS 分两类图案：类型 1 最多 4 正交端口、密度均匀（每 2 个 RE 1 个导频），类型 2 最多 12 正交端口、频域分组分布。前置 DMRS（front-loaded DMRS）放在分配资源的最前面符号，保证接收端尽早完成信道估计，是低时延解调的基础。

## 详细展开

**PUSCH 时频资源复用**：

- 数据映射在分配的 PRB/符号内，DMRS/PTRS 所在 RE 速率匹配避开。
- UCI 可复用（HARQ-ACK 靠近 DMRS，CSI 靠边缘）。
- 符号位置由 DCI 的时域分配（SLIV）确定。

**DMRS 类型 1 vs 类型 2**：

| 项目 | 类型 1 | 类型 2 |
|---|---|---|
| 频域密度 | 每 PRB 6 个 DMRE（每 2 RE 1 个） | 每 PRB 4 或 6 组（每 2 组间隔 4 RE） |
| 正交端口（单符号） | 最多 4 | 最多 6（双符号翻倍到 12） |
| 正交化手段 | 频域等间隔子载波 + 时域 OCC | 频域相邻 PRB 对 + 频/时域 OCC |
| 典型场景 | 中低速、低秩传输、覆盖优先 | 高秩/多用户 MIMO、大端口数 |

两类型都通过循环移位（CS）+ 正交覆盖码（OCC, Orthogonal Cover Code）做端口正交，多流/多 UE 的 DMRS 在相同 RE 上靠码分隔离。

**前置与附加 DMRS**：

- **前置 DMRS**：在每个调度突发的第一组符号（映射类型 A 固定在第 3/4 符号，类型 B 在首个符号），接收端先估信道再解后续数据。
- **附加 DMRS（additional positions 1-3）**：时间选择性信道（高速移动、大时延扩展）下按配置在时隙后段再插 1-3 组，跟踪时变；每多一组开销增加、相干解调更稳。
- **映射类型 A vs B**：A 型从时隙固定起点开始（DMRS 位置相对固定），适合常规时隙级调度；B 型从任意符号开始（DMRS 紧贴数据起点），适合 mini-slot/URLLC（详见 PDSCH DMRS 配置题）。

**序列设计**：上行 DMRS 基于 Zadoff-Chu 序列的低峰均比变体（CP-OFDM 波形）或 π/2-BPSK 兼容序列（DFT-s-OFDM 波形），保证低 PAPR 对功放友好。

## 关联考点

- [PDSCH 传输与 DMRS 配置（映射类型 A/B）](/02-物理层/ch02-q024-pdsch-dmrs-mapping-type)
- [调制方式：上行 π/2-BPSK、DFT-s-OFDM 与高阶 QAM 的使用条件](/02-物理层/ch02-q026-modulation-pi2-bpsk-dfts-ofdm)
- [PTRS 的作用与 FR2 相位噪声补偿](/02-物理层/ch02-q025-ptrs-fr2-phase-noise)
- SRS 的功能类型与天线切换发送（本章后续）

## 面试追问

- **什么时候需要附加 DMRS？** —— 信道时变快（高速移动）或时隙长（低 SCS 数值如 15 kHz 一个时隙 1 ms）时，前置 DMRS 只代表"开头"的信道，后段失准；附加 DMRS 在时隙内再采样信道。
- **类型 1 和类型 2 怎么选？** —— 看需要的正交端口数与开销预算：≤4 层且想省开销选类型 1；多用户 MIMO 配对多、需要 5 层以上正交时必须类型 2。
- **双符号前置 DMRS 的好处？** —— 时域 OCC 翻倍正交端口数（类型 1 达 8 端口），同时两符号平均提升信道估计 SNR 约 3 dB，代价是开销翻倍。
