---
title: BSR 缓存状态报告的类型与触发条件
chapter: 4
difficulty: 中
frequency: 高
tags: [MAC, BSR, 上行调度]
---

## 一句话答案

BSR（Buffer Status Report，缓存状态报告）是 UE 向 gNB 报告上行缓存数据量的 MAC CE，帮助调度器决定给多少 grant；有四种格式——Short BSR（单 LCG，8 bit 索引）、Long BSR（4 个 LCG 全报）、Short Truncated BSR（有更高优先级数据被复用限制挡住时只报一个 LCG）、Long Truncated BSR（同场景报全部 LCG）。触发条件包括：新数据到达且无高优先级数据在传、有更高优先级信道数据到达、定期 BSR 定时器到期等。

## 详细展开

**LCG（Logical Channel Group，逻辑信道组）分组**：

- 每条逻辑信道配置到 4 个 LCG 之一（LCG 0~3），BSR 以 LCG 为粒度上报（不是逐 LCH）——控制信令开销与调度精度的折中；
- 上报内容是"某 LCG 全部 LCH 缓存总字节数"的量化索引（查表映射，范围从 0 到极大值对数分布）。

**四种 BSR 格式**：

| 类型 | 触发场景 | 内容 |
|---|---|---|
| Short BSR | 只有一个 LCG 有待报数据 | 1 个 LCG 缓存量（8 bit） |
| Long BSR | 多个 LCG 有待报数据 | 4 个 LCG 位图 + 各自缓存量 |
| Short Truncated BSR | 多 LCG 有数据，但**更高优先级数据无法复用进本 TB**（复用限制），只能报一个 | 1 个 LCG |
| Long Truncated BSR | 同上场景报多个 | 位图 + 部分内容（最高优 LCG 必含） |

Truncated 类型的存在是为了解决 LCP 复用限制（如 SRB1 独占 TB）导致"该报的 BSR 装不进本次 grant"的场景。

**触发条件（五条，经典必背）**：

1. 有新数据到达，且该 LCH 优先级**高于**当前缓存中所有数据所属 LCH（高优插入）；
2. 有新数据到达，且当前无任何缓存数据（从空到非空）；
3. periodicBSR-Timer 到期（定期汇报，gNB 掌握缓存动态）；
4. retxBSR-Timer 到期且缓存仍有数据（长时间没拿到 grant 后重新申请——防止调度"遗忘"）；
5. （特殊）填充资源足够装下 BSR 时用 BSR 代替 padding（padding BSR，附带触发类型）。

**触发后的行为**：

- 置 BSR pending，若无资源则走 SR 流程申请 grant；
- retxBSR-Timer 在每次收到 grant 发送 BSR 后启动，超时表示太久没被调度；
- padding BSR 不启动 retx 定时器、不触发 SR（它本就是"有富余资源顺带报"）。

**BSR 与 SR 的时序口诀**："SR 要资源，BSR 报数量，grant 到了先发 BSR 再发数据"——首次上行传输时 grant 通常先给 BSR，gNB 按 BSR 再给精准 grant。

## 关联考点

- [调度请求 SR 的配置、触发与禁止机制](ch04-q015-sr-config-trigger.md)
- [逻辑信道优先级 LCP 与资源分配顺序](ch04-q014-lcp-priority.md)
- [MAC CE 的常见类型与用途](ch04-q018-mac-ce-types.md)

## 面试追问

- **为什么 LCG 只有 4 个？** —— 平衡开销与精度：逐 LCH 上报粒度太细、信令开销大；LCG 太少则调度无法区分业务。4 组 + 对数量化索引在 8 bit 内覆盖动态范围极大的缓存区间，是工程折中。
- **padding BSR 和普通 BSR 的区别？** —— padding BSR 是"grant 有富余、无数据可发"时用 BSR 填充（对 gNB 有参考价值），不触发 retxBSR-Timer/SR 流程；普通 BSR 是数据驱动的主动报告。
- **retxBSR-Timer 超时意味着什么？** —— UE 缓存有数据但长期未获 grant（调度饿死或信号差），重新触发 BSR 申请资源；这是防止 UE"上报过一次就被遗忘"的自愈机制。
