---
title: "PBCH 内容（MIB）与 PBCH DMRS 设计"
chapter: 2
difficulty: 中
frequency: 中
tags: [PBCH, MIB, 参考信号]
---

## 一句话答案

PBCH 承载 MIB（Master Information Block，主信息块），给出 SIB1 的调度位置（CORESET#0 指示）、小区 barred 状态、SFN 高位等接入必需的最小参数。PBCH DMRS 与 UE 侧无先验信息兼容：序列由 PCI 与 SSB 索引低位决定，兼做解调参考与隐式信令。

## 详细展开

**MIB 的关键字段**（面试点）：

- **systemFrameNumber**：SFN 高 6 位（低 4 位由 PBCH 的编码/扰码隐式携带）。
- **subCarrierSpacingCommon**：SIB1/寻呼/MSG2 等"公共信道的 SCS"（15/30/60/120 kHz 枚举），统一告知后续公共信道参数集。
- **ssb-SubcarrierOffset**：SSB 子载波 0 与公共资源栅格的对齐偏移（kSSB），是 UE 从 SSB 推算整个载波频域位置的关键。
- **DMRS 类型指示（1 bit）**：PBCH DMRS 序列初始化用，配合 PCI。
- **pdcch-ConfigSIB1**：CORESET#0 的频域/时域配置索引（查预定义表）与搜索空间参数，UE 据此收 SIB1。
- **cellBarred / intraFreqReselection**：小区禁止接入标志与同频重选许可。
- **半帧指示**：指示 SSB 在前半帧还是后半帧，配合确定系统定时。

**PBCH DMRS 设计**：

- 每 SSB 内 PBCH 的 240×4 资源中，DMRS 以特定图样（每 4 个子载波插 1 个 RE，两符号间偏移交替）散布，密度与 LTE CRS 相近。
- 序列由 PCI 与半帧指示、SSB 索引低 2 位（FR1）/低 3 位（FR2）共同初始化——**UE 在解码前就可利用 DMRS 序列猜测 SSB 索引**，把"隐式信令"做进参考信号里。
- PBCH 内容本身还有扰码（与 SSB 索引高位、SFN 低位相关）+ 极化编码 + QPSK，两级冗余保证弱覆盖下仍可解。

**设计哲学**：UE 初始接入时对小区一无所知，PBCH 把"知道少量参数即可推出全部"作为原则——拿到 PCI + SSB 索引 + MIB，就能推出后续所有公共信道的时频位置。

## 关联考点

- [SSB 的组成（PSS/SSS/PBCH）与时频位置](/02-物理层/ch02-q010-ssb-composition)
- [PSS/SSS 序列设计与小区 ID 规划](/02-物理层/ch02-q014-pss-sss-pci-planning)
- [RMSI/SIB1 调度与 SSB 的时频复用关系](/02-物理层/ch02-q015-rmsi-sib1-ssb-mux)

## 面试追问

- **为什么 SFN 不整个放进 MIB？** —— MIB 比特预算紧张，低 4 位用 PBCH 编码扰码隐式携带可省 4 bit；UE 逐次解出高位后结合隐式位恢复完整 SFN，10.24 s 循环内自洽。
- **PBCH DMRS 为什么要把 SSB 索引编进序列？** —— 波束扫描下不同 SSB 索引对应不同波束，UE 从 DMRS 相位差即可判断收的是哪个候选波束，省去显式信令，弱覆盖下提高鲁棒性。
- **kSSB（ssb-SubcarrierOffset）解决什么问题？** —— SSB 的 SCS 与数据信道 SCS 可能不同，SSB 与公共资源栅格不一定对齐；kSSB 给出偏移量，UE 由此换算出整个载波公共栅格的频域位置。
