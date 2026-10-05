---
title: 手撕题：画出随机接入完整流程并标注消息
chapter: 8
difficulty: 中
frequency: 高
tags: [手撕题, 随机接入, 信令流程]
---

## 一句话答案

画竞争随机接入（CBRA, Contention-Based Random Access）四步流程：msg1 前导（PRACH）→ msg2 随机接入响应 RAR（PDSCH 上的 MAC 层消息）→ msg3 调度传输（PUSCH，承载 RRCSetupRequest）→ msg4 竞争解决（PDCCH 用 TC-RNTI 加扰调度，RRCSetup 下发）。每一步标注信道、RNTI（Radio Network Temporary Identifier，无线网络临时标识）和定时器是拿分关键：msg1 用 RA-RNTI 关联，msg2 在 ra-ResponseWindow 内监听，msg4 在 ra-ContentionResolutionTimer 内监听。

## 详细展开

**标准流程图（四步）**：

```
UE                                              gNB
│                                               │
│ (1) msg1: PRACH 前导                           │
│──── preamble id + RO(选波束), 功率爬升 ────────▶│
│                                               │
│   ← 在 ra-ResponseWindow 内用 RA-RNTI 盲检 PDCCH │
│ (2) msg2: RAR (PDSCH, MAC RAR)                │
│◀─── TA(定时提前) + UL grant + TC-RNTI ─────────│
│                                               │
│ (3) msg3: PUSCH (HARQ 初传, 支持重传)           │
│──── CCCH SDU: RRCSetupRequest ───────────────▶│
│     (S-TMSI 或 随机值)                         │
│                                               │
│   ← 在 ra-ContentionResolutionTimer 内用        │
│     TC-RNTI 盲检 PDCCH                         │
│ (4) msg4: 竞争解决                             │
│◀─── 回显 msg3 内容(如 RRCSetup) ───────────────│
│                                               │
│   TC-RNTI → C-RNTI, 接入成功                    │
```

**逐步标注要点**：

| 步骤 | 信道 | 关键内容 | 失败处理 |
|---|---|---|---|
| msg1 | PRACH | 前导索引 + RO（RACH Occasion，联合指示波束） | 无响应→功率爬升重发，超 preambleTransMax 判失败 |
| msg2 | PDCCH(RA-RNTI 加扰) + PDSCH | TA、UL grant、TC-RNTI（还可能有回退指示 BI） | 超窗未收到→回 msg1 重发 |
| msg3 | PUSCH | CCCH SDU（初始接入为 RRCSetupRequest） | 按 TC-RNTI 调度 HARQ 重传 |
| msg4 | PDCCH(TC-RNTI 加扰) + PDSCH | 回显完整 msg3 内容 | 定时器超时/内容不匹配→重发 msg3 或转 RLF |

**画图时的加分标注**：

- 在 msg1 旁标"RO 与 SSB 的映射关系：UE 按下行最佳 SSB 波束选择对应 RO/前导，gNB 由此反推下行波束"——体现波束管理联动。
- 在 msg2 旁标"TA 命令首次对齐上下行定时"——体现上行同步建立。
- 在 msg4 旁标"竞争解决逻辑：两个 UE 选同一前导时会都收到 RAR，只有 msg4 内容回显与自身 msg3 一致的 UE 才算成功，另一个退避重接"。

**可主动扩展的点**：一句话提两步接入（msgA = msg1+msg3 合并，msgB = msg2+msg4 合并，用于降低时延，适合小包场景），说明知道演进方向即可，画图仍以四步为主——四步是所有场景的基础。

## 关联考点

- 四步接入每步细节：[CBRA 四步流程](../05-关键信令流程/ch05-q007-cbra-four-step.md)
- 触发场景枚举：[RA 触发场景](../05-关键信令流程/ch05-q006-ra-trigger-scenarios.md)
- RAR 内容详解：[RAR 与 UL grant](../05-关键信令流程/ch05-q009-rar-content-ul-grant.md)
- 两步接入对比：[2-step RA](../05-关键信令流程/ch05-q011-two-step-ra.md)

## 面试追问

- **RA-RNTI 是怎么算的？为什么 msg2 不用 C-RNTI？** —— 要点：RA-RNTI 由 RO 所在的时频位置（帧号、子帧/时隙号、频域索引等）计算得出，同一 RO 上发前导的所有 UE 算出的 RA-RNTI 相同，因此都能读到 RAR——此时网络还不知道接入者是谁，只能广播；C-RNTI 要等竞争解决后才生效。
- **非竞争接入（CFRA）和这图的区别在哪？** —— 要点：CFRA 的前导由网络专属分配（如切换时的 RRC 命令携带专用 rach-ConfigDedicated），无竞争问题，流程缩到 msg1+msg2 即完成，不需要 msg3/msg4；适用于切换、波束失败恢复、SCG 添加等有 RRC 连接的场景。
- **随机接入失败的常见根因有哪些？** —— 要点：按步骤定位——msg1 无响应查覆盖/PRACH 功控/前导格式；msg2 超窗查 PRACH 误检与拥塞（回退指示高）；msg3/4 失败查上行质量与冲突率；再结合信令与 Counter 区分弱覆盖、拥塞、干扰三类根因。
