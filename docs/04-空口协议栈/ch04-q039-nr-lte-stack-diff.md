---
title: NR 与 LTE 协议栈主要差异总结（高频对比题）
chapter: 4
difficulty: 易
frequency: 高
tags: [协议栈, LTE 对比, 总结]
---

## 一句话答案

NR 相对 LTE 的协议栈差异可归纳为五句话：用户面多了 SDAP、RLC 砍掉重排序上移 PDCP、MAC 取消级联改由 RLC 串联、控制面 RRC 从两态扩为三态（新增 INACTIVE）、安全密钥体系重构为 K→Kamf→KgNB 多级链。再加上物理层的灵活性增强（numerology/BWP），构成"5G 协议栈为什么这样改"的标准答题框架。

## 详细展开

**用户面差异**：

| 层 | LTE | NR | 变化动因 |
|---|---|---|---|
| SDAP | 无 | 新增，QoS 流↔DRB 映射 + QFI | 5G QoS 流与承载解耦 |
| PDCP | 重排序/按序递交在 RLC | 上移到 PDCP；SN 最长 18 bit；DU 压缩等增强 | 跨节点/切换数据连续性（CU/DU、DC） |
| RLC | TM/UM/AM + 重排序/级联 | 保留三模式但砍掉重排序、级联、串联；无重分段 | 重排序放 PDCP；级联放 RLC PDU 级 |
| MAC | 逻辑信道级联进 TB | 取消级联，功能更多（BWP 激活指示、LCP 细化） | 与 RLC 分工重构 |
| PHY | 固定 15 kHz SCS、刚性帧结构 | 多 numerology（15/30/60/120 kHz）、BWP、mini-slot | 多业务弹性 |

**控制面差异**：

1. **RRC 状态**：LTE IDLE/CONNECTED 两态；NR 增加 INACTIVE（挂起+保留上下文+RNA 寻呼），面向小包/省电。
2. **信令承载**：SRB 结构对齐（0/1/2），NR 新增 SRB3 用于双连接直传 SN 信令。
3. **连接建立原因**：NR 新增 mt-Access 等；RRC 恢复/挂起消息（Resume 对）是全新增。

**安全体系差异**：LTE 是 K→Kasme→KeNB 两级；NR 为 K→Kausf→Kamf→KgNB 多级链，NAS 与 AS 密钥域更细分，切换密钥推导引入 NCC/NH 链机制并绑定目标 PCI/频点——安全粒度与隔离度整体提升。

**调度与 HARQ 保持的连续性**：HARQ 概念不变（NR 上下行均为异步自适应为主）、BSR/PHR/SR 机制延续但参数化更灵活——面试可以强调"骨架延续、关节重构"。

**一句话答题模板**：从上往下说层（SDAP 新增→PDCP 接管重排序→RLC 瘦身→MAC 取消级联），再跳控制面（三态+SRB3），最后点安全（多级密钥）与物理层弹性（numerology/BWP），60 秒讲完。

## 关联考点

- [NR 用户面协议栈总览与各层职责](ch04-q001-up-stack-overview.md)
- [RLC 与 MAC 的功能划分变化（相对 LTE 的取舍）](ch04-q012-rlc-mac-function-split.md)
- [5G NR 与 LTE 相比的主要设计目标与技术差异](../01-无线基础与演进/ch01-q001-nr-vs-lte-design.md)
- [NR 安全密钥体系（K 到 KgNB/KAMF 的推导链）](ch04-q026-nr-key-hierarchy.md)

## 面试追问

- **为什么说"RLC 瘦身"是 NR 协议栈最关键的改动？** —— 它使重排序/按序递交的锚点固定在 PDCP，而 PDCP 在 CU/DU 分离、双连接、切换中都保持连续（SN 不变即可），数据跨节点无损迁移成为可能；LTE做不到的组网灵活性由此解锁。
- **SDAP 没了会怎样？** —— QoS 流与 DRB 只能一一对应，回到 EPS 承载模式：5G 的 per-flow QoS、反射 QoS、灵活分流全部落空，所以 SDAP 是 5G QoS 架构的空口必备件。
- **RRC 三态对网络节能的意义？** —— 大量终端停在 INACTIVE 而非 CONNECTED，gNB 不必维持活跃上下文/调度监听；而比 IDLE 少一次 NAS 级流程，信令风暴概率降低，整体是"无线侧省电+核心网减负"双赢。
