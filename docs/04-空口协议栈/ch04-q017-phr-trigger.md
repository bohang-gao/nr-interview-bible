---
title: 功率余量报告 PHR 的触发与作用
chapter: 4
difficulty: 中
frequency: 中
tags: [MAC, PHR, 功控, 上行调度]
---

## 一句话答案

PHR（Power Headroom Report，功率余量报告）是 UE 向 gNB 报告"最大发射功率减去当前/参考功率后的余量"的 MAC CE，作用是让调度器掌握上行功放还有多少提升空间，从而决定 grant 大小（RB 数与 MCS）。触发条件包括：路径损耗变化超过门限（dl-PathlossChange dB）、周期定时器到期、功率受限解除（prohibitTimer 到期后从功率受限恢复）等，配合 prohibitTimer 防止报告风暴。

## 详细展开

**PHR 的意义**：

- 上行是功率受限方向（UE 发射功率有限，约 23~26 dBm），调度器若盲目给大 RB 数 + 高 MCS，UE 功率不够会拉高误码率；
- PHR 告诉 gNB"我还能再轰多少 dB"，gNB 据此做功率守恒调度：余量大 → 给宽带宽高 MCS；余量小 → 收缩带宽或降 MCS；
- 双连接/多载波下按小区（每个 serving cell）分别报告。

**报告内容（两类值）**：

- **Type 1 PHR**：PUSCH 的功率余量 = P_CMAX - 计算的 PUSCH 发射功率（基于参考格式或实际传输）；
- **Type 3 PHR**：SRS 的功率余量（P_CMAX - SRS 所需功率）；
- 同时上报 P_CMAX（当前最大允许发射功率，受功控/法规限制的封顶值）——gNB 拿到"余量 + 封顶"两个数才能精确推算可用功率。

**触发条件（扩展版 PHR，NR 相对 LTE 增强）**：

1. **prohibitTimer 到期**且路径损耗变化超过 dl-PathlossChange 门限（经典条件：防频繁上报 + 反应覆盖变化）；
2. **periodicPHR-Timer 到期**（周期性上报）；
3. **功率受限解除**：之前 P_CMAX 达到上限无法承载 grant，现在解除受限（解封后报一次"我现在宽裕了"）；
4. **P_CMAX 变化超过门限**（受温漂/功控等影响的最大功率跳变上报）；
5. 激活了新的 SCG/辅小区组（DC 场景，新腿建立后需要初次功率画像）。

**配套定时器**：

- periodicPHR-Timer：周期触发；
- prohibitPHR-Timer：上次 PHR 后的禁止窗（防风暴）；
- dl-PathlossChange：PL 变化门限（dB 步进值）。

**典型调度闭环（口播示例）**：UE 覆盖边缘 PL 增大 → 余量跌破门限且禁止窗结束 → 发 PHR（余量 3 dB）→ gNB 收紧调度（RB 减半、MCS 降档）→ 上行质量恢复；后续信号变好 → 受限解除/PL 变化再次触发 PHR → 调度器放宽 grant → 吞吐回升。

## 关联考点

- [MAC CE 的常见类型与用途](ch04-q018-mac-ce-types.md)
- [BSR 缓存状态报告的类型与触发条件](ch04-q016-bsr-types-trigger.md)
- [调度请求 SR 的配置、触发与禁止机制](ch04-q015-sr-config-trigger.md)

## 面试追问

- **PHR 为什么还要报 P_CMAX？** —— 余量是相对值，同一余量下"封顶 23 dBm 的轻载 UE"与"26 dBm 但已贴近法规/温控限制的 UE"调度含义不同；gNB 需要 P_CMAX 才能还原绝对功率状态，做精确的 RB×MCS 组合决策。
- **power backoff（功率回退）对 PHR 有什么影响？** —— 带内连续/非连续 CA 的互调等要求会使实际可用功率低于理论最大值（MPR 回退），P_CMAX 已计入回退，PHR 反映的是"真实可用功率"的余量，避免调度器高估能力。
- **PHR 和 BSR 为什么都是 MAC CE 而不是 RRC 信令？** —— 两者都是高频、低时延、与调度强耦合的状态反馈，必须毫秒级生效且开销小；RRC 信令往返慢、开销大，只适合低频配置类信息——这是"MAC CE 快控、RRC 慢配"分工的典型体现。
