---
title: "SSB 周期、GSCN 频栅与小区搜索的关系"
chapter: 2
difficulty: 中
frequency: 中
tags: [SSB, 小区搜索, 同步栅格]
---

## 一句话答案

SSB 落在同步栅格（GSCN, Global Synchronization Channel Number）而非信道栅格上，UE 只需在同步栅格上逐点搜索；SSB 突发集周期由 SIB1 配置（默认 20 ms），UE 驻留后无需每个周期都接收。两者共同决定 UE 开机搜网的速度与耗电。

## 详细展开

**同步栅格（GSCN）**：LTE 的 UE 必须按 100 kHz 信道栅格逐点搜索同步信号，频段越宽搜得越久。NR 把 SSB 放到更稀疏的同步栅格上（FR1 每 1.2 MHz 左右一个候选点，FR2 每 14.4 MHz 左右一个候选点，具体间隔随频段分档），相邻信道中心可任意摆放，SSB 独立对齐到 GSCN。GSCN 编号与频点的映射规则在协议表中有分档定义，面试记住"同步栅格比信道栅格稀疏、专供搜索"即可。

**搜索流程**（与 GSCN 的关系）：

1. UE 按频段枚举 SSB 的 SCS 候选（FR1：15/30 kHz；FR2：120/240 kHz）。
2. 沿同步栅格逐点尝试 PSS 相关检测 → 找到后做 SSS 获取小区 ID → 解 PBCH 拿 MIB。
3. MIB 中 pdcch-ConfigSIB1 指出 CORESET#0 位置 → 收 SIB1 → 获得完整系统配置。

**SSB 突发集周期**：可配 5/10/20/40/80/160 ms，SIB1 默认指示 20 ms。周期越长基站越省功耗/开销，UE 初搜耗时越长；驻留后 UE 只需按周期监测寻呼与测量所需 SSB，不必逐周期解码全部 SSB。

**对部署的意义**：

- SSB 频点独立于载波中心，运营商可将 SSB 摆在传播特性好的低频位置（载波内任意 GSCN 点），终端搜网与载波带宽解耦。
- 多运营商共享载波时，各自的 SSB 可放在不同 GSCN 点互不干扰。

## 关联考点

- [SSB 的组成（PSS/SSS/PBCH）与时频位置](/02-物理层/ch02-q010-ssb-composition)
- [SSB 突发集与波束扫描（L_max 与频段的对应）](/02-物理层/ch02-q011-ssb-burst-beam-sweep)
- [RMSI/SIB1 调度与 SSB 的时频复用关系](/02-物理层/ch02-q015-rmsi-sib1-ssb-mux)

## 面试追问

- **为什么 NR 要单独设计同步栅格？** —— 若沿用信道栅格搜索，数百 MHz 的 FR2 载波要搜的点太多、开机时延不可接受；同步栅格稀疏化把搜索复杂度降低一个量级，代价是 SSB 频点灵活性略受限。
- **SSB 周期配长有什么副作用？** —— 初次搜网/小区重选时间变长，UE 侧同步维持与测量的样本变稀；对驻留用户省电有利，对快速移动场景测量更新变慢。
- **UE 搜到 SSB 后如何知道带宽和 SCS 去收 SIB1？** —— MIB 给出 CORESET#0 的 SCS（pdcch-ConfigSIB1 中的表项隐含参数集）与频域位置，UE 据此在对应资源上盲检 SI-RNTI 加扰的 PDCCH。
