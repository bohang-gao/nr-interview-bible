---
title: 小区选择 S 准则的判决条件与计算
chapter: 5
difficulty: 中
frequency: 高
tags: [小区选择, S 准则, RSRP]
---

## 一句话答案

终端要驻留一个 NR 小区必须同时满足 Srxlev > 0 且 Squal > 0：Srxlev 是基于 RSRP 的接收电平余量，Squal 是基于 RSRQ 的质量余量，两者都要扣除最小门限并考虑功率补偿项；任一条件不满足就不允许驻留，只能继续搜索或重选。

## 详细展开

**判决公式**：

```
Srxlev = Qrxlevmeas − (Qrxlevmin + Qrxlevminoffset) − Pcompensation
Squal  = Qqualmeas  − (Qqualmin  + Qqualminoffset)
Pcompensation = max(PEMAX − PUMAX, 0)   （单位 dB）
```

- Qrxlevmeas / Qqualmeas：服务小区 RSRP（dBm）与 RSRQ（dB）。
- Qrxlevmin、Qqualmin：来自 SIB1（q-RxLevMin、q-QualMin），是网络划定的驻留底线。
- Qrxlevminoffset、Qqualminoffset：仅在评估更高优先级频点的小区时使用，一般置 0。
- PEMAX：小区允许的最大发射功率（SIB1 下发）；PUMAX：终端实际最大发射功率。

**计算示例**：

| 参数 | 取值 |
|---|---|
| Qrxlevmin | −110 dBm |
| 实测 RSRP | −95 dBm |
| Qqualmin | −20 dB |
| 实测 RSRQ | −12 dB |
| PEMAX / PUMAX | 23 / 23 dBm |

则 Srxlev = −95 − (−110) − 0 = 15 dB > 0；Squal = −12 − (−20) = 8 dB > 0，两条件同时满足，允许驻留。若 RSRP 掉到 −112 dBm，Srxlev = −2 < 0，立即失去驻留资格。

**要点**：

1. S 准则是"驻留门槛"，与 LTE 的 S 准则同源；NR 额外引入 RSRQ 维度（q-QualMin 可不配置，此时不判 Squal）。
2. Pcompensation 专门惩罚"下行好、上行发不出去"的假覆盖小区：终端最大功率低于小区允许值时扣减电平余量。
3. S 值还是重选的输入：R 准则排序前先做 S 准则过滤，异频/异系统重选的门限判断（ThreshX、ThreshServing）也基于 S 值。

## 关联考点

- 小区搜索流程：[NR 小区搜索完整流程](ch05-q001-cell-search-full-procedure.md)
- 重选判决：[小区重选 R 准则与同频/异频/异系统重选](ch05-q003-cell-reselection-r-criteria.md)
- 优先级参数：[重选频率优先级与重选参数的配置来源](ch05-q004-reselection-priority-params.md)

## 面试追问

- **Pcompensation 为什么要取 max(PEMAX − PUMAX, 0)？** —— 要点：终端上行能力不足时，即使下行能收到也可能无法维持上行连接；用最大允许功率与终端实际功率之差惩罚电平余量，避免驻留后立即掉线。
- **S 准则和 R 准则是什么关系？** —— 要点：S 准则先做资格筛选，只有满足 S 的小区才参与同优先级 R 排序；异优先级频点之间不用 R 排序，改用基于 S 值的绝对门限比较。
- **RSRP 和 RSRQ 分别对应哪条判决？** —— 要点：RSRP 反映有用信号电平，对应 Srxlev；RSRQ 叠加了负载与干扰信息，反映"质量"，对应 Squal，两者结合能识别强干扰场景。
