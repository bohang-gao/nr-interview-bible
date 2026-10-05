---
title: "C-DRX 的关键参数与功耗/时延折中"
chapter: 2
difficulty: 中
frequency: 高
tags: [C-DRX, 功耗, 非连续接收]
---

## 一句话答案

连接态非连续接收（C-DRX, Connected-mode Discontinuous Reception）让 UE 在 RRC 连接态下周期性"醒来监听 PDCCH、其余时间关收发机休眠"，核心参数是 DRX 周期、激活期（On Duration Timer）、非激活定时器（Inactivity Timer）与重传定时器。折中关系明确：DRX 周期越长越省电但调度响应时延越大，周期短则时延小但功耗高；实际网络按业务类型分片配置（如视频大流量不配 DRX 或短周期，即时消息长周期）。

## 详细展开

**关键参数与运行机制**：

| 参数 | 作用 |
|---|---|
| drx-LongCycle | 长周期起点间隔（如 40/80/160/320/640 ms…），决定"多久醒一次" |
| On Duration Timer | 每周期开头连续监听 PDCCH 的时长（符号/时隙为单位），决定"醒多久" |
| drx-InactivityTimer | 收到调度后延长监听的时间，跟住突发数据流 |
| drx-HARQ-RTT-Timer / drx-RetransmissionTimer | 下行 HARQ 重传等待窗：RTT 到期后若未收到重传授权，保持唤醒等重传 |
| drx-ShortCycle + drx-ShortCycleTimer | 短周期：刚结束活动期时先按短周期多守几个周期，尽快捕住回包再回落长周期 |

**运行逻辑**：每 LongCycle 开始激活 On Duration 监听 PDCCH；一旦有新传调度，Inactivity Timer 启动/续期使 UE 保持清醒（活动期可跨周期边界）；数据传输后可能经历短周期观察期；HARQ 重传由独立定时器保障不被漏收。

**功耗/时延/吞吐三折中**：

- **周期↑** → PDCCH 监听占空比↓ → 省电显著，但下行新传必须等到下个激活期 → 端到端时延平均增加约半个周期；对时延敏感业务（VoNR、游戏）需 ≤ 40 ms 甚至 20 ms。
- **On Duration↑/Inactivity↑** → 捕捉突发能力↑、时延↓，但监听功耗↑。
- **短周期机制**是折中典范：数据刚结束按短周期密集守候（回包大多很快到来），超时后再退长周期，兼顾响应与省电。

**与 NR 其他机制的联动**：

- **BWP 联动**：DRX 激活期外可配合切到窄带/低 SCS 的休眠 BWP（配合 WUS/PEI 更佳）。
- **寻呼区分**：C-DRX 管连接态，空闲态对应的是寻呼 DRX（PF/PO），两者机制不同但目的相同。
- **调度器视角**：gNB 知道每个 UE 的 DRX 时刻表，把新传压在激活期起点附近可获得最低时延。

## 关联考点

- [WUS/PEI 唤醒信号如何降低 PDCCH 监听功耗](/02-物理层/ch02-q047-wus-pei-wakeup)
- 动态调度与半静态调度 SPS/CG 的应用场景（[SPS/CG](/02-物理层/ch02-q036-sps-cg-scheduling)）
- RRC 状态与状态迁移（第 4 章）

## 面试追问

- **VoNR 业务 DRX 怎么配？** —— 语音包每 20 ms 到达，DRX 周期需 ≤ 20 ms 与话音节奏对齐（配合 SPS 周期），否则每包都等下个激活期引入额外时延；典型配置短周期+短 On Duration。
- **Inactivity Timer 太长的副作用？** —— 下载/消息类突发结束后 UE 长时间保持监听，功耗白白增加；太短则随后立刻到来的回包要等长周期，时延毛刺，需要按业务画像调优。
- **C-DRX 会不会影响 HARQ？** —— 不会漏收：HARQ-RTT/Retransmission 定时器把重传窗口"抬"到唤醒状态处理；但 DRX 限制下 gNB 重传调度时机被约束，可能拉长 HARQ 闭环时延。
