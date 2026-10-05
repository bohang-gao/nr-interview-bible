---
title: 高频英文术语中英对照（二）：物理层与射频
chapter: 8
difficulty: 易
frequency: 高
tags: [术语对照, 物理层, 射频]
---

## 一句话答案

物理层与射频的英文术语分四组：帧结构类（Numerology、Slot、CP）、信道与信号类（SSB、PDCCH/PDSCH/PUCCH/PUSCH、DMRS/CSI-RS/SRS）、天线与波束类（MIMO、Beamforming、QCL、TCI）、射频指标类（EVM、ACLR、Sensitivity、EIRP）。物理层术语的特点是"缩写即身份"——面试和文档中几乎只说缩写，但被问"SSB 是什么"时必须能给出全称同步/信号块（Synchronization Signal Block）。

## 详细展开

**① 帧结构与参数集类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| Numerology | μ | 参数集（决定子载波间隔 15×2^μ kHz） |
| Subcarrier Spacing | SCS | 子载波间隔 |
| Cyclic Prefix | CP | 循环前缀 |
| Slot / Mini-slot | — | 时隙 / 迷你时隙 |
| System Frame Number | SFN | 系统帧号 |
| Bandwidth Part | BWP | 带宽部分 |
| Slot Format Indicator | SFI | 时隙格式指示 |

**② 物理信道与参考信号类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| Synchronization Signal / PBCH Block | SSB | 同步信号/广播信道块 |
| Primary / Secondary Synchronization Signal | PSS/SSS | 主/辅同步信号 |
| Physical Broadcast Channel | PBCH | 物理广播信道 |
| PDCCH / PDSCH | — | 物理下行控制/共享信道 |
| PUCCH / PUSCH | — | 物理上行控制/共享信道 |
| Physical Random Access Channel | PRACH | 物理随机接入信道 |
| Demodulation Reference Signal | DMRS | 解调参考信号 |
| Channel State Information RS / Sounding RS | CSI-RS/SRS | 信道状态信息参考信号/探测参考信号 |
| Phase Tracking RS | PT-RS | 相位跟踪参考信号（FR2 用） |
| Downlink Control Information | DCI | 下行控制信息 |
| Transport Block / Code Block | TB/CB | 传输块/码块 |
| Resource Block | RB | 资源块（频域 12 个子载波） |

**③ 天线与波束类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| Multiple Input Multiple Output | MIMO | 多输入多输出 |
| Beamforming / Beam Management | — | 波束赋形 / 波束管理 |
| Quasi Co-Location | QCL | 准共址（Type A/B/C/D） |
| Transmission Configuration Indicator | TCI | 传输配置指示 |
| Rank Indication / Precoding Matrix Indicator | RI/PMI | 秩指示/预编码矩阵指示 |
| Layer | — | 层（空分复用流数） |
| Active Antenna Unit | AAU | 有源天线单元 |
| Massive MIMO | — | 大规模 MIMO（如 64T64R） |

**④ 射频指标类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| Error Vector Magnitude | EVM | 误差矢量幅度（调制质量） |
| Adjacent Channel Leakage power Ratio | ACLR | 邻道泄漏功率比 |
| Spurious Emission | — | 杂散辐射 |
| Equivalent Isotropic Radiated Power | EIRP | 等效全向辐射功率 |
| Receiver Sensitivity | — | 接收灵敏度 |
| Noise Figure | NF | 噪声系数 |
| Out-of-Band Emission | — | 带外辐射 |

**记忆方法**：物理层术语按"一个时隙里发生了什么"串记——PDCCH 调度（DCI）→ PDSCH 传数据（DMRS 解调）→ UE 用 PUCCH 反馈（HARQ-ACK/CSI）→ 上行 PUSCH 携带 SRS 供波束管理 → 全程靠 SSB 同步。射频指标按"一台 AAU 的出厂测试"记——EVM 管调制质量、ACLR 管邻道、杂散管远端、灵敏度管接收。串成场景记忆比单词表高效。

## 关联考点

- SSB 组成与扫描：[SSB 组成](../02-物理层/ch02-q010-ssb-composition.md)
- 参考信号体系：[PDSCH DMRS](../02-物理层/ch02-q024-pdsch-dmrs-mapping-type.md)
- QCL 与 TCI：[QCL 类型](../03-MIMO与波束管理/ch03-q007-qcl-types.md)
- 射频 KPI 详解：[射频 KPI](../07-射频与网优/ch07-q003-rf-kpis-evm-aclr-spurious.md)

## 面试追问

- **SSB 的全称和组成？** —— 要点：Synchronization Signal / PBCH block，同步信号/广播信道块，四个连续符号内依次为 PSS（符号 0）、SSS（符号 2）、PBCH+PBCH DMRS（符号 1、3）；用于小区搜索、同步与 MIB 接收——全称与频域位置一起说更完整。
- **DMRS、CSI-RS、SRS 各自的作用方向？** —— 要点：DMRS 是"专属解调"（跟数据同波束同预编码，接收端估信道用）；CSI-RS 是"下行测量"（UE 测 CSI、波束、跟踪）；SRS 是"上行探测"（gNB 测上行信道，TDD 借信道互易性推下行波束）。方向相反、用途互补。
- **EVM 差会导致什么现象？** —— 要点：EVM 直接映射到调制星座图的散点扩散，过大导致高阶调制（256QAM/1024QAM）解调误码率上升，表现为"信号强但速率上不去/回落到低阶调制"——射频指标与用户感知的联动是加分点。
