---
title: AMF 与 SMF 的职责区分及协作
chapter: 6
difficulty: 易
frequency: 高
tags: [AMF, SMF, 会话管理]
---

## 一句话答案

AMF 管"人"——接入与移动性：注册管理、连接管理、移动性管理、NAS 信令终结与透传；SMF 管"会话"——PDU 会话的建立/修改/释放、IP 地址分配、UPF 选择与控制、QoS 与计费策略执行。AMF 收到会话相关 NAS 消息后通过 N11 接口转给 SMF，自己不解析会话细节。

## 详细展开

**1. 职责边界**

| 维度 | AMF | SMF |
|---|---|---|
| 管理对象 | UE（终端） | PDU 会话 |
| 核心职责 | 注册管理（RM）、连接管理（CM）、移动性管理（MM）、可达性、寻呼 | 会话建立/修改/释放、UE IP 分配、UPF 选择、下行数据通知触发寻呼、计费与 QoS 策略执行 |
| NAS 消息 | Registration、Service Request、Paging 相关 | PDU Session Establishment/Modification 等会话类消息 |
| 接口 | N1（NAS）、N2（NGAP，对 gNB）、N8/N12（UDM/AUSF）、N14（AMF 间） | N4（PFCP，对 UPF）、N7（PCF）、N10（UDM）、N16（SMF 间） |

**2. 协作流程（以 PDU 会话建立为例）**

```
UE → AMF : PDU Session Establishment Request（NAS，经 gNB 透传）
AMF → SMF : N11（Nsmf_PDUSession_CreateSMContext）
SMF      : 选 UPF、与 PCF 交互策略、向 UDM 取签约
SMF → UPF : N4 会话建立（PFCP）
SMF → AMF : 会话建立结果 + N2 SM 信息
AMF → gNB : N2 PDU Session Resource Setup（经 NGAP）
gNB → UE  : RRC 重配 + NAS PDU Session Establishment Accept
```

AMF 全程只做"搬运与触发"：解析到这是会话类消息就交给 SMF；移动性流程（切换、寻呼）则不惊动 SMF，只在需要更新用户面隧道时才引入会话管理。

**3. 分离的意义**

- **移动性与会话解耦**：UE 移动（如站间切换）不动会话锚点；会话释放也不影响注册状态。
- **独立扩容**：物联网场景 AMF 密集、大流量场景 SMF/UPF 密集，可分别弹性伸缩。
- **AMF 重选不中断业务**：UE 移出 AMF 服务区时，AMF 间走 N14 转移上下文，PDU 会话由 SMF/UPF 维持。

## 关联考点

- 会话建立全流程：[PDU 会话建立流程涉及的功能与接口](ch06-q008-pdu-session-establishment.md)
- 5GC NF 总览：[5GC 网络功能总览](ch06-q003-5gc-nf-overview.md)
- 移动性管理流程：[NAS 注册流程要点](../05-关键信令流程/ch05-q013-nas-registration-flow.md)

## 面试追问

- **切换时 AMF 和 SMF 分别做什么？** —— 要点：Xn 切换常不经 AMF（只更新上下文）；NG 切换经 AMF 走 NGAP，AMF 负责信令中转；若 UPF 隧道端点变化，AMF 触发 SMF 走 N4 修改会话。核心：移动性由 AMF 驱动，用户面更新由 SMF 执行。
- **为什么 NAS 信令要经过 AMF 透传给 SMF 而不是 UE 直连 SMF？** —— 要点：UE 只与网络保持一条 NAS 连接（N1），所有 NAS 消息终结在 AMF；这样空口信令路径唯一、安全上下文统一（AMF 参与密钥管理），会话管理作为"服务"挂在注册管理之下，架构更简洁。
- **一个 UE 可以有多个 SMF 吗？** —— 要点：可以。每个 PDU 会话由一个 SMF 管理，不同会话（不同 DNN/切片）可选不同 SMF，实现按业务隔离。

---

*难度提示：易 | 相关规范方向：23.501（架构）、24.501（NAS 会话类消息）*
