---
title: NR 寻呼完整流程（核心网寻呼与 RAN 寻呼）
chapter: 5
difficulty: 中
frequency: 高
tags: [寻呼, CN Paging, RAN Paging]
---

## 一句话答案

NR 寻呼分两类：核心网寻呼（CN Paging）由 AMF 发起、经 NG 接口下发，用于寻呼 RRC IDLE/INACTIVE 态的 UE（如下行数据到达），UE 收到后发 Service Request 建立连接；RAN 寻呼（RAN Paging）由 gNB 发起、经 Xn 在 RNA 内分发，仅用于寻呼 RRC INACTIVE 态 UE（如 RAN 侧下行数据或 RNA 内定位），UE 收到后走 RRC Resume 快速恢复。两类共用空口的寻呼机制（PF/PO 计算、PDCCH P-RNTI 加扰的 DCI 1_0 指示）。

## 详细展开

**1. 两类寻呼对比**

| 维度 | 核心网寻呼 | RAN 寻呼 |
|---|---|---|
| 发起者 | AMF（5GC 侧） | 最后服务 gNB |
| 传递路径 | AMF → NGAP Paging → 各 gNB → Uu | 最后服务 gNB → Xn → RNA 内 gNB → Uu |
| 目标状态 | RRC IDLE 或 INACTIVE | 仅 RRC INACTIVE |
| UE 响应 | NAS Service Request（可触发完整建立或 resume） | RRC Resume Request（快速恢复） |
| 典型场景 | 下行数据/短信/CS 回落类 NAS 触发 | RAN 侧数据到达、RNA 内 INACTIVE UE 管理 |

**2. 空口寻呼机制（两类共用）**

1. gNB 按 UE 的 5G-S-TMSI（或 I-RNTI 推导）计算 **PF（Paging Frame，寻呼帧）与 PO（Paging Occasion，寻呼时机）**，PF 是特定 SFN，PO 是 PF 内的特定 PO 时隙索引；
2. gNB 在 PO 上用 **P-RNTI 加扰 PDCCH**，发 DCI 1_0（短格式），指示 UE 到对应 PDSCH 接收寻呼消息（RRC Paging 消息）或指示系统信息变更/ETWS 等公共通知；
3. UE 在 IDLE/INACTIVE 态按 DRX 周期在各自 PO 醒来监听，未命中则继续休眠；
4. 寻呼消息内含被呼 UE 标识列表（5G-S-TMSI 或完整 I-RNTI），命中后按对应流程响应。

**3. CN 寻呼的端到端链路（下行数据到达为例）**

UPF 收到下行数据 → 通知 SMF/AMF → AMF 查 UE 状态（IDLE/INACTIVE 且可达）→ 向注册区域（TAI list）内所有 gNB 发 NG Paging（含 5G-S-TMSI、寻呼优先级、DRX）→ gNB 空口寻呼 → UE 响应发 Service Request → 建立连接后 UPF 下行数据送达。

**4. RAN 寻呼的链路（INACTIVE 下行数据为例）**

UPF 数据到最后服务 gNB（INACTIVE 下锚点仍在原 gNB 或经 Xn 前转）→ 原发 gNB 向 RNA 内 gNB 发 Xn RAN Paging → 空口寻呼 → UE 回 RRC Resume Request → 最后服务 gNB 取回上下文恢复连接。

**5. 寻呼不到的处理**

- UE 不可达（周期性注册超时标记）或 RNA/TA 内未响应 → 网络按策略延迟或丢弃数据；
- RAN 寻呼失败可退化为 CN 寻呼（最后服务 gNB 通知 AMF 走 NG Paging 兜底）。

## 关联考点

- PF/PO 计算细节：[NR 寻呼机制与 PF/PO 的计算](../04-空口协议栈/ch04-q032-nr-paging-pf-po.md)
- 寻呼响应流程：[Service Request 流程（寻呼响应/上行数据触发）](ch05-q016-service-request.md)
- INACTIVE 态：[RRC INACTIVE 与 LTE IDLE 的区别及 RNA 概念](../04-空口协议栈/ch04-q022-rrc-inactive-vs-lte-idle.md)

## 面试追问

- **为什么 CN 寻呼对 INACTIVE UE 也能用，二者不冲突吗？** —— 要点：不冲突。CN 寻呼是"兜底通道"（AMF 视角 UE 只要不在连接态都可 CN 寻呼）；RAN 寻呼是"快速通道"（INACTIVE 专属，恢复快）；实际中最后服务 gNB 对 INACTIVE UE 的下行数据优先走 RAN 寻呼，失败才通知 AMF 走 CN 寻呼，两条通道最终空口机制相同。
- **寻呼 DRX 周期越长越好吗？** —— 要点：不是。周期长→UE 醒得少、省电，但被呼时延增大、寻呼消息在 PO 上可能积压；周期短→响应快但耗电与 PDCCH 开销上升。现网按业务类型与终端类别（物联网长周期、手机短周期）差异化配置。
- **RAN 寻呼为什么要限定在 RNA 内？** —— 要点：RNA 是"RAN 侧通知区域"，INACTIVE UE 只在 RNA 变化时更新 RAN 侧记录；gNB 知道 UE 在这个范围内但不知具体小区，故在 RNA 内全量寻呼——范围比注册区域（CN 侧）小，寻呼开销低于 CN 寻呼，这正是 INACTIVE 态省信令的设计意图。
