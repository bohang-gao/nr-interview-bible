---
title: RRC INACTIVE 与 LTE IDLE 的区别及 RNA 概念
chapter: 4
difficulty: 中
frequency: 高
tags: [RRC, INACTIVE, RNA, 状态机]
---

## 一句话答案

LTE IDLE 是"彻底断开"：AS 上下文全部释放，恢复业务需重走 RRC 建立加 NAS 流程；NR RRC_INACTIVE 是"挂起待命"：gNB 保留 UE 上下文，恢复只需 RRCResume 交互。二者在移动性与寻呼上的关键差别是 RNA——INACTIVE 的寻呼与移动性管理由 RAN 侧按 RNA 粒度处理，而不是核心网按跟踪区（TA, Tracking Area）处理。

## 详细展开

**逐项对比**：

| 维度 | LTE RRC_IDLE | NR RRC_INACTIVE |
|---|---|---|
| AS 上下文 | UE 与网络均不保留 | gNB（锚点）与 UE 均保留 |
| 恢复流程 | RRC 连接建立 + NAS 服务请求 | RRCResume（携带 I-RNTI） |
| 寻呼发起方 | MME 发 CN 寻呼，全跟踪区 | 锚 gNB 发 RAN 寻呼，限 RNA 范围 |
| 移动性 | 小区重选，跨 TA 需 TAU 上报核心网 | 小区重选，跨 RNA 需 RNAU 通知 RAN |
| 配置保留 | 无，重连后全部重新配置 | 保留安全配置、测量配置、C-RNTI 等 |
| 恢复时延 | 长（多轮信令、可能含鉴权） | 短（一次 RRCResume/RRCResumeComplete 即可恢复 SRB 与 DRB） |
| CM 状态 | CM-IDLE（核心网侧也未达） | CM-CONNECTED（N2 保持在位，核心网侧连接未断） |

**RNA 的两种配置方式**（网络选其一）：

1. **RNA 列表**：网络直接给 UE 下发一串小区标识列表，UE 驻留在列表内任意小区都算"在 RNA 内"。
2. **RNA 区域**：给 UE 一个 RNA ID（由 PLMN + RNA 区码组成，类似 TAI 的结构），凡广播相同 RNA ID 的小区都属于该区域。

**RNAU 触发时机**：UE 重选到 RNA 外小区；或周期性 RNAU 定时器到期。此时 UE 发起 RRC 恢复流程（可带 suspend 指示恢复后继续挂起），相当于把 LTE 的 TAU 换成了 RAN 内部的轻量更新——信令不必到达核心网，这是控制面减负的核心手段。

**适用判断**：话务间歇明显、小包频繁的终端（聊天、IM、IoT）受益最大；持续大流量或移动性极强的场景意义不大。

## 关联考点

- [RRC 三种状态及各状态下的行为差异](ch04-q021-rrc-three-states.md)
- [RRC 重建的条件、流程与 SRB0 的使用](ch04-q031-rrc-reestablishment-srb0.md)
- [NR 寻呼机制与 PF/PO 的计算](ch04-q032-nr-paging-pf-po.md)
- [数据到达触发的连接建立全链路（service request 视角）](ch04-q037-service-request-mob-data.md)

## 面试追问

- **INACTIVE 下 UE 移动到另一个 gNB 的小区并恢复，上下文怎么处理？** —— 新 gNB 通过 I-RNTI 找到（或经核心网转发定位到）锚点 gNB 取回 UE 上下文（Xn/NG 接口取上下文），恢复成功后上下文可迁移到新 gNB；取不到则恢复失败回落 IDLE。
- **RAN 寻呼失败后会怎样？** —— 锚点 gNB 可进一步触发 5GC 的 CN 寻呼兜底（按 NAS 级跟踪区寻呼）；若 UE 收到 CN 寻呼，需先通过恢复流程回到 CONNECTED 再响应业务。
- **suspend 后 UE 安全密钥还用原来的吗？** —— 恢复时基于原 KgNB（或 fullSecurity 处理后的密钥）做完整性验证，且恢复流程中会推导新的密钥，防止旧密钥长期使用带来的风险。
