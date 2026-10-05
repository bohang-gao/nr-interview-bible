---
title: HARQ 与 RLC ARQ 的分工协作关系
chapter: 4
difficulty: 中
frequency: 高
tags: [HARQ, ARQ, 重传, 分层]
---

## 一句话答案

HARQ 在 MAC/PHY 层做"快速、短周期"重传——毫秒级时序、软合并增益、对上层透明；RLC AM 在上层做"慢速、可靠兜底"重传——HARQ 用尽仍失败（ACK/NACK 丢失、误判）时由状态 PDU 触发整包恢复。两者是"快慢双保险"：HARQ 追求低时延高吞吐（目标残留误码极低），ARQ 提供最终可靠性，PDCP 状态报告再兜住跨重建场景，三层重传各司其职。

## 详细展开

**逐维对比表**（面试核心答题框架）：

| 维度 | HARQ（MAC/PHY） | RLC ARQ（RLC AM） |
|---|---|---|
| 位置 | MAC + PHY（软合并） | RLC 层 |
| 触发依据 | 每次传输的 1 bit ACK/NACK | 状态 PDU 的 NACK（SN 粒度） |
| 重传粒度 | TB（传输块），固定分段 | RLC PDU/分段（NR 不再重分段） |
| 时延量级 | 毫秒级（几~几十 ms） | 十~百毫秒级（等 t-Reassembly/轮询） |
| 合并增益 | 有（软合并/IR） | 无（就是重新发一次） |
| 反馈可靠性 | ACK 可能被 UE 漏检/虚 ACK，NACK 丢失则数据"悬空" | 状态 PDU 经 HARQ 保护后仍丢可再轮询 |
| 开销 | 1 bit 反馈 + 重传调度 | 状态 PDU + 重传，开销大 |
| 兜底上限 | 进程循环使用，无重传计数上限（gNB 控制） | maxRetxThreshold 超限 → 链路失败 |

**为什么 HARQ 已经很可靠还需要 ARQ**：

1. **HARQ 有盲区**：UE 把 NACK 误判为 ACK（DCI 漏检/PUCCH 误码）时，gNB 认为发送成功、UE 侧数据缺失——这个"假成功"HARQ 自己发现不了，只有 RLC 层按 SN 发现缺口；
2. **HARQ 无跨进程状态**：进程循环覆盖，gNB/UE 都不无限保留失败记录，长间隔的丢失无感知；
3. **重建清缓冲**：切换/重建时 HARQ 与 RLC 缓冲全部清空，只有 PDCP 层（状态报告重传）能恢复跨重建的丢失。

**协作时序示例（口播模板）**：下行 TB 初传 NACK → gNB 2 ms 后 HARQ 重传（RV1）→ 仍 NACK → 再重传（RV2）→ 这次 UE 收对但 ACK 丢失 → gNB 以为成功继续新数据 → RLC 接收端 t-Reassembly 超时发现缺口 → 发状态 PDU NACK → gNB RLC 重传该 SN → 缺口补齐。整个链条展示"快层兜不住的慢层补"。

**目标分工**：HARQ 把单 TB 误码压到 10⁻¹~10⁻² 量级以下后不再无限重试（影响吞吐的抖动交给上层）；RLC AM 负责把端到端残留错误压到接近零（除 UM 语音类业务）——"HARQ 管效率、ARQ 管可靠"。

**NR 的新配合点**：PDCP 状态报告重传（跨重建兜底）、t-Reassembly 与 HARQ 时序联动（给 HARQ 足够轮次后才触发 RLC 反馈）、CG 双进程重传（HARQ 内部强化，减少向上求助频率）。

## 关联考点

- [HARQ 实体与进程管理（上下行差异）](ch04-q019-harq-process.md)
- [RLC AM 的重传与状态 PDU（注意 NR 无重分段）](ch04-q011-rlc-am-retransmission.md)
- [PDCP 重排序与按序递交（含重建/切换场景）](ch04-q006-pdcp-reordering.md)
- [RLC 三种模式 TM/UM/AM 的适用承载类型](ch04-q010-rlc-modes.md)

## 面试追问

- **能不能只用 HARQ 不用 ARQ？** —— 对时延敏感可容忍丢包业务可以（UM 模式承载就是如此）；但"假 ACK"盲区决定了高可靠业务必须有 SN 粒度的上层校验，否则丢失不可发现。
- **能不能只用 ARQ 不用 HARQ？** —— 理论可以但性能崩塌：每次重传都要等上层往返，无软合并增益，时延与吞吐都会大幅恶化；HARQ 的"物理层快速反馈 + 合并"是频谱效率的基础，两者结合是"快慢互补"的最优解。
- **RLC 重传次数超限和 HARQ 失败是什么关系？** —— HARQ 失败不计数到 RLC（HARQ 重传对 RLC 透明）；只有 HARQ 最终放弃（NACK 后不再重传，数据未到接收 RLC）导致 RLC 层持续缺口、重传超 maxRetxThreshold，才升级为链路失败。
