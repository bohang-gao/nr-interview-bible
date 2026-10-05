---
title: NG 接口切换与 Xn 切换的差异
chapter: 5
difficulty: 中
frequency: 中
tags: [NG切换, Xn切换, 切换]
---

## 一句话答案

两者的核心差异在"切换准备走哪条路"：Xn 切换由源 gNB 与目标 gNB 直接通过 Xn 接口协商准备，核心网只在最后做路径切换（Path Switch）；NG 切换则由源 gNB 通过 AMF 中转，走 NGAP 的 Handover Required → Handover Command，目标侧再与 AMF 做资源准备。NG 切换信令路径更长、时延更大，但适用于无 Xn 链路、跨 AMF、跨 UPF 或需要核心网重路由承载的场景。

## 详细展开

**1. 信令路径对比**

| 维度 | Xn 切换 | NG 切换 |
|---|---|---|
| 准备路径 | 源 gNB ↔ 目标 gNB（XnAP Handover Request/Ack） | 源 gNB → AMF → 目标 gNB（NGAP Handover Required/Request/Command/Ack） |
| 核心网角色 | 不参与准备，仅收 Path Switch | 全程参与准备与执行，切换命令由 AMF 中转 |
| 数据前转 | 源/目标 gNB 间直接经 Xn 前转 | 经 UPF/间接前转（源与目标间可走核心网中转） |
| 完成阶段 | 目标 gNB 发 Path Switch Request，AMF 换 UPF 下行端点 | 目标 gNB 发 Handover Notify，AMF/UPF 侧承载路径重构 |
| 跨 AMF/UPF | 不支持（或需额外锚点） | 支持（含 AMF 间与 UPF 重选插入） |
| 前提条件 | 两 gNB 间已建 Xn 且目标无跨核心网需求 | 无 Xn 也可靠 NG 兜底 |

**2. NG 切换的流程要点**

1. 源 gNB 判决后发 **Handover Required**（含目标 gNB ID、待切换 QoS flow）；
2. AMF 向目标 gNB 发 **Handover Request**，目标做接纳并回 **Handover Request Acknowledge**（含目标侧 RRC 容器）；
3. AMF 向源 gNB 发 **Handover Command**，源下发 RRCReconfiguration 给 UE；
4. UE 接入目标小区并回 RRCReconfigurationComplete，目标 gNB 发 **Handover Notify**；
5. 源侧经 AMF 收到释放指示后释放 UE 上下文。

**3. 现网选型逻辑**

- 邻站间、同 AMF/UPF、Xn 健在 → 优先 Xn（时延小、信令少，对 VoNR 类低时延业务友好）；
- 跨 AMF 池、跨 UPF 大区域、Xn 未建或故障 → NG 兜底；
- 一些设备商实现里，Xn 准备失败也会自动退化为 NG 切换重试。

**4. 时延差异的来源**

NG 切换多两跳核心网信令（AMF 中转），且目标侧资源准备要经过 AMF 协调；Xn 切换的准备在空口"直连对端"完成，通常快几十毫秒量级——这在高铁等高速移动场景下直接影响切换中断时间与掉话率。

## 关联考点

- Xn 切换细节：[Xn 接口切换的完整流程（含数据前转与路径切换）](ch05-q023-xn-handover-procedure.md)
- 核心网架构：[5GC 网络功能总览（AMF/SMF/UPF/UDM/PCF/AUSF/NSSF/NRF）](../06-组网与架构/ch06-q003-5gc-nf-overview.md)
- 密钥更新：[切换中的密钥更新（KgNB 刷新与水平/垂直推导）](../04-空口协议栈/ch04-q028-handover-key-update.md)

## 面试追问

- **为什么 NG 切换里 RRC 命令还要经 AMF 中转而不是直发？** —— 要点：切换涉及核心网侧承载与安全上下文的一致性管理，AMF 是控制面锚点；gNB 间无 NG 直连，NGAP 只存在于 gNB-AMF 之间，RRC 容器必须嵌套在 NGAP 消息里逐跳传递。
- **跨 AMF 的 NG 切换多什么动作？** —— 要点：源 AMF 与目标 AMF 间还要完成上下文转移（ Namf_Communication 相关），必要时目标 AMF 还要重选 UPF 并在目标侧插入新 UPF 做 PDU 会话重路由；对 UE 透明，只感知 RRC 命令。
- **Xn 切换的 Path Switch 和 NG 切换的 Handover Notify 是不是一回事？** —— 要点：作用类似（让核心网知道 UE 已到新侧），但机制不同：Path Switch 是 Xn 切换专用，直接请求换 UPF 下行端点，AMF 回应后即完成；Handover Notify 是 NG 切换流程中的"到达确认"，路径重构在准备阶段已由 AMF/UPF 协调完成。
