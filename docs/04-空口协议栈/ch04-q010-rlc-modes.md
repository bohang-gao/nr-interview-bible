---
title: RLC 三种模式 TM/UM/AM 的适用承载类型
chapter: 4
difficulty: 易
frequency: 高
tags: [RLC, TM, UM, AM]
---

## 一句话答案

RLC（Radio Link Control，无线链路控制）有三种模式：TM（Transparent Mode，透明模式）不加密不编号、只透传，用于广播/寻呼信道和 SRB0；UM（Unacknowledged Mode，非确认模式）加 SN 与分段但不重传，用于 VoNR 语音、直播等时延敏感可容忍丢包业务；AM（Acknowledged Mode，确认模式）带 ARQ 重传与状态报告，用于绝大多数数据业务和 SRB1/2/3。选型的核心权衡是"可靠性与时延"。

## 详细展开

**三种模式功能对比**：

| 能力 | TM | UM | AM |
|---|---|---|---|
| 加 PDCP 透传外的 RLC 头 | 无 | 有（SN + 分段指示） | 有（SN + 分段/控制字段） |
| 分段/重分段 | 不支持 | 支持（分段） | 支持（分段 + 重分段反馈） |
| 重排序 | 无 | 有（UM 窗口） | 有（AM 窗口） |
| ARQ 重传 | 无 | 无 | 有（状态 PDU + 重传） |
| HARQ 之外的可靠性兜底 | 无 | 靠高层 | 有 |

**典型承载映射**（记忆口诀：T 管"广播"，U 管"话音"，A 管"上网+信令"）：

- **TM**：BCCH（系统消息）、PCCH（寻呼）、SRB0（RRC Setup 前的信令）——共同特点：数据量小、广播型（无单用户重传意义）或安全未激活（做不了编号与反馈）。
- **UM**：DTCH 上语音（VoNR）、视频流媒体等实时业务；MRB 类业务（MBS 广播）也是 UM——特点：宁丢不等，重传的包到时业务早就过期了，HARQ 快速重传已足够。
- **AM**：SRB1/SRB2/SRB3、普通数据 DRB（上网、文件、低时延但需可靠的业务）——特点：丢包不可接受，必须 ARQ 兜底。

**AM 模式关键参数**（面试常追问）：

- t-PollRetransmit：多久没等到对端状态报告就主动发轮询（polling）请求状态；
- t-Reassembly：重排序等待定时器，超时触发状态报告请求缺口重传；
- t-StatusProhibit：状态报告发送抑制定时器，防止状态 PDU 风暴；
- maxRetxThreshold：重传次数上限，超限触发上层（T310/RLF 相关流程）处理——RLC 重传失败是无线链路失败的判据之一。

**UM 模式要点**：SN 长度可配（6/12 bit），接收侧用 t-Reassembly 控制等待窗口；无重传不代表不保序——UM 也做重排序，只是缺口直接跳过不请求重传。

## 关联考点

- [RLC AM 的重传与状态 PDU（注意 NR 无重分段）](ch04-q011-rlc-am-retransmission.md)
- [RLC 与 MAC 的功能划分变化（相对 LTE 的取舍）](ch04-q012-rlc-mac-function-split.md)
- [NR 用户面协议栈总览与各层职责](ch04-q001-up-stack-overview.md)
- [HARQ 与 RLC ARQ 的分工协作关系](ch04-q020-harq-arq-split.md)

## 面试追问

- **为什么语音用 UM 不用 AM？** —— 语音有时延预算（约百毫秒级），AM 重传到的包往往超时失效还占资源；语音编码自带的抗丢包（AMR 冗余、抖动缓冲插值）比 ARQ 更划算，所以"宁丢不重"。
- **SRB0 为什么是 TM？** —— RRC Setup 之前安全还未激活、C-RNTI 还没分配，没有可靠的反馈信道与安全上下文，RLC 只能透传；这些消息靠 MAC/PHY 层的重复发送（如 Msg2/Msg4 重传）保底。
- **AM 重传次数超限后发生什么？** —— RLC 向上层（RRC）报失效，UE 侧行为归结为无线链路失败处理（如发起重建立），这是协议栈逐层失败逐级上抛的典型设计。
