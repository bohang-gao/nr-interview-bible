---
title: "上行两种波形 CP-OFDM 与 DFT-s-OFDM 的选择"
chapter: 2
difficulty: 易
frequency: 高
tags: [波形, CP-OFDM, DFT-s-OFDM]
---

## 一句话答案

NR 下行只用循环前缀 OFDM（CP-OFDM, Cyclic Prefix OFDM），上行则有两种波形可选：CP-OFDM（高频谱效率、支持多流 MIMO）与 DFT 扩展 OFDM（DFT-s-OFDM, DFT-Spread OFDM，单载波特性、低峰均比 PAPR）。选择的核心权衡是"功率效率 vs 频谱效率"：边缘/功率受限场景用 DFT-s-OFDM 省功放回退，近点大吞吐场景用 CP-OFDM 配高阶 QAM 和多流。波形以 BWP 为单位由 RRC 半静态配置，可用 DCI 在 CP-OFDM 与 DFT-s-OFDM 两个上行 BWP 间指示切换。

## 详细展开

**两种波形的处理链对比**：

| | CP-OFDM | DFT-s-OFDM |
|---|---|---|
| 发端处理 | 数据直接映射子载波 → IFFT | 先 M 点 DFT 预扩展再映射子载波 → IFFT |
| 时域特性 | 多载波，包络起伏大 | 近似单载波，包络平稳 |
| PAPR | 高（需功放回退 3 dB 量级） | 低（与 π/2-BPSK 组合近似恒包络） |
| 频谱效率 | 高，子载波自由分配 | 略低，占用带宽受 DFT 点数约束 |
| MIMO 能力 | 多流（2/4 流）成熟 | 主要单流（多流受限） |
| 接收复杂度 | 常规频域均衡 | 可频域均衡，发端多一级 DFT |

**选择逻辑**：

- **上行是功率受限方向**：UE 功放远弱于基站，PAPR 高会迫使功率回退（PAPR 每 1 dB ≈ 覆盖损失 1 dB），直接压缩上行覆盖半径——这是保留 DFT-s-OFDM 的根本原因（LTE 上行 SC-FDMA 的延续思路）。
- **与调制联动**：DFT-s-OFDM + π/2-BPSK 是覆盖"王牌组合"，链路预算可比常规 CP-OFDM/QPSK 提升 1-3 dB 以上；CP-OFDM + 256QAM 是吞吐"王牌组合"，两者覆盖场景两端。
- **与调度联动**：DFT-s-OFDM 需要频域连续/等间隔的分配（保证单载波特性），CP-OFDM 可任意离散分配，调度灵活性不同。
- **配置粒度**：波形绑定 BWP（每个 UL BWP 指定 CP-OFDM 或 DFT-s-OFDM），网络可配两个不同波形的 BWP，DCI 波形指示字段（单比特）实现毫秒级切换——比如 UE 移动到边缘时切到 DFT-s-OFDM BWP。

**为什么下行不需要 DFT-s-OFDM**：基站功放预算充足且多用户复用（MU-MIMO、多 UE 频分）需要灵活多载波，PAPR 问题在 gNB 侧不敏感。

## 关联考点

- [调制方式：上行 π/2-BPSK、DFT-s-OFDM 与高阶 QAM 的使用条件](/02-物理层/ch02-q026-modulation-pi2-bpsk-dfts-ofdm)
- [上行功控基本公式：开环路损补偿与闭环 TPC 修正](/02-物理层/ch02-q039-uplink-power-control)
- [BWP 的概念、作用与四类 BWP 配置](/02-物理层/ch02-q007-bwp-basics)

## 面试追问

- **DFT-s-OFDM 和 LTE 的 SC-FDMA 什么关系？** —— 同源思想（单载波降 PAPR），NR 的 DFT-s-OFDM 支持灵活的 DFT 点数、跳跃式（jump）频域分配和与 CP-OFDM 统一的参数集，比 LTE 固定 15 kHz 的 SC-FDMA 更灵活。
- **两个波形能同时配给一个 UE 吗？** —— 可以通过两个 UL BWP 分别配置，UE 在任一时刻只在一个激活 BWP 上发送（一种波形），DCI 切换 BWP 即实现波形切换，切换有时延与重调谐开销。
- **π/2-BPSK 只能配 DFT-s-OFDM 吗？** —— 协议设计上 π/2-BPSK 主要作为 DFT-s-OFDM 的底层调制使用以获得最小包络波动；CP-OFDM 上行也支持 π/2-BPSK（Rel-17 扩展），但恒包络收益在多载波上打折扣。
