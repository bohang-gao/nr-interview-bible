---
title: 两步随机接入（2-step RA）与四步流程对比
chapter: 5
difficulty: 难
frequency: 中
tags: [随机接入, 2-step RA, MsgA]
---

## 一句话答案

两步随机接入把四步合并：UE 在 msgA 中同时发送 preamble 和 PUSCH 数据，gNB 回 msgB（同时携带 RAR 的 TA/授权与竞争解决结果）；相比四步流程省一次往返，显著降低时延，适合小包快速接入，R16 引入，R17 进一步增强。失败时可自动回退到四步（fallback）。

## 详细展开

**1. 流程对比**

| 维度 | 4-step（CBRA） | 2-step |
|---|---|---|
| msg1 + msg3 | 分开：先 preamble 后 RRC 消息 | 合并为 MsgA：PRACH + PUSCH 一次发出 |
| msg2 + msg4 | 分开：RAR 后再竞争解决 | 合并为 MsgB：TA/授权 + 竞争解决一体 |
| 往返次数 | 2 次 | 1 次 |
| 时延 | 高（RA 窗 + 调度） | 低（约省一半接入时延） |
| 控制面开销 | 每步独立调度 | 单次调度更紧凑 |
| 失败回退 | — | MsgA 失败可回退 4-step |
| 引入版本 | R15 | R16，R17 增强 |

**2. MsgA 的组成**

- **PRACH 部分**：与四步相同的前导码，占用独立或共享的 RO 资源（RRC 配置 rach-ConfigCommonTwoStepRA）。
- **PUSCH 部分**：占用 PUSCH 时机（PO），承载 CCCH/DCCH/CDT 数据；用 DMRS 序号区分不同 UE，功率基于 preamble 接收功率推算并加 powerOffset。

**3. MsgB 的判决分支**

- **成功（竞争解决）**：网络用 C-RNTI 或 TC-RNTI 加扰 PDCCH 调度 MsgB，内容含 TA、冲突解决（对 CCCH 回显）或时间对齐命令。
- **回退（fallback）**：MsgB 以 RA-RNTI 回退 RAR（fallback RAR），相当于传统 msg2，UE 接着走 msg3/msg4 四步流程。
- **失败**：MsgA 重发（preambleTransMax 限制），耗尽后同四步失败处理。

**4. 适用场景**

- 小包低时延接入（URLLC、小数据 NIR 状态恢复）。
- NR 时延敏感型初始接入、边缘场景快速恢复。
- 大规模并发接入（R17 增强：SDT 前的接入优化）。
- 现网以四步为主，两步按小区/按频点选择性开启。

## 关联考点

- 四步流程：[CBRA 竞争随机接入四步流程](ch05-q007-cbra-four-step.md)
- RAR 与 UL grant：[随机接入响应 RAR 的内容与 UL grant](ch05-q009-rar-content-ul-grant.md)
- 免竞争接入：[CFRA 免竞争随机接入与使用场景](ch05-q008-cfra-scenarios.md)

## 面试追问

- **MsgA 的 PUSCH 功率怎么定？** —— 要点：以 preamble 目标接收功率为基准，加上网络配置的 msgA-PUSCH 功率偏移，再叠加路损补偿与爬升；因为此时 TA 未建立，允许较大偏差范围，网络侧用 DMRS 序号区分 UE。
- **为什么需要 fallback 到四步？** —— 要点：两步对覆盖与负荷更敏感（PUSCH 部分功率需求更高）；弱覆盖 UE 的 MsgA PUSCH 可能到不了基站，回退机制保证这类 UE 仍能通过更可靠的四步接入，兼顾效率与覆盖鲁棒性。
- **2-step RA 在什么场景收益最大？** —— 要点：小数据包 + 高时延要求 + 覆盖良好（如 URLLC 控制信令、INACTIVE 态小数据传输）；往返减半的时延收益在控制面建链与状态恢复时最明显。
