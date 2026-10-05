---
title: PDCP 层主要功能与 PDCP SN 长度选择
chapter: 4
difficulty: 易
frequency: 高
tags: [PDCP, 序列号, 头压缩]
---

## 一句话答案

PDCP（Packet Data Convergence Protocol，分组数据汇聚协议）是安全与数据保护的主体层，核心功能包括 ROHC 头压缩、加密、完整性保护、重排序与按序递交、重复丢弃、切换时的数据转发与重传。PDCP SN（Sequence Number，序列号）长度可配为 12 bit 或 18 bit（数据承载），SN 越长可支持的窗口/缓存越大，高带宽大延迟场景应选长 SN，避免窗口耗尽卡住传输。

## 详细展开

**PDCP 功能清单**（按数据面处理顺序）：

1. **编号**：每个 PDCP SDU 分配 SN，是重排序、加密计数、切换数据同步的依据。
2. **头压缩**：ROHC（Robust Header Compression，健壮头压缩），仅数据承载；详见头压缩专章。
3. **安全**：完整性保护（先做）+ 加密（后做），覆盖范围详见安全范围专章；密钥来自 AS 安全激活。
4. **重排序与按序递交**：接收侧按 SN 排序，检测重复（丢弃）、检测丢失（配合状态上报触发 PDCP 重传，见重排序专章）。
5. **丢包保护**：PDCP 层 discardTimer 超时的 SDU 直接丢弃，避免过期数据占用资源（URLLC 友好）。
6. **切换数据保护**：重建时未确认数据重传、ROHC 上下文保持、SN 连续性维护——这是 PDCP 相比 LTE 增强最多的部分。

**SN 长度选择逻辑**：

- 数据承载：SRB 固定 12 bit；DRB 可配 12 bit 或 18 bit。
- 窗口与缓存按 SN 空间的一半为界（HFN 计数窗口）：SN 空间越大，接收端可容忍的"在途数据"越多。
- **经验法则**：带宽 × RTT（时延带宽积）越大，越需要长 SN。例如大带宽（100 MHz+）+ 双连接/大缓存场景选 18 bit；12 bit 的 SN 空间为 4096，在数百 Mbps 与较大 PDCP 重排序缓存下可能成为瓶颈，导致发送端窗口停滞等待接收确认。
- SN 越长每包头部开销越大（1.5 字节级别差异），但相对载荷可忽略。

**PDCP PDU 类型**：数据 PDU（带 SN 或不带 SN，按配置）、控制 PDU（PDCP status report、ROHC 反馈、EHC 反馈）——注意控制 PDU 加 SN 位、完整性保护遵循对应规则但不加密。

## 关联考点

- [PDCP 重排序与按序递交（含重建/切换场景）](ch04-q006-pdcp-reordering.md)
- [PDCP 加密与完整性保护范围（AS 层哪些加密哪些不加密）](ch04-q007-pdcp-ciphering-integrity.md)
- [ROHC 头压缩的收益与配置](ch04-q008-rohc-header-compression.md)
- [PDCP duplication 的作用与适用场景](ch04-q009-pdcp-duplication.md)

## 面试追问

- **PDCP discardTimer 超时后包去哪了？影响上层吗？** —— 直接在 PDCP 丢弃，不递交给 RLC/MAC；对上层（GTP-U 之前的业务层）表现为该包不再送达，应用层靠自身重传/冗余机制兜底，这正是为高时延不敏感流省空口资源的手段。
- **为什么 SRB 的 SN 固定 12 bit 而数据可选 18？** —— 信令量小且对时延敏感，重排序窗口需求小，12 bit 足够；数据承载要适配大带宽大缓存，允许网络按场景配置 18 bit 扩窗。
- **PDCP 状态报告（status report）在什么条件下发送？** —— 接收侧在 PDCP 重建或收到网络请求时生成，告知发送方已成功接收的最大 SN 与缺口列表，发送方据此重传缺失 SDU（这是 NR 新增的 PDCP 层恢复手段，配合切换丢包更少）。
