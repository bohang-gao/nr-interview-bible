---
title: HARQ 实体与进程管理（上下行差异）
chapter: 4
difficulty: 难
frequency: 高
tags: [HARQ, MAC, 进程数, 上下行]
---

## 一句话答案

HARQ（Hybrid Automatic Repeat reQuest，混合自动重传请求）在 MAC 层由 HARQ 实体管理多个并行的 HARQ 进程，采用"停止-等待多进程"机制：一个进程等反馈期间其他进程继续传输，填满流水线。上下行关键差异：下行是异步自适应 HARQ（gNB 调度器灵活选时频资源与 MCS，进程号由 DCI 显式指示）；上行在带动态授权时为异步自适应，配置授权场景可为同步 HARQ，且上行最多可配两个 HARQ 进程同时待发（pucch 资源对受限时），上行还有 PHICH 已取消、反馈靠 PDSCH 上的 HARQ-ACK 调度等 NR 新变化。

## 详细展开

**HARQ 基础机制**：

- 每个进程对应一个缓冲 + 状态机：接收端对失败 TB 保存软信息（soft combining， chase combining/IR 增量冗余），重传到达后与旧软信息合并解码；
- 反馈 1 bit HARQ-ACK（ACK/NACK），下行在 PUCCH/PUSCH 上反馈，上行反馈由 gNB 在 PDCCH/PDSCH 中指示；
- 重传的冗余版本 RV（0/1/2/3 轮转）支持增量冗余，初次传输 RV0。

**下行 HARQ（gNB → UE）**：

- **异步（asynchronous）**：重传时机不固定，由调度器按当前资源情况决定；
- **自适应（adaptive）**：重传可换频域资源、换 MCS/层数；
- 进程号（HARQ process ID）由 DCI 显式携带；UE 每个下行 HARQ 实体维护多个进程缓冲；
- 反馈时序：PDSCH → 对应 PUCCH/PUSCH 的 ACK 时隙由 K1 指示（DCI 中），支持一次反馈多个进程（半静态码本）。

**上行 HARQ（UE → gNB）**：

- 动态授权下：异步自适应（NR 与 LTE 最大差异之一——LTE 上行是同步非自适应，PHICH 反馈 + 固定时序重传；NR 取消 PHICH，NACK 后由 gNB 重新调度）；
- 配置授权（CG）下：同步 HARQ（固定周期时序），重传也按预配置时序，可非自适应（省信令，URLLC 友好）；
- 上行 CG 场景可配**两个 HARQ 进程并行的重复发送**（two HARQ processes for CG，时域上前后两次授权交叠窗口），提升可靠性。

**进程数与时延带宽积**：

- 进程数必须 ≥ "传输到反馈 + 反馈到重传"的往返时隙数，否则流水线断流；
- 时隙粒度下典型往返 7~9 时隙（数值取决于 numerology 与 K1 配置），自包含时隙结构（self-contained slot：同 slot 内收发+反馈）可压缩进程需求；
- 子时隙/minislot（URLLC）进一步降低单进程占用时长。

**软合并两式对比**：

| 方式 | 原理 | 特点 |
|---|---|---|
| Chase Combining | 重传同样比特，直接叠加能量 | 实现简单，增益有限 |
| 增量冗余 IR | 重传发不同冗余位（RV 变化），编码增益提升 | 需要更多缓冲，增益更高，NR 主用 |

**NR 与 LTE HARQ 的关键差异清单**：取消 PHICH（上行 NACK 靠重调度）、上行支持异步自适应、引入 self-contained slot 与 minislot、支持 CG 同步 HARQ 与双进程 CG 重传、反馈码本增强（Type I/II 半静态/动态码本）。

## 关联考点

- [HARQ 与 RLC ARQ 的分工协作关系](ch04-q020-harq-arq-split.md)
- [MAC 层主要功能与逻辑信道复用](ch04-q013-mac-functions-mux.md)
- [RLC AM 的重传与状态 PDU（注意 NR 无重分段）](ch04-q011-rlc-am-retransmission.md)
- [什么是 BWP 的概念与作用](/02-物理层/ch02-q007-bwp-basics)

## 面试追问

- **为什么上行 CG 要支持两个 HARQ 进程并行？** —— CG 周期固定，若单进程必须等 ACK 才能下一次发送，周期就得拉长（时延↑）；双进程允许"第 N 次 CG 发新数据、第 N-1 次还在等反馈/重传"，在保持周期不变的前提下叠加可靠性（连续多次重复）。
- **HARQ 进程数不够会怎样？** —— 流水线停顿：进程在等反馈时无新数据可发，空口出现空闲时隙，吞吐直接受损；配置进程数要按 numerology/时延配置（K1+K2 往返）留足余量。
- **自适应与非自适应重传怎么选？** —— 自适应灵活但每次重传都要 DCI（信令开销）；非自适应沿用原资源与时序（省信令、时延确定）；下行数据/动态调度用自适应，CG 上行可用非自适应保 URLLC 时延确定性。
