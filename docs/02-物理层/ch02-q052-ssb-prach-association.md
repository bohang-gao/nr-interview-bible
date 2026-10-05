---
title: "SSB 与 PRACH 资源的关联及 RAR 波束指向"
chapter: 2
difficulty: 难
frequency: 中
tags: [SSB, PRACH, 波束互指]
---

## 一句话答案

NR 随机接入天生是"波束化"的：UE 选定某个 SSB 波束后，只在与该 SSB 关联的 RACH occasion（RO）上、从该 SSB 对应的前导子集中挑选前导发送；基站在某 RO 收到前导，就知道 UE 对准的是哪个 SSB 波束，随机接入响应（RAR, Random Access Response）因此在对应 SSB 波束的方向上发送，MSG3/PDSCH 后续也按波束对应关系（QCL Type D 链）延续。这套"SSB→RO/前导→RAR→MSG3"的映射规则由 SIB1 中的参数组（rach-ConfigCommon）配置。

## 详细展开

**关联配置参数族**（均在 SIB1）：

| 参数 | 含义 |
|---|---|
| prach-ConfigurationIndex | RO 的时域位置与前导格式 |
| msg1-FDM / msg1-FrequencyStart | RO 的频分数与频域起点 |
| ssb-perRACH-Occasion | 一个 RO 对应的 SSB 数（1/2/4/8/16，或反过来多个 RO 映射一个 SSB） |
| CB-preambles-per-SSB | 每 SSB 每 RO 的竞争前导数（≤64） |
| restrictedSetConfig | 高速场景限制性序列集（抗多普勒） |

**映射逻辑（下行选择方向）**：协议按固定次序把 SSB 逐个映射到 RO（先时间后频率、先帧后子帧），再在每个 RO 内把 64 个前导按 CB-preambles-per-SSB 切分给各 SSB。当 ssb-perRACH-Occasion < 1 的倒数关系出现（多个 RO 服务一个 SSB）时，UE 依次用第 1、2…个 RO 加大接入机会。

**UE 侧行为**：同步后锁定最佳 SSB（候选索引 i）→ 按 SIB1 映射规则找到承载该 SSB 的 RO 集合与前导编号范围 → 随机挑一个前导在 RO 上发送（MSG1）。

**gNB 侧反推与 RAR 波束指向**：gNB 检测到"RO(x) 上的前导 p"，反查映射表得"UE 在 SSB i 的波束方向"→ 用该 SSB 波束对应的方向（与 PDCCH/PDSCH 建立 QCL Type D）发送 RAR：即 RA-RNTI 加扰的 PDCCH 与 RAR PDSCH 都按该波束收发。RA-RNTI 本身由 RO 的时频位置计算（固定公式），保证"gNB 检测的 RO"与"UE 监听的 RAR"严格对应。

**后续波束链延续**：MSG3（PUSCH）按 RAR 授权中指示的波束/TCI 发送；MSG4 及以后的专用信道沿用该波束对，直到网络通过 TCI/空间关系重新指示。这样一次接入完成"广播宽波束 → 专属窄波束"的收敛。

**波束失败恢复（BFR）的接入特例**：R15/R16 中波束失败恢复可走专用 PRACH 资源（BFR 专用前导/RO），其与候选新波束（CSI-RS）的关联让 gNB 无需重复全流程即可锁定新方向。

## 关联考点

- [PRACH 时频资源与 RACH occasion 的计算](/02-物理层/ch02-q043-prach-ro-calculation)
- [PRACH 长格式与短格式的区别及适用场景](/02-物理层/ch02-q042-prach-long-short-format)
- [天线端口与准共址 QCL 的基本概念](/02-物理层/ch02-q049-antenna-port-qcl)

## 面试追问

- **如果多个 UE 在同一 SSB 的不同前导上同时接入会怎样？** —— gNB 可在同一 RAR 中打包多个随机接入前导标识（RAPID）分别响应；若两 UE 选了同一前导则冲突，靠 MSG3 竞争解决（DMRS 区分+MSG4 竞争裁决）。
- **RA-RNTI 的作用是什么？** —— 由 RO 时频位置唯一算出的临时标识，UE 在预定的 RAR 窗口内用全组 RA-RNTI 盲检 PDCCH；它把"在哪发的 MSG1"与"在哪听 RAR"绑定，杜绝串扰，也隐含锁定了波束方向。
- **波束失败恢复为什么可以不走完整接入？** —— BFR 用专用前导+专用 RO，gNB 事先知道"这个前导=这个 UE 在这个新方向"，直接跳过竞争解决，用该方向回 BFR 响应，比通用接入省时延。
