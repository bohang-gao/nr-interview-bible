---
title: 随机接入的触发场景枚举
chapter: 5
difficulty: 易
frequency: 高
tags: [随机接入, RACH, 触发场景]
---

## 一句话答案

随机接入共 8 类触发场景：初始接入、RRC 连接重建、切换、上下行数据到达但 UE 处于失同步、从 RRC_INACTIVE 恢复、SCG 添加/变更（辅载波接入）、波束失败恢复，以及 SI 请求（on-demand 系统信息）。一句话记忆：**"接入、重建、切换、同步丢失、INACTIVE 恢复、SCG、波束恢复、SI 请求"**。

## 详细展开

| # | 场景 | 典型过程 | 竞争/免竞争 |
|---|---|---|---|
| 1 | RRC_IDLE 初始接入 | 开机驻留后发起 RRCSetupRequest | 竞争 |
| 2 | RRC 连接重建 | 无线链路失败后 RRCReestablishmentRequest | 竞争 |
| 3 | 切换 | 目标小区收到 msg1 后回 msg2 带 TA | 免竞争为主（专用 preamble），失败回落竞争 |
| 4 | 下行数据到达但 UE 上行失同步（UL SYNCH 失效） | 寻呼/DCI 触发，UE 先 RA 恢复同步 | 竞争 |
| 5 | 上行数据到达且上行失同步 | 触发 RA 恢复同步再发数据 | 竞争 |
| 6 | 从 RRC_INACTIVE 恢复 | RRCResume 前需要同步/上行资源 | 竞争 |
| 7 | SCG 添加/SCG 变更（EN-DC/NR-DC） | 在 SCG 小区上做随机接入 | 免竞争为主 |
| 8 | 波束失败恢复 BFR | 检测到 BFD 后在候选波束上发 PRACH | 免竞争（专用 RO/preamble 关联候选波束） |

- 补充：SI 请求（on-demand SI）也算一类 RA 触发，上文 q005 已述。
- 这些场景里，1/2/4/5/6 天然竞争；3/7/8 走 CFRA；实际网络中"失同步下的数据到达"与"切换"是最高频的两类。

**理解要点**：

1. 随机接入的本质是"**让网络在无先验定时/无专属资源的情况下，为 UE 分配上行定时提前（TA）与 C-RNTI 或临时标识**"。
2. 竞争还是免竞争，判据是**是否使用了专用 preamble**：切换/SCG/波束恢复场景网络能预分配，故可免竞争。
3. 上述场景在 RRC_IDLE/RRC_INACTIVE/RRC_CONNECTED 三个状态都可能出现，只是具体消息流不同。

## 关联考点

- 竞争接入细节：[CBRA 竞争随机接入四步流程](ch05-q007-cbra-four-step.md)
- 免竞争接入：[CFRA 免竞争随机接入与使用场景](ch05-q008-cfra-scenarios.md)
- 波束恢复：[波束失败恢复 BFR 的完整流程](../03-MIMO与波束管理/ch03-q011-bfr-procedure.md)

## 面试追问

- **切换为什么能用免竞争而初始接入不行？** —— 要点：切换前源小区通过 HO 命令把目标小区的专用 preamble 告诉 UE，网络侧已"记账"，不存在冲突；初始接入时网络不知道有 UE 要来，只能靠竞争解决身份。
- **失同步为什么必须做随机接入而不是直接发数据？** —— 要点：上行失同步意味着 TA 失效，网络无法在正确时刻解调 UE 的上行；msg2 会携带新的 TA，先对齐再传数据。
- **哪些场景会同时触发 RRC 层消息和随机接入？** —— 要点：初始接入（RRCSetupRequest 在 msg3）、重建（RRCReestablishmentRequest 在 msg3）、INACTIVE 恢复（RRCResume 在 msg3）——RRC 消息搭 RA 的"顺风车"传输。
