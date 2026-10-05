---
title: 小区重选 R 准则与同频/异频/异系统重选
chapter: 5
difficulty: 难
frequency: 中
tags: [小区重选, R 准则, 优先级]
---

## 一句话答案

同优先级频点（典型是同频）重选用 R 准则排序：R_s = Qmeas,s + Qhyst，R_n = Qmeas,n − Qoffset，邻区在重选时间内持续优于服务小区则重选；异优先级频点不做排序，改用绝对门限——高优先级小区只要 S 值超过 ThreshX,HighP 就可以走，低优先级则要求服务小区差于 ThreshServing,Low 且目标小区好于 ThreshX,Low；NR 到 E-UTRA 的异系统重选同理，只是门限针对 LTE 的 RSRP/RSRQ。

## 详细展开

**1. 同频/等优先级：R 排序准则**

```
R_s = Qmeas,s + Qhyst          （服务小区）
R_n = Qmeas,n − Qoffset        （邻小区）
```

- 邻区 R_n 在 Treselection（NR 中为 t-ReselectionNR）内持续大于 R_s，且满足 S 准则，则重选。
- Qhyst 是服务小区迟滞，防乒乓；Qoffset 含频点级偏移（SIB4 的 qOffsetFreq）与小区级偏移，是运营微调邻区倾向的抓手。
- 参数主要来自 SIB3（同频重选信息）。

**2. 异频/异系统：优先级门限机制**

每个频点有绝对优先级（0~7，7 最高），由 SIB4（NR 异频）/SIB5（E-UTRA）广播：

| 目标 | 触发条件（持续 Treselection） |
|---|---|
| 高优先级频点 | 目标小区 Srxlev > ThreshX,HighP（若有 Q 门限还需 Squal > ThreshX,HighQ） |
| 等优先级频点 | R 准则排序 |
| 低优先级频点 | 服务小区 Srxlev < ThreshServing,LowP（且 Squal < ThreshServing,LowQ），同时目标 Srxlev > ThreshX,LowP |

- 测量启动也由 S 值控制：服务小区低于 s-NonIntraSearchP 才开始测异频（不配置则始终测）；同频对应 s-IntraSearchP。
- 重选只在 RRC_IDLE/RRC_INACTIVE 执行；连接态的移动性由测量事件与切换负责。

**3. 补充规则**

- 速度缩放：中/高速终端可对 Qhyst、Treselection 做放大（sf-Medium/sf-High），减少高速移动下的乒乓。
- 重选不通知网络：UE 直接在新小区驻留，随后按需发起接入（如注册更新）。

## 关联考点

- 选择门槛：[小区选择 S 准则的判决条件与计算](ch05-q002-cell-selection-s-criteria.md)
- 优先级配置：[重选频率优先级与重选参数的配置来源](ch05-q004-reselection-priority-params.md)
- 系统间互操作：[4G/5G 互操作：EPC 与 5GC 间的切换与重选](../01-无线基础与演进/ch01-q017-4g-5g-interworking.md)

## 面试追问

- **高优先级小区为什么可以"不看服务小区脸色"直接重选过去？** —— 要点：优先级本身就代表网络倾向（如低频广覆盖层），只要目标质量达标就迁移，可让空闲态终端尽快归位到期望的分层网络；防乒乓交给 ThreshX 与 Treselection 控制。
- **Qhyst 与 Qoffset 分别管什么？** —— 要点：Qhyst 是服务小区的迟滞增益（对称、防抖），Qoffset 是频点/小区间的单向偏移（不对称、定倾向），现网优化常用后者拉偏切换/重选带。
- **UE 什么时候才开始测异频邻区？** —— 要点：服务小区 Srxlev 低于 s-NonIntraSearchP（未配置则无条件测量）；这个门限是省电与测量及时性的折中，配置过松会导致"发现晚、来不及重选"。
