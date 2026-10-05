---
title: NSA 与 SA 组网架构的区别及演进路径
chapter: 1
difficulty: 易
frequency: 高
tags: [组网, NSA, SA]
---

## 一句话答案

非独立组网（NSA, Non-Standalone）指 5G 基站不能独立工作，必须依托 4G 基站作为控制面锚点、依托 4G 核心网（EPC）或 5G 核心网（5GC）提供业务；独立组网（SA, Standalone）指 5G 基站与 5G 核心网完整独立成网。演进路径上运营商普遍"先 NSA 快速铺覆盖、后 SA 承载全部业务"，最终目标是 SA。

## 详细展开

两者在控制面、核心网、业务能力上的差异：

| 维度 | NSA（以 Option 3x 为例） | SA（Option 2） |
|---|---|---|
| 无线控制面 | LTE 基站（eNB）为锚点，NR 基站（gNB）受其辅控 | gNB 独立控制 |
| 核心网 | EPC（4G 核心网）为主 | 5GC（5G 核心网） |
| 信令承载 | RRC 走 LTE（MeNB） | 全部走 NR |
| 5G 核心网新特性 | 不可用（无网络切片、SBA 等） | 网络切片、边缘计算、新 QoS 框架均可 |
| 语音 | 依赖 VoLTE / EPS fallback | NR 上原生语音（VoNR），过渡期可回落 |
| 终端要求 | 支持 EN-DC 的 4G/5G 双模终端 | 支持 SA 的 5G 终端 |
| 部署节奏 | 快：复用 4G 覆盖与核心网，gNB 即插即用 | 慢：需新建 5GC 与全 5G 覆盖 |

演进路径的典型叙事（按运营商实践归纳）：

1. **起步期——NSA Option 3x**：利用成熟的 4G 连续覆盖做锚点，5G 做"热点提速层"，用户面尽量走 NR，快速放大 5G 流量；核心网只需在 EPC 上做少量增强（MME 支持 S1-U 分拆、新增锚点选择逻辑）。
2. **过渡期——NSA/SA 双模并存**：核心网侧引入 5GC（通常与 EPC 混合组网，即 Option 4/7 系列），网络同时服务 NSA 与 SA 终端。
3. **成熟期——SA Option 2**：5GC 承载全部业务，gNB 连续覆盖后独立驻留；网络切片、uRLLC 等真正 5G 能力只有在 SA 下才能兑现。

关键结论：NSA 的"非独立"指控制面与核心网依赖 4G；SA 才是完整的 5G 网络。NSA 无法提供低时延网络切片等 5GC 特性，这是两者本质区别而非速率差异。

## 关联考点

- NSA/SA 常见部署选项差异：[部署选项](./ch01-q004-deployment-options.md)
- EN-DC 双连接的基本概念与架构：[EN-DC](./ch01-q005-en-dc-architecture.md)
- NSA 语音方案 EPS fallback：[NSA 语音](./ch01-q015-nsa-voice-eps-fallback.md)

## 面试追问

- **NSA 用户的速率能达到 5G 水平吗？** —— 要点：能。NSA 下用户面数据可以走 NR（如 Option 3x 的 SCG bearer），速率与 SA 相近；差别不在速率而在 5GC 特性（切片、QoS 框架、低时延能力）。
- **为什么运营商不直接一步上 SA？** —— 要点：SA 需要 5GC 全新建设与 NR 连续覆盖，投资大、周期长；NSA 复用 4G 锚点可"增量演进"，先抢占 5G 用户与流量，再逐步向 SA 迁移。
- **NSA 终端在 SA 网络下能否使用？** —— 要点：要看终端是否支持 SA 模式；仅支持 NSA 的终端无法在纯 SA 网络驻留，当前主流 5G 终端均为 NSA/SA 双模。
