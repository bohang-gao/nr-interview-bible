---
title: MAC 层主要功能与逻辑信道复用
chapter: 4
difficulty: 易
frequency: 高
tags: [MAC, 复用, 调度, 逻辑信道]
---

## 一句话答案

MAC（Medium Access Control，媒体接入控制）层是"调度执行层"，核心功能包括逻辑信道与传输信道之间的映射与复用、HARQ 收发、随机接入控制、调度信息上报（BSR/PHR），以及通过 MAC CE 完成快速控制（定时器调整、激活去激活等）。逻辑信道复用就是按 LCP 优先级把多个逻辑信道的数据装进同一个传输块（TB），子头中的 LCID 标明每段数据归属。

## 详细展开

**MAC 功能清单**（按"数据面 + 控制面"记忆）：

- 数据面：逻辑信道→传输信道映射、复用/解复用、HARQ（软合并、反馈、重传调度）；
- 控制面：随机接入过程控制（前导生成、RAR 接收、竞争解决）、定时提前维护；
- 调度辅助：BSR（缓存状态报告）、PHR（功率余量报告）、推荐比特率（推荐速率，多媒体业务用）；
- 快速控制：MAC CE 实现无需 RRC 的低时延配置变更（SPS 激活、DRX 命令、TCI 状态指示等）。

**逻辑信道分类**：

| 类别 | 信道 | 用途 |
|---|---|---|
| 控制信道 | BCCH / PCCH / CCCH / DCCH / DTCH（数据信道，归业务但同属逻辑信道体系） | 广播、寻呼、接入前信令、专用信令 |
| 业务信道 | DTCH | 专用用户数据 |

- BCCH/PCCH/CCCH 走各自专属处理（TM 模式等），DCCH/DTCH 才参与 MAC 复用调度。

**复用机制细节**：

1. **MAC PDU 结构**：由若干 MAC 子 PDU 组成——MAC 子头（含 LCID、长度字段）+ MAC SDU（RLC PDU）或 MAC CE 或 padding；
2. **LCID（Logical Channel ID，逻辑信道标识）**：子头中的 6 bit 标识，既标识数据来源逻辑信道，也预留了 MAC CE 的专用索引——所以 MAC CE 本质是"特殊 LCID 的子 PDU"；
3. **复用规则**：一个 TB 一个 MAC PDU，同一 TB 可含多逻辑信道数据；HARQ 每进程一次一个 TB；
4. **传输信道映射**：DL-SCH/UL-SCH 承载数据，RACH 只传前导（无数据），PCH 传寻呼。

**与 RRC 的分工**：RRC 负责"慢配置"（逻辑信道参数、DRX 周期、SR 配置等，RRC 重配下发），MAC CE 负责"快控制"（激活/去激活、定时器微调，毫秒级生效）——快慢两级控制是二层设计的通用哲学。

**接收侧解复用**：UE/gNB 按 LCID 把 MAC SDU 分发给对应 RLC 实体，MAC CE 就地处理，padding 丢弃——顺序处理子 PDU，直到 TB 结束。

## 关联考点

- [逻辑信道优先级 LCP 与资源分配顺序](ch04-q014-lcp-priority.md)
- [MAC CE 的常见类型与用途](ch04-q018-mac-ce-types.md)
- [RLC 与 MAC 的功能划分变化（相对 LTE 的取舍）](ch04-q012-rlc-mac-function-split.md)
- [HARQ 实体与进程管理（上下行差异）](ch04-q019-harq-process.md)

## 面试追问

- **一个 TB 能同时装数据和 MAC CE 吗？** —— 能，MAC PDU 内子 PDU 顺序任意，MAC CE 通常放 TB 头部优先处理（如 BSR/PHR 紧跟调度），数据随后，padding 兜底填满 TB。
- **LCID 为什么能同时标识逻辑信道和 MAC CE？** —— MAC 子头格式统一，LCID 空间中一部分索引保留给 MAC CE（如 BSR、PHR、激活命令各有专用索引），收到这些索引时按 CE 处理而不是递交 RLC。
- **复用时若高优先级信道数据装不满 TB 怎么办？** —— 剩余资源按优先级顺序继续给低优先级信道（满足各自限制条件后），装不下就 padding 填充——这就是 LCP 的"填充分支"行为。
