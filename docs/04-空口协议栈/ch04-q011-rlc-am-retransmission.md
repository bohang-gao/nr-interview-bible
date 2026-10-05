---
title: RLC AM 的重传与状态 PDU（注意 NR 无重分段）
chapter: 4
difficulty: 中
frequency: 中
tags: [RLC, ARQ, 状态PDU, 重分段]
---

## 一句话答案

RLC AM 通过状态 PDU（STATUS PDU）反馈接收情况——包含"最高已收连续 SN 的确认（ACK_SN）"与"缺口列表（NACK）"，发送侧只重传 NACK 指示的 PDU/分段，配合 t-PollRetransmit 主动轮询、t-Reassembly 与 t-StatusProhibit 三个定时器协调节奏。NR 相对 LTE 的重要变化是删除了重分段（re-segmentation）：重传按原始分段大小直接发送，简化协议、降低实现复杂度。

## 详细展开

**状态 PDU 结构要点**：

- ACK_SN：表示此 SN 之前的所有 RLC PDU（含其全部分段）都已正确接收；
- NACK_SN 列表：指出缺失的 SN；每个 NACK 可携带 soStart/soEnd 字段指示只缺该 PDU 的某个字节区间（分段级 NACK）；
- 状态 PDU 由 AM 实体在对方轮询请求或自身检测到缺口（t-Reassembly 超时）时生成，t-StatusProhibit 限制发送频率防止反馈风暴。

**发送侧重传决策链**：

1. 收到 NACK_SN → 将对应 PDU（或分段）标记待重传；
2. 重传计数 +1，超过 maxRetxThreshold → 上报上层失效（链路失败路径）；
3. 重传数据优先级高于新数据，但受 LCP 资源约束按逻辑信道优先级参与调度；
4. NR 无重分段：重传的 PDU 尺寸与初次发送一致，MAC 层若资源不够容纳，只能靠分段由 RLC 初次分配时控制（或等待更大 grant）——这是"以协议简化换调度灵活性"的取舍。

**为什么 NR 砍掉重分段**：

- LTE 时代 MAC 串联导致 TB 尺寸与 RLC PDU 独立，重传资源不足时必须把 RLC PDU 切更碎；
- NR 改由 RLC 层串联组包（RLC 侧把多个 PDCP PDU 串成一个 RLC PDU），PDU 大小与 MAC 调度联动更紧密，配合"重传不分段"减少接收端缓冲管理与状态跟踪复杂度；
- 副作用：若重传时刻 grant 小于 PDU 尺寸，只能整体延后或多次调度拼接（padding 处理），调度器需要更精细的资源预留。

**轮询机制**：发送侧通过 PDU 头中的 P 位（polling bit）请求对端立即回状态报告；触发条件包括缓冲数据发完、重传次数到门限、t-PollRetransmit 超时等——保证"发送方不会无限等反馈"。

**与 HARQ 的时序关系**：HARQ 在 MAC 先快速救（毫秒级），HARQ 仍失败的才由 RLC ARQ 慢速兜底（十毫秒~百毫秒级），状态 PDU 的生成要等 HARQ 确认链路结束后才可靠，这也是 t-Reassembly 给 HARQ 留了时间余量的原因。

## 关联考点

- [RLC 三种模式 TM/UM/AM 的适用承载类型](ch04-q010-rlc-modes.md)
- [HARQ 与 RLC ARQ 的分工协作关系](ch04-q020-harq-arq-split.md)
- [RLC 与 MAC 的功能划分变化（相对 LTE 的取舍）](ch04-q012-rlc-mac-function-split.md)

## 面试追问

- **NACK 能精确到分段吗？** —— 能，AM 状态 PDU 的 NACK_SN 可带字节区间指示（soStart/soEnd），只请求缺失分段；但 NR 重传时不会再把这个分段切更小（无重分段）。
- **t-StatusProhibit 有什么用？** —— 限制状态 PDU 的发送频率，避免接收侧每个缺口都回报告造成上行资源被反馈挤占；期间即使有新缺口也合并等待，直到禁止窗结束。
- **RLC 重传和 PDCP 重传什么关系？** —— RLC 重传救"RLC 仍在运行期间的丢失"；PDCP 状态报告重传兜"RLC 重建/切换后缓冲被清"的场景，作用域不同、互补共存。
