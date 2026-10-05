---
title: "SSB 的组成（PSS/SSS/PBCH）与时频位置"
chapter: 2
difficulty: 易
frequency: 高
tags: [SSB, 同步, 小区搜索]
---

## 一句话答案

SSB（Synchronization Signal and PBCH block，同步信号块）由主同步信号（PSS）、辅同步信号（SSS）和物理广播信道（PBCH）共 4 个 OFDM 符号、240 个子载波（20 个 RB）构成，频域 20 RB、时域 4 符号。PSS/SSS 用于时频同步与小区 ID 识别，PBCH 携带 MIB。

## 详细展开

**结构与资源映射**（240 子载波 × 4 符号 = 960 RE）：

| 符号 | 承载 | 频域位置 |
|---|---|---|
| 符号 0 | PSS | 中间 127 子载波 |
| 符号 1 | PBCH + PBCH DMRS | 全部 240 子载波（SSS 所在段除外） |
| 符号 2 | SSS + PBCH（两侧） | 中间 127 子载波为 SSS，两侧各 60 子载波为 PBCH |
| 符号 3 | PBCH + PBCH DMRS | 全部 240 子载波 |

PSS/SSS 各占 127 个子载波，与 SCS 无关（15~240 kHz 的 SSB 都是 127 子载波，SCS 决定的是这 240 子载波对应多大带宽）。PBCH 上有专门的 DMRS（解调参考信号）做相干解调。

**时域位置**：SSB 突发集（burst set）内多个 SSB 按预定义候选位置排布，候选位置数上限 L_max 与频段相关（见关联考点）。每个 SSB 携带的候选索引通过 PBCH DMRS 序列与 PBCH 内容隐式指示，用于后续波束对应与系统信息关联。

**频域位置**：SSB 位于同步栅格（GSCN, Global Synchronization Channel Number）上，与信道栅格解耦——SSB 不必落在信道栅格上，UE 按同步栅格搜索即可找到，大幅减少搜索复杂度。

**作用**：小区搜索第一步（PSS 同步 → SSS 得到小区 ID → PBCH 解 MIB 获得关键系统参数），是 UE 入网的第一站。

## 关联考点

- [SSB 突发集与波束扫描（L_max 与频段的对应）](/02-物理层/ch02-q011-ssb-burst-beam-sweep)
- [PBCH 内容（MIB）与 PBCH DMRS 设计](/02-物理层/ch02-q013-pbch-mib-dmrs)
- [PSS/SSS 序列设计与小区 ID 规划](/02-物理层/ch02-q014-pss-sss-pci-planning)

## 面试追问

- **SSB 为什么占 20 RB 而不是整数个 PRB 对齐其他信道？** —— 240 子载波恰好是 20 个 12 子载波 RB，本身就是 RB 对齐的；127 子载波的 PSS/SSS 是序列长度决定的，居中放置即可，无须对齐到 RB 边界。
- **UE 怎么知道自己收到的是第几个 SSB？** —— PBCH DMRS 序列相位/扰码隐式携带 SSB 索引低 2~3 位，PBCH 载荷再显式携带剩余高位，两者拼出完整候选索引。
- **SSB 的子载波间隔怎么确定？** —— 由频段决定候选集合（FR1 为 15 或 30 kHz，FR2 为 120 或 240 kHz），UE 按频段已知枚举逐一尝试，搜索成功即确定。
