---
title: PSCell 修改与辅节点释放流程
chapter: 5
difficulty: 中
frequency: 中
tags: [PSCell, SN Release, SCG]
---

## 一句话答案

PSCell 修改（PSCell change）指 UE 的辅节点内主小区更换：SN 修改自身 SCG 配置（或经 MN 协调），通过 RRC 重配置让 UE 在新 PSCell 上重新同步，分为 SN 内部变更（不经 MN 的用户面重锚）与经 MN 的跨 SN 变更两类。辅节点释放（SN Release）则由 MN（或 SN 自身请求）发起，通过 SgNB Release Request/Release Confirm 完成，空口侧经 RRC 重配置移除 SCG 配置，UE 回退到纯 MN 工作，NR 侧上下文与前转数据清理。

## 详细展开

**1. SN 内 PSCell 修改（SN internal change）**

- 触发：SN 内部移动性（NR 侧测量显示 SN 内更优小区）或 SN 负载管理；
- 信令简化：SN 自行决定，仅需通知 MN 发 RRC 重配置（或按厂商实现经 SN 内部下发），用户面锚点不变（数据路径仍终结原 SN）；
- 空口：UE 在新 PSCell 上执行随机接入（CFRA），C-RNTI 更新，旧 PSCell 资源释放。

**2. 跨 SN 的 PSCell 变更（SN change）**

- 涉及旧 SN 释放 + 新 SN 添加的组合动作，MN 全程协调，含数据前转与承载路径更新，详见辅节点变更流程。

**3. SN Release 流程（MN 发起）**

1. **触发**：LTE 覆盖优先策略、NR 测量变差（如 A2 类判据）、负载调整、语音回落 EPS fallback 前、UE 移出 NR 覆盖；
2. **MN → SN**：发 **SgNB Release Request**（携带释放原因）；
3. **SN 侧清理**：SN 停止调度、启动必要的数据前转（split/SCG 承载未收完的数据前转回 MN）、回 **SgNB Release Confirm**；
4. **空口配置**：MN 经 RRC 重配置删除 SCG 配置与 SCG 承载（SCG bearer 数据回迁为 MCG bearer 或释放）；
5. SN 释放 UE 上下文与 NR 侧资源。

**4. SN 主动请求释放（SN initiated）**

- SN 自身异常或策略（如 NR 侧过载、SCG 同步长期失败）时，SN 可向 MN 发释放请求，MN 确认后按上述流程执行，空口动作一致。

**5. 与失败场景的区别**

| 场景 | 性质 | 空口表现 |
|---|---|---|
| SN Release（正常） | 网络主动管理 | UE 平滑移除 SCG，MN 侧业务不中断 |
| SCG failure（异常） | UE 判定 SCG 失败 | UE 主动上报 SCGFailureInformation，由 MN 决定释放或重建 SCG |

## 关联考点

- SCG 流程总览：[SCG 添加、修改、变更与失败的典型流程](../01-无线基础与演进/ch01-q008-scg-procedures.md)
- SN 变更：[SN change 辅节点变更的触发与流程](ch05-q029-sn-change.md)
- SCG 失败：[SCG failure 流程与失败信息上报](ch05-q034-scg-failure-report.md)

## 面试追问

- **EPS fallback 前为什么要先释放 SN？** —— 要点：语音回落到 LTE（VoLTE）时业务全部迁移回 MN 侧，NR 侧无数据承载需求；先释放 SN 可避免业务迁移过程中两套承载并存造成的资源浪费与路径混乱，也简化回落后的测量与移动性管理。
- **SN 内 PSCell 修改为什么可以不惊动 MN 的用户面？** —— 要点：用户面锚点在 SN 的 GTP-U 端点，只要 SN 不变，数据路径终结点就不变；变更只是 UE 与 SN 之间的空口重选，MN 仅需同步 SCG 配置容器，无需重锚承载。
- **释放 SN 时 UE 正在 SCG bearer 上传数据怎么办？** —— 要点：走数据前转——SN 把未确认/缓存的 PDCP PDU 前转给 MN，MN 继续通过 MCG 承载下发，配合 SN Status Transfer 保证序列号衔接，业务无感。
