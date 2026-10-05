---
title: K-offset（k_offset）的定义、用途与取值来源
chapter: 9
difficulty: 中
frequency: 高
tags: [NTN, 调度, 时序]
---

## 一句话答案

K_offset（TS 38.331 中的 cellSpecificKoffset）是 NTN 中把上行调度时序整体推迟的时隙级偏移量：DCI 调度的 PUSCH、以及 PDSCH→HARQ-ACK、PUSCH→PHR 等时序关系都额外加 K_offset 个时隙，用来覆盖"UE 上行预补偿后的残余传播时延差"。取值由网络按小区（链路时延类型）在 SIB 中配置，单位为时隙，与 SCS 相关，且与 UE 具体位置无关、属小区级参数。

## 详细展开

**问题的由来**：地面 NR 中 DCI→PUSCH 用 K2、PDSCH→HARQ-ACK 用 K1 的时隙级时序假设的是"调度器已知上行到达时刻"。NTN 中 UE 按各自位置预补偿定时后，信号"名义上"在基站侧对齐，但调度器要保证处理/传输时间仍需把上行授权在时间上提前一个与传播时延相关的量；同时 GEO/LEO 的 RTT 让标准 K1 时序放不下 HARQ 反馈窗口。38.211/38.214 修改的 NTN 时序关系统一用 K_offset 表达。

**定义要点**（38.331 cellSpecificKoffset 字段说明）："Scheduling offset used for the timing relationships that are modified for NTN [see TS 38.211]。The unit of the field K_offset is ..."——即 K_offset 是**小区专属调度偏移**，作用于被 NTN 修改的定时关系，单位是时隙数（按子载波间隔换算）。

**K_offset 出现在哪些关系里**（R17）：

1. 跨时隙调度的 PUSCH（DCI→PUSCH，等效 K2' = K2 + K_offset）；
2. PDSCH 接收→HARQ-ACK 反馈（K1' = K1 + K_offset）；
3. 随机接入中 MsgA 相关时序、PUSCH→PHR 等被 38.211/38.213 声明的 NTN 修改项。

**取值来源**：K_offset 是**网络配置的小区参数**，不是 UE 算的。网络依据"参考点链路时延类型"（LEO 600/1200、GEO 等类别，38.211 定义了参考 K_offset 值域）与小区 SCS 选定取值并广播；UE 无需知道"别的 UE 在哪"——K_offset 补偿的是小区公共的调度余量，UE 差异部分由公共 TA/自主 TA 机制处理。因此它同时服务于 GEO 的大 RTT（HARQ 窗口后移）与 LEO 的定时不确定余量。

一句话记忆：**K_offset = 把整条调度时间线向未来平移的"小区级缓冲"，时序公式 K' = K + K_offset。**

**规范依据**：TS 38.331 cellSpecificKoffset（SIB，NTN-Config）；TS 38.211 §4.2（NTN 定时关系修改）

## 关联考点

- 多普勒与时延量级（为什么需要 K_offset）：[多普勒与时延量级](./ch09-q004-doppler-delay-analysis.md)
- HARQ 禁用（GEO 下 K_offset 也救不活 HARQ 窗口时）：[HARQ 禁用](./ch09-q010-harq-disable-ntn.md)
- 公共 TA 与差分定时：[公共 TA](./ch09-q007-common-ta-ue-location.md)
- 上行定时预补偿：[定时预补偿](./ch09-q009-uplink-timing-precompensation.md)

## 面试追问

- **K_offset 和 K2 有什么区别？** —— 要点：K2 是 DCI 与 PUSCH 之间的动态调度时隙（每 UE 每次可变）；K_offset 是小区广播的公共附加项，任何 NTN 时序公式都要叠加，二者相加生效，概念上 K_offset 覆盖"传播时延余量"、K2 覆盖"调度灵活性"。
- **为什么 K_offset 是小区级而不是 UE 级？** —— 要点：它补偿的是相对参考点的公共链路时延量级，UE 间差异已由 TA 机制吸收；小区级配置让 DCI 开销不增加、实现简单；个别残余靠闭环 TA 与调度器余量。
- **K_offset 会加大 HARQ 进程数需求吗？** —— 要点：会——时序整体后移拉长单进程往返时间，RTT/T_slot 增长；这正是 NTN 允许网络禁用 HARQ 反馈、或减小激活进程数的动因之一。
