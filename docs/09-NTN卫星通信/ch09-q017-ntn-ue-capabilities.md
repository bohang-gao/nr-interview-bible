---
title: R17 NTN 对 UE 能力的新要求（38.306 相关 IE 概览）
chapter: 9
difficulty: 中
frequency: 中
tags: [NTN, UE能力, 终端]
---

## 一句话答案

R17 在 TS 38.306 中为 NTN 新增了一组能力参数：核心是 nonTerrestrialNetwork-r17（声明支持 NR NTN 接入）与 NTN 场景细分参数（GSO/NGSO 场景支持声明），配套 GNSS 接收能力、自主定时/频率预补偿（autonomous TA、频偏预补）、K_offset/星历辅助相关处理能力，以及 NTN 频段（n255/n256、Ka）的射频能力（38.101-5 的信道带宽、双工参数）；网络据此判断 UE 能否接入 NTN 小区及使用哪些 NTN 特性。

## 详细展开

**能力声明的主干**（38.306 R17）：

1. **nonTerrestrialNetwork-r17**：38.306 原文描述——"Indicates whether the UE supports NR NTN access. If the UE indicates this capability the UE shall support the..."，即 NTN 接入的总开关，未声明则网络不对其启用 NTN 特性。
2. **GSO/NGSO 场景细分**：38.306 另有字段"Indicates whether the UE supports the NTN features in GSO scenario or NGSO scenario. If a UE does not include this field but includes nonTerrestrial..."——区分地球静止/非静止轨道场景支持，因为两种场景的定时/多普勒/移动性要求不同。
3. **定时与同步能力**：UE 自主 TA 估计（基于星历+GNSS 的 open loop 控制）与 common TA 处理——38.306 的 NTN 参数组描述 UE 支持"open loop (i.e., UE autonomous TA estimation, and common TA estimation) and closed (i.e., received TA commands) control loops"。
4. **频段射频能力**：TS 38.101-5 定义 NTN satellite bands（如 n256：SCS 15/30 kHz，UE 信道带宽 5/10/15/20 MHz），38.306 的 BandNR 参数承载频段组合与带宽声明；38.306 还区分 NTN 频段与地面频段的能力一致性要求（"Except for NTN bands, UE shall set the capability value consistently for all FDD-FR1 bands..."）。
5. **特性级开关**：如 CQI 上报类参数（38.306 出现的 cqi-4-BitsSubbandNTN-... 等 NTN 专属变体）、HARQ 反馈禁用支持、NTN 测量间隙与 TA 有效期处理等，逐项声明以便网络按 UE 能力调度。

**与地面终端的差异要点**：

- **GNSS 是硬前提**：定时/频偏预补偿依赖 UE 位置，NTN UE 必须内置 GNSS 接收（38.306 的 NTN 能力与 GNSS 支持关联）；
- **功耗与能力等级**：S 频段手持 UE 射频通道少、带宽小（≤20 MHz），能力等级接近低端地面终端而非 FR2 旗舰；
- **IoT-NTN 分册**：eMTC/NB-IoT NTN 的能力在对应物联网规范体系另行定义（38.306 覆盖 NR NTN），38.821/R17 演进中明确 IoT-NTN 的分段上行等特性支持声明。

**网络侧用法**：AMF/gNB 收到 UE 能力后，决定是否允许驻留 NTN 小区、是否下发 NTN-Config（星历/K_offset）、HARQ 反馈是否禁用、测量间隙配置等——能力参数是 NTN 接入控制的输入。

**规范依据**：TS 38.306（nonTerrestrialNetwork-r17 及 NTN 参数组）；TS 38.101-5（NTN 频段射频要求）

## 关联考点

- 星历/K_offset/公共 TA 等被能力约束的机制：[卫星星历](./ch09-q006-satellite-ephemeris.md)、[K-offset](./ch09-q008-k-offset-definition.md)
- 定时预补偿与自主 TA：[定时预补偿](./ch09-q009-uplink-timing-precompensation.md)
- NTN 频段定义：[频率规划](./ch09-q014-frequency-planning-mss.md)
- 手机直连对终端的要求：[直连手机现状与挑战](./ch09-q018-ntn-direct-to-phone.md)

## 面试追问

- **为什么 GSO/NGSO 要分开声明能力？** —— 要点：NGSO（LEO）对多普勒预补偿、快速定时外推、切换能力要求远高于 GSO；支持 GEO 不等于扛得住 LEO 的动态，细分声明让网络避免把 LEO 小区指给能力不足的 UE。
- **UE 不上报 NTN 能力但驻上了 NTN 小区会怎样？** —— 要点：网络不会对其配置 NTN 特性（星历辅助、K_offset 生效的前提是能力声明）；实际接入控制应在其驻留前依据能力与频段支持拦截。
- **IoT-NTN 与 NR-NTN 的能力体系一样吗？** —— 要点：不同——NB-IoT/eMTC NTN 复用各自物联网空口并新增 NTN 特有参数（分段上行、扩展 DRX 等），能力 IE 在 36 系列定义，38.306 只管 NR NTN。
