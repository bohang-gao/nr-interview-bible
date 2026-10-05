---
title: DRB 与 QoS flow 的映射关系（含主辅节点拆分）
chapter: 4
difficulty: 中
frequency: 中
tags: [QoS, DRB, SDAP, 双连接]
---

## 一句话答案

5G QoS 流（QoS flow）是核心网侧的最低 QoS 粒度，DRB 是空口侧的实际传输通道，两者靠 SDAP 层灵活映射：多个 QoS 流可复用一个 DRB（前提是 5QI/ARP 等属性一致），一个 QoS 流也可以随数据量在不同 DRB 间切换。双连接下 DRB 还可以拆分为 MCG/SCG/split 三种承载形态，由主节点（MN）或辅节点（SN）各自终结 PDCP。

## 详细展开

**映射规则**（SDAP 视角）：

1. **多对一聚合**：属性相同的多个 QoS 流映射到同一 DRB，省空口资源、减少 PDCP 实体；条件是这些流不允许有不同的 SDAP 处理与 PDCP 特性冲突。
2. **一对一独占**：GBR（Guaranteed Bit Rate，保证比特速率）流通常独占 DRB，保证调度隔离与确定性时延。
3. **动态切换**：同一 QoS 流的数据可在不同 DRB 间切换（如主路拥塞时换路），SDAP 头里带 QFI（QoS Flow Identifier，QoS 流标识）让接收端识别归属。
4. **映射建立方式**：RRC 显式配置（RRCReconfiguration 指明 flow↔DRB 映射表）或反射 QoS（UE 从下行包的 QFI 学到映射并在上行照搬）。

**双连接下的承载形态**（PDCP 落在哪边）：

| 形态 | PDCP 位置 | 特点 |
|---|---|---|
| MCG bearer | MN（主节点） | 只走 MN 空口，SN 不参与该承载 |
| SCG bearer | SN（辅节点） | 只走 SN 空口，核心网/MN 不经手数据 |
| Split bearer | MN，但可在 MN/SN 间拆分 | PDCP 层把数据分流到两空口，聚合吞吐 |

关键点：split 承载的分流在 PDCP 完成（PDCP 层唯一），RLC 及以下在各自节点独立终结；这就是"CU/DU 与 DC 架构下 PDCP 是数据锚"的由来。EN-DC 下 MCG split bearer 还存在走 LTE PDCP 还是 NR PDCP 的选项差异（对应 Option 3x 的概念基础）。

**与 LTE 承载的本质区别**：EPS 承载是"核心网—空口"端到端一一对应，QoS 粒度绑死在承载上；5G 把"QoS 粒度"（flow）与"传输通道"（DRB）解耦，映射交给 SDAP，网络可按负载灵活重组。

## 关联考点

- [SDAP 层的引入与 QoS flow 到 DRB 的映射](ch04-q003-sdap-qos-flow-drb.md)
- [反射 QoS（RQA）的工作机制](ch04-q004-reflective-qos.md)
- [MCG bearer、SCG bearer 与 split bearer 的区别及选择](../01-无线基础与演进/ch01-q007-bearer-types.md)
- [EN-DC 下主节点/辅节点协议栈的差异](ch04-q034-en-dc-mn-sn-stack.md)

## 面试追问

- **为什么 GBR 流倾向独占 DRB？** —— GBR 有确定的 GFBR/MFBR 要求，独占 DRB 便于调度器按流的保证速率隔离资源、独立做丢包/时延统计，与非 GBR 数据混跑会互相干扰。
- **split bearer 的分流比例谁决定？** —— 终结 PDCP 的节点（gNB）内部算法决定，基于两腿的缓存、信道质量与速率，空口协议只提供每腿的传输通道；核心网无感知。
- **QoS 流切换 DRB 后，PDCP SN 还连续吗？** —— 该流的 PDCP 实体若不变则 SN 连续；若换到另一个 PDCP 实体，网络通过重配置保证数据前转与重排序衔接，避免丢包与乱序。
