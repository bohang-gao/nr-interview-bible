---
title: "初始 BWP 与 SIB1 中 BWP 配置的关系"
chapter: 2
difficulty: 难
frequency: 中
tags: [BWP, SIB1, 小区选择]
---

## 一句话答案

初始 BWP 是 UE 接入阶段使用的"公共 BWP"，下行初始 BWP 必须包含 CORESET#0（MIB 指示的 SIB1 控制资源集）及其调度的 SIB1；SIB1 通过 initialDownlinkBWP/initialUplinkBWP 把这套参数显式下发给 UE，作为后续配置专用 BWP 和跳转的起点。

## 详细展开

**搜索/接入链条**：UE 完成小区搜索拿到 MIB → MIB 中 pdcch-ConfigSIB1 指示 CORESET#0 的频域位置与搜索空间配置 → UE 在该 CORESET#0 上盲检调度 SIB1 的 PDCCH（SI-RNTI 加扰）→ 收到 SIB1。这条链路全程发生在"初始 BWP"内。

**SIB1 里的三段 BWP 信息**：

1. **initialDownlinkBWP / initialUplinkBWP**：把初始 BWP 的位置（频域起点+带宽）、参数集、CORESET#0、公共搜索空间、随机接入相关参数（RACH 资源等）显式固化。UE 在 RRC 连接建立前只用这套配置。
2. **uplinkConfig / downlinkConfig 中的第一套专用 BWP**：SIB1 可能顺带给出该小区的默认专用 BWP 配置池，供连接态使用。
3. **配套公共参数**：如 PUCCH 资源、PRACH 配置，都定义在初始上行 BWP 内。

**关键关系**：

- 初始下行 BWP 必须覆盖 CORESET#0（否则收不到 SIB1 调度），因此其位置/带宽与 MIB 中的 CORESET#0 指示天然绑定。
- 若 SIB1 未配置专用 BWP，UE 连接态继续用初始 BWP 收发。
- 专用 BWP 可以在初始 BWP 之外（更大带宽、不同参数集），UE 从初始 BWP 经 RRC 重配或 DCI 切换进入。

**设计意图**：把"驻留/接入所需的最小信息"与"业务态大带宽配置"解耦——UE 不必先支持整载波带宽也能完成接入，这与 BWP 支持窄能力终端的目标一致。

## 关联考点

- [BWP 的概念、作用与四类 BWP 配置](/02-物理层/ch02-q007-bwp-basics)
- [BWP 激活与切换机制](/02-物理层/ch02-q008-bwp-switching)
- [RMSI/SIB1 调度与 SSB 的时频复用关系](/02-物理层/ch02-q015-rmsi-sib1-ssb-mux)

## 面试追问

- **CORESET#0 和初始 BWP 是一回事吗？** —— 不是。CORESET#0 只是承载 SIB1 调度 PDCCH 的控制资源集，由 MIB 指示；初始 BWP 是包含它的更大频域范围，SIB1 再把整体边界固化下来。
- **UE 还没读到 SIB1 时靠什么知道初始 BWP？** —— 靠 MIB：MIB 指示 CORESET#0（含 SCS 与频域位置表项），由此推出下行初始 BWP 的关键参数；上行部分（PRACH 等）要等 SIB1。
- **SSB 一定要在初始 BWP 内吗？** —— SSB 与初始 BWP 的中心频点/位置关系由协议约束，通常要求初始 BWP 能覆盖 SSB 或与 SSB 有确定的偏移关系，保证 UE 搜到 SSB 后能推出接收初始 BWP 的方式。
