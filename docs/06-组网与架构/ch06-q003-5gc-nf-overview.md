---
title: 5GC 网络功能总览（AMF/SMF/UPF/UDM/PCF/AUSF/NSSF/NRF）
chapter: 6
difficulty: 易
frequency: 高
tags: [5GC, SBA, 网络功能]
---

## 一句话答案

5G 核心网（5GC）由一组服务化的网络功能（NF, Network Function）组成：AMF 负责接入与移动性管理，SMF 负责会话管理，UPF 负责用户面转发，UDM 存签约数据，PCF 出策略，AUSF 负责鉴权，NSSF 负责切片选择，NRF 负责服务发现与注册。NF 之间通过服务化接口（SBI）基于 HTTP/2 交互，取代了 4G EPC 点对点硬连接。

## 详细展开

**1. 主要 NF 一览**

| NF | 全称 | 核心职责 |
|---|---|---|
| AMF | Access and Mobility Management Function | 注册管理、连接管理、移动性管理、NAS 信令终结 |
| SMF | Session Management Function | PDU 会话建立/修改/释放、IP 地址分配、UPF 选择与控制 |
| UPF | User Plane Function | 用户面数据路由转发、QoS 执行、计费采集、锚点 |
| UDM | Unified Data Management | 签约数据管理、鉴权凭证生成、用户标识处理 |
| PCF | Policy Control Function | QoS 策略（PCC）、计费策略、接入与移动性策略下发 |
| AUSF | Authentication Server Function | 主鉴权服务（5G-AKA / EAP-AKA'） |
| NSSF | Network Slice Selection Function | 为 UE 选择网络切片实例与 AMF 集合 |
| NRF | NF Repository Function | NF 注册/发现/状态维护，SBA 的"通讯录" |

**2. 与 4G EPC 的对应关系**

| EPC | 5GC | 说明 |
|---|---|---|
| MME | AMF + 部分 SMF | 移动性管理与会话管理分离更彻底 |
| SGW/PGW-C | SMF | 控制面合一 |
| SGW-U/PGW-U | UPF | 用户面合一，且可多级下沉 |
| HSS | UDM + AUSF | 数据与鉴权分离 |
| PCRF | PCF | 命名变化，职责延续 |

**3. 架构特点**

- 基于服务化架构（SBA）：每个 NF 把能力封装为"服务"，通过统一接口暴露，其他 NF 可直接调用，NRF 负责发现。
- 控制面与用户面彻底分离（CUPS 思想的完全体）：控制面 NF 不转发用户数据，UPF 独立按流量/位置灵活部署。

## 关联考点

- 服务化架构原理：[SBA 服务化架构与网络功能接口](ch06-q006-sba-service-based-architecture.md)
- AMF/SMF 分工：[AMF 与 SMF 的职责区分及协作](ch06-q004-amf-smf-responsibilities.md)
- 用户面部署：[UPF 的位置、作用与下沉部署](ch06-q005-upf-position-deployment.md)

## 面试追问

- **5GC 与 EPC 最本质的区别是什么？** —— 要点：从"点对点专有接口"变成"服务化接口（SBI，HTTP/2 + JSON）"，NF 可即插即用、按需调用；配合 CUPS 实现控制面与用户面彻底解耦，具备云原生弹性。
- **UDM 与 AUSF 为什么要分开？** —— 要点：UDM 保存签约与凭证（前端 UDR 存储），AUSF 只做鉴权算法执行与鉴权服务；分离后鉴权能力可独立调用、独立扩容，也让归属网络与拜访网络（漫游）的鉴权边界更清晰。
- **NRF 挂了会怎样？** —— 要点：NRF 是发现入口，新建会话/注册等需要发现的操作会失败；已建立的信令关联与用户面不受影响。生产上 NRF 需集群高可用部署，NF 侧也会缓存已发现的 NF 地址。

---

*难度提示：易 | 相关规范方向：23.501（5G 系统架构总览）*
