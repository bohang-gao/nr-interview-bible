---
title: "系统信息 SI window 与 on-demand SI 机制"
chapter: 2
difficulty: 中
frequency: 低
tags: [系统信息, SIB, 广播]
---

## 一句话答案

SIB1 之外的系统信息称为 OSI（Other System Information，其他系统信息），按 SI 消息组织发送：每个 SI 在专属的 SI window 内以 SI-RNTI 调度，窗口按序排队、不重叠。OSI 可以周期广播，也可以按需请求（on-demand）：空闲态用 MSG1（专用 PRACH 前导）或 MSG3 请求，连接态用 RRC 请求。

## 详细展开

**SI 的组织方式**：SIB2 之后的多个 SIB 可打包成一条 SI 消息（mapping 关系在 SIB1 中指示），每条 SI 有自己的周期与 SI window 配置（si-WindowLength，单位 ms，所有 SI 窗口等长）。同一时间只有一个 SI window，多个 SI 按配置顺序依次排队发送，窗口内 PDCCH（SI-RNTI）调度 PDSCH 承载该 SI。UE 若错过窗口，等下一周期即可，无须持续监听。

**on-demand 机制（按需请求）**：NR 为省空口开销引入——低频使用的 SIB（如 ETWS 类公共告警以外的少数广播）不必永久广播，网络在 SIB1 中指示某 SI 是否"按需"，UE 需要时主动请求：

| UE 状态 | 请求方式 | 说明 |
|---|---|---|
| 空闲/非激活 | 专用 PRACH 前导（MSG1） | SIB1 为该按需 SI 配置专用 rach-occasion 与前导码，UE 发指定前导即"点播" |
| 空闲/非激活 | MSG3 请求 | 若无专用 PRACH 资源，随机接入后在 MSG3 中携带请求 |
| 连接态 | RRC 专用信令请求 | UE 在连接态通过 RRC 消息请求，gNB 以单播下发 |

网络收到请求后，把该 SI 广播（或单播）出来；一段时间无请求可停止广播。

**设计意图**：把"人人要用的信息周期广播、少数人用的信息按需取"分离，降低常驻广播开销与终端监听负担——这与 NR 波束化、BWP 省电的整体设计哲学一致。

## 关联考点

- [RMSI/SIB1 调度与 SSB 的时频复用关系](/02-物理层/ch02-q015-rmsi-sib1-ssb-mux)
- 随机接入流程 MSG1/MSG3（第 5 章）
- RRC 状态机与Inactive 态（第 4 章）

## 面试追问

- **为什么 SI window 同一时间只允许一个？** —— 简化 UE 监听逻辑：窗口排队、周期有序，UE 只需按 SIB1 的调度信息在对应窗口内盲检，避免多 SI 窗口重叠带来的监测歧义。
- **on-demand SI 用 MSG1 请求和用 MSG3 请求的区别？** —— MSG1 方式为该 SI 预配了专用前导/时机，UE 发前导即完成请求，网络可直接把 SI 广播出来（随机接入甚至可能因此终止）；MSG3 方式是通用随机接入后捎带请求，流程更长但不需要为每个 SI 预留 PRACH 资源。
- **SIB1 本身能按需请求吗？** —— 不能。SIB1 是接入必需信息，必须周期广播；on-demand 只适用于 SIB1 之外的 OSI。
