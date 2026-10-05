---
title: RLC UM 与 VoNR 语音承载的适配
chapter: 4
difficulty: 中
frequency: 中
tags: [RLC, UM, VoNR, 语音]
---

## 一句话答案

VoNR 语音包对时延极其敏感、对"重传来迟的旧包"反而无价值，因此其 DRB 配置为 PDCP 无重传（不做重排序等待的极端形态）+ RLC UM（Unacknowledged Mode，非确认模式）+ MAC HARQ 重传的组合：靠 HARQ 快速重传保住大部分丢包，剩余丢失交给语音解码器的丢包隐藏，换取确定性低时延。

## 详细展开

**语音承载的 QoS 特性**：会话语音 5QI=1，GBR 类型，要求时延约 100 ms、丢包率 1% 量级；空口各层配置都围绕"时延优先、允许少量丢包"设计。

**各层配置**：

| 层 | VoNR 配置 | 理由 |
|---|---|---|
| SDAP | 正常 QFI 映射（GBR 流独占 DRB） | 调度隔离保证 GFBR |
| PDCP | 关闭重排序等待/丢弃定时器取短值；不做 PDCP 重传；可开 ROHC（语音头压缩收益大） | 时延优先，头压缩对 RTP/UDP/IP 小包收益显著 |
| RLC | UM 模式（无状态报告、无重传） | AM 的重传反馈循环时延不可接受；迟到的重传包无法插入解码 |
| MAC | HARQ 重传开启（Chase combine/IR），可配较高重传次数上限；语音可用半持续调度或 CG 类承载 | HARQ 反馈快（毫秒级），是丢包率的主力保障 |
| PHY | 固定/受限 MCS、较大分配冗余 | 保证单次传输成功率 |

**为什么 UM 而不是 AM**：

1. **时延预算**：AM 状态 PDU 往返+重传常超过语音时延预算，重传成功也"迟到"。
2. **解码特性**：AMR/EVS 解码器自带丢包隐藏（PLC），随机丢 1% 不可闻；把重传时延换掉更划算。
3. **对称性**：语音双向等时，UM 简化发送端缓冲与接收端乱序处理。

**HARQ 与 UM 的分工**：HARQ 负责"几毫秒内的救命重传"（同一进程 RV 递增合并），UM 层完全不设确认；若 HARQ 重传后仍失败，该包就此丢失——这正是语音承载丢包率的统计来源，网优上通过调 HARQ 上限/资源冗余控制丢包率。

**配套细节**：语音 DRB 的 PDCP discardTimer 通常取短（如几十毫秒量级），过期即丢——宁可丢包也不发过期帧；测量报告中语音包 PDCP 丢包率是常见 KPI。

## 关联考点

- [RLC 三种模式 TM/UM/AM 的适用承载类型](ch04-q010-rlc-modes.md)
- [PDCP 丢包处理与 SDU 丢弃定时器](ch04-q038-pdcp-discard-timer.md)
- [HARQ 实体与进程管理（上下行差异）](ch04-q019-harq-process.md)
- [上行免调度 CG 类型1/类型2 的配置与使用](ch04-q035-cg-type1-type2.md)

## 面试追问

- **VoNR 为什么不做 RLC 重排序？** —— UM 模式本身无重排序（NR 中重排序整体上移到 PDCP，且语音 DRB 的 PDCP 重排序等待也被短 discardTimer/直接递交策略压制），乱序迟到的包按过期丢弃直接进解码，保证播放连续。
- **语音丢包率超标从哪些层排查？** —— 看 HARQ 重传率与失败率（物理层覆盖/MCS 配置）、PDCP 丢弃计数（discardTimer 过短或空口拥塞）、GBR 是否被抢占（调度器配置）；按"PHY→MAC→PDCP"顺序归因。
- **LTE VoLTE 也是 RLC UM，NR 有什么新变化？** —— 结构一脉相承（UM+HARQ）；差异是 NR 引入 SDAP/QFI 管理语音流、PDCP discardTimer 与重排序策略更灵活、以及可用 CG/半持续方式承载周期语音包，调度形态更多样。
