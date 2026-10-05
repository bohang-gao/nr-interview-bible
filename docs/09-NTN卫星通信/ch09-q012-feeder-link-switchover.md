---
title: 馈电链路与用户链路及馈电切换（feeder link switchover）
chapter: 9
difficulty: 中
frequency: 中
tags: [NTN, 卫星, 馈电切换]
---

## 一句话答案

馈电链路（feeder link）是卫星与 NTN Gateway（网关）之间的射频/中继链路，用户链路（service link，也叫服务链路）是卫星与 UE 之间的空口链路；馈电切换（feeder link switchover）是把某颗卫星的馈电链路从一个网关换到另一个网关的过程（TS 38.300 定义），起因是 LEO 卫星飞离当前网关可见区或 GEO 波束交割，切换期间必须保证服务连续性——UE 侧 Ideally 无感知，gNB-CU 不变、只换 NTN-gNB-DU 的回传路由。

## 详细展开

**两种链路的分工**：

| 链路 | 端点 | 承载 | 频段倾向 |
|---|---|---|---|
| 服务链路 service link | UE ↔ 卫星 | NR 空口（Uu） | S/UHF（手持）、Ka（VSAT） |
| 馈电链路 feeder link | 卫星 ↔ 网关 | SRI（卫星无线电接口）中继 + 回传汇聚 | Ka/Q/V 宽带 |

馈电链路汇聚整星流量，因此必须宽带、高可靠；其覆盖约束（卫星必须同时"看得见"UE 区域和某个网关）决定了关口站选址（高纬度少雨区利于 Ka 以上频段的雨衰控制）。

**为什么需要馈电切换**：非静止轨道卫星绕地球转动，与任何固定网关的可见窗口有限（LEO-600 单站可见仅数分钟到数十分钟）；要保持连续服务，卫星必须在不同时刻连接不同网关。TS 38.300 定义："A feeder link switchover is the procedure where the feeder link is changed from a source NTN Gateway to a target NTN Gateway for a specific satellite"。

**架构影响**（TR 38.821 §8.7 / §8.4）：

1. **弯管场景**：gNB 全在地面，馈电切换意味着"gNB-DU 到卫星的射频中继换站"。若新网关的 gNB-DU 属同一 gNB-CU，UE 感知为 gNB 内移动；若跨 CU 则要走 Xn/NG 切换。38.821 给出"two gNB-DUs with individual feeder link connections"下 intra-gNB-CU inter-gNB-DU 移动性的讨论。
2. **再生场景**：gNB-DU 在星上，馈电链路只是回传（NTN-fr1/NTN-fr2 类拓扑），切换回传网关对空口无影响，连续性更好，这是再生架构的运维优势之一。
3. **预测与准备**：38.821 §8.4.1.4 指明星历可用于预测馈电切换时机；网络在切换前把上下文准备好，使服务链路侧无感。

**连续性设计原则**：系统须保证连续服务与馈电切换之间有足够的时间余量（38.821："The system ensures service and feeder link continuity between the successive serving sat-gateways with sufficient time duration to proceed with mobility"）。

**规范依据**：TS 38.300（feeder link switchover 定义与服务链路类型）；TR 38.821 §8.7（馈电切换原则）、§8.4（馈电链路传输特性）

## 关联考点

- 弯管/再生架构差异（切换影响的根源）：[弯管与再生架构](./ch09-q002-transparent-vs-regenerative.md)
- 参考场景与链路类型：[参考场景](./ch09-q005-38821-reference-scenarios.md)
- NTN 移动性与切换：[NTN 移动性](./ch09-q016-ntn-mobility-handover.md)
- 星历预测切换：[卫星星历](./ch09-q006-satellite-ephemeris.md)

## 面试追问

- **馈电切换和 UE 切换有什么区别？** —— 要点：馈电切换是网络侧"换回传接入点"，服务小区可以完全不变（UE 无感）；UE 切换是空口服务波束变更。弯管下两者可能耦合（gNB-DU 变更），再生下完全解耦。
- **GEO 需要馈电切换吗？** —— 要点：GEO 卫星定点，与网关几何关系基本不变，通常无需因几何切换，但雨衰、设备故障或载波资源调整也可能触发；馈电切换主要是 NGSO 的日常事件。
- **为什么关口站常建在高纬度？** —— 要点：极轨道/倾斜轨道 LEO 在高纬度可见时间长；且高纬度雨衰小，利于 Ka/Q/V 馈电频段的链路可用性。
