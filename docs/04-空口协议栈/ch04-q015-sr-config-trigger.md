---
title: 调度请求 SR 的配置、触发与禁止机制
chapter: 4
difficulty: 中
frequency: 高
tags: [MAC, SR, PUCCH, 调度]
---

## 一句话答案

SR（Scheduling Request，调度请求）是 UE 有上行数据但没有 PUSCH 资源时，在配置的 PUCCH 资源上向 gNB 发的"申请上行 grant"的一比特请求；SR 可以按逻辑信道配置（每条 SR 配置关联特定 LCH，便于 gNB 识别业务类型做差异化调度），触发后按 SR 传输机会发送，达到最大次数（SR counter 超限，如 sr-ProhibitTimer 到期仍失败累计）则触发 RRC 释放/重建立或 BSR 随机接入兜底。SR 传的是"有没有数据"这一比特，数据量信息靠后续 BSR 补充。

## 详细展开

**SR 配置三要素**（RRC 配置：

- **SR 资源**：专用 PUCCH 资源（周期 + 偏移确定传输机会，格式 0/1）；
- **sr-ProhibitTimer**：一次 SR 发出后禁止再次发送的定时器（防刷屏，覆盖 HARQ 往返时间）；
- **sr-TransMax**：SR 发送的最大次数，超过则上报 MAC 层失效。

**触发与发送流程**（上行数据到达而资源不足时）：

1. SR 触发（pending 状态）：对应 LCH 有数据且无可用 PUSCH 资源；
2. 若已有 pending SR 且禁止定时器未超时，等待下一个 SR 机会；
3. SR 机会到来且无同符号冲突（与测量 gap、SR 集合冲突等按规则取舍）→ 发送 SR；
4. 收到 UL grant → 取消 pending SR，发 BSR（若 grant 够）或直接发数据；
5. 未收到 grant：sr-ProhibitTimer 启动，计数器 +1，再次尝试；计数器到 sr-TransMax → 触发**RRC 释放或随机接入**（通过 RACH 重新申请资源，同时清 SR 相关状态）。

**每 LCH SR 配置的意义（NR 新特性）**：

- LTE 时代 UE 只有一个 SR 配置，gNB 收到 SR 只知道"有人要资源"，还要等 BSR 才知道给多少、给谁；
- NR 可为不同逻辑信道（不同业务，如 URLLC vs 普通数据）配置不同 SR 资源/周期，gNB 从 SR 所用资源即可推断业务类型，调度差异化（URLLC 配短周期 SR 降接入时延）；
- 触发 SR 时 UE 选择"最高优先级触发 LCH"关联的 SR 资源发送。

**SR 与其他资源申请路径的关系**：

- **SR（PUCCH，一比特）→ 动态调度**：常态路径；
- **SR 失败 → RACH**：兜底路径（随机接入中 Msg3 携带数据/BSR）；
- **配置授权 CG（Configured Grant）**：周期性免调度资源，有 CG 就无需 SR——URLLC 常用；
- 注意 SR 只申请"资源"，不携带数据；SR PUCCH 本身不携带任何信息位（存在即请求）。

## 关联考点

- [BSR 缓存状态报告的类型与触发条件](ch04-q016-bsr-types-trigger.md)
- [逻辑信道优先级 LCP 与资源分配顺序](ch04-q014-lcp-priority.md)
- [MAC 层主要功能与逻辑信道复用](ch04-q013-mac-functions-mux.md)

## 面试追问

- **SR 次数超限后为什么走随机接入而不是直接放弃？** —— SR 失效意味着专用 PUCCH 请求路径不可用（资源错配/覆盖问题），RACH 是另一条独立物理信道路径，从 msg1 重新竞争资源可恢复调度；MAC 层同时上报 RRC 判定是否需要重配或重建。
- **SR 和 BSR 是什么关系？为什么要两个机制？** —— SR 只解决"我需要资源"的存在性问题（一比特开销最小），BSR 解决"我需要多少、是哪些 LCH"的量化问题；先用 SR 换来 grant，再用 BSR 精确报告，两级接力开销最优。
- **UE 同时有 SR 和 CG 资源时怎么选？** —— 有可用 CG 资源（时域上到达且满足映射限制）直接用 CG 发数据，不触发 SR；CG 是免申请资源，优先级高于动态申请流程。
