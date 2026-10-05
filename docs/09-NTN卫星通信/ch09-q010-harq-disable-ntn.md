---
title: NTN 中 HARQ 的去激活/禁用与时延的关系
chapter: 9
difficulty: 中
frequency: 高
tags: [NTN, HARQ, 时延]
---

## 一句话答案

NTN 的 RTT（LEO 最高约 26 ms、GEO 约 240~280 ms）远超地面网，HARQ 进程数若按 RTT/T_slot 配置将不可承受，且反馈时延的收益递减，因此 R17 允许网络通过 RRC 对每个 UE 的 HARQ-ACK 反馈进行去激活/禁用（disable），UE 不再发送 HARQ 反馈、重传交给 RLC ARQ 或调度器决策——38.821 评估假设 HARQ 进程数为 RTT/T_slot，并讨论了禁用反馈的方案。

## 详细展开

**HARQ 在 NTN 下的三重压力**：

1. **进程数爆炸**：停等式 HARQ 的进程数 ≥ RTT/T_slot。GEO 下 RTT 约 280 ms，15 kHz SCS 时 T_slot=1 ms，理论上需要数百个进程，远超标准 16 进程上限；38.821 明确"The number of HARQ processes is assumed to be RTT/T_slot"作为评估基线，倒逼方案设计。
2. **增益缩水**：卫星信道接近 AWGN（直射径为主、慢衰落），初次传输误码率已经可以设计得很低，快速重传的统计增益不如地面快衰落信道明显；而付出的代价是反馈上行时隙与处理复杂度。
3. **时序冲突**：PDSCH→HARQ-ACK 时序需叠加 K_offset 后仍受限于物理 RTT，GEO 下调度器等待反馈会显著拉长流水线时延，不利于时延敏感业务。

**R17 的机制落点**：RRC 层为 UE（每 UE 或每 DRB 粒度）配置"禁用 HARQ-ACK 反馈"——UE 接收 PDSCH 后不上报 HARQ-ACK，网络用保守 MCS 或依赖上层重传。这样调度器不再被 RTT 锁住，空口吞吐与时延解耦。禁用与否由网络按场景权衡：GEO/宽带 VSAT 倾向禁用，LEO/低频 IoT 视配置保留部分反馈。

**面试要点框架**：

- 判断题式记忆：**"RTT 大 → 进程多 → 进程上限 16 不够 → 要么不闭环要么禁反馈"**；
- 禁用 HARQ ≠ 没有可靠性：RLC AM 的 ARQ 重传仍在，只是把重传时延从"毫秒级快速重传"换到"慢速高可靠"；
- 与 K-offset 的关系：K_offset 解决"时序公式够不够长"，HARQ 禁用解决"进程数与反馈值不值得"，两者是互补的时延对策。

**规范依据**：TR 38.821 §6.1（HARQ 讨论与进程数假设）、§7.2（HARQ 过程相关提案汇总）；TS 38.331（NTN HARQ 反馈使能/禁用配置）

## 关联考点

- K-offset 与 NTN 定时关系：[K-offset](./ch09-q008-k-offset-definition.md)
- 多普勒与时延量级：[多普勒与时延量级](./ch09-q004-doppler-delay-analysis.md)
- 轨道高度与 RTT：[GEO/MEO/LEO 轨道](./ch09-q003-geo-meo-leo-orbits.md)

## 面试追问

- **禁用 HARQ 后丢包怎么保证？** —— 要点：RLC AM 重传 + 外层 TCP/应用层兜底；信道特性（卫星直射信道低误码）让初次传输可靠性足够高，重传概率小，ARQ 时延代价可接受。
- **为什么 LEO 下也要考虑禁用？** —— 要点：LEO RTT 虽小于 GEO，但 IoT-NTN 终端处理能力弱、进程内存有限，且小包业务反馈占比高；禁用可省功耗与上行开销。
- **HARQ 禁用对调度器有什么要求？** —— 要点：失去反馈后调度器无法感知真实信道，需要依赖 CQI/地理位置保守选 MCS，或结合重传统计做链路自适应。
