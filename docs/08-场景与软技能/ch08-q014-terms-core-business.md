---
title: 高频英文术语中英对照（三）：核心网与业务
chapter: 8
difficulty: 易
frequency: 中
tags: [术语对照, 核心网, 业务]
---

## 一句话答案

核心网与业务术语分四组：网元类（AMF、SMF、UPF、PCF、NSSF、UDM）、架构类（SBA、N1~N6 接口、PDU Session、Network Slice）、业务与 QoS 类（5QI、GBR、QoS Flow、DNN、MEC）、演进与语音类（EPS Fallback、VoNR、N26）。核心网术语的面试特征是"缩写承载角色"——说 AMF 必须能展开 Access and Mobility Management Function（接入与移动性管理功能），并说清它管什么、不管什么。

## 详细展开

**① 核心网网元类**：

| 英文 | 缩写 | 中文规范名 | 一句话职责 |
|---|---|---|---|
| Access and Mobility Management Function | AMF | 接入与移动性管理功能 | 注册、连接管理、移动性、NAS 信令终结 |
| Session Management Function | SMF | 会话管理功能 | PDU 会话建立/修改、IP 分配、UPF 选择 |
| User Plane Function | UPF | 用户面功能 | 数据面锚点、路由转发、QoS 执行 |
| Policy Control Function | PCF | 策略控制功能 | 下发 QoS/计费策略 |
| Network Slice Selection Function | NSSF | 网络切片选择功能 | 按 NSSAI 选择服务的切片/AMF |
| Unified Data Management | UDM | 统一数据管理 | 签约数据、鉴权凭证（配合 AUSF 鉴权服务功能） |
| Network Repository Function | NRF | 网络存储功能 | 网元注册与发现（SBA 的"通讯录"） |
| Network Exposure Function | NEF | 网络开放功能 | 能力对外开放（第三方调用） |

**② 架构与接口类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| Service-Based Architecture | SBA | 服务化架构 |
| PDU Session | — | PDU 会话（UE 与 DN 间的连接） |
| Data Network Name | DNN | 数据网络名称（相当于 4G 的 APN） |
| Network Slice Selection Assistance Information | NSSAI / S-NSSAI | 网络切片选择辅助信息/单网络切片选择辅助信息 |
| Next Generation (interface) | N1~N6 | N1（UE-AMF）、N2（gNB-AMF）、N3（gNB-UPF）、N4（SMF-UPF）等 |
| Xn interface | Xn | gNB 间接口 |
| Multi-access Edge Computing | MEC | 多接入边缘计算 |

**③ 业务与 QoS 类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| 5G QoS Identifier | 5QI | 5G QoS 标识（标量索引，映射时延/丢包等特性） |
| Guaranteed Bit Rate | GBR | 保证比特速率（及其扩展 GBRLINK 等） |
| Non-GBR | — | 非保证比特速率 |
| QoS Flow | — | QoS 流（5G QoS 的最小粒度） |
| Reflective QoS | — | 反射式 QoS（UE 由下行包学习上行 QoS 规则） |
| Session and Service Continuity | SSC | 会话与业务连续性（模式 1/2/3） |

**④ 语音与互操作类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| Voice over NR | VoNR | 5G 新空口语音 |
| EPS Fallback | — | EPS 回落（5G 打电话回落 4G VoLTE） |
| Interworking Function（N26 接口） | — | 4G/5G 互操作接口 |
| Tracking Area Update | TAU | 跟踪区更新 |
| Service Request | — | 业务请求（空闲态唤醒） |

**记忆方法**：网元按"一次注册 + 一次上网"串记——UE 注册先碰 AMF（移动性）→ SMF 建会话（选 UPF、分 IP）→ UPF 送数据 → PCF 给策略、UDM 查签约、NSSF 定切片、NRF 全程"通讯录"。QoS 按"一条流的一生"记——PCF 下策略 → SMF 建 QoS Flow（5QI 定特性）→ gNB 映射 DRB → UPF 执行标记。能对英文缩写讲出"它在流程里的位置"，才算真掌握。

## 关联考点

- AMF/SMF 职责划分：[AMF 与 SMF](../06-组网与架构/ch06-q004-amf-smf-responsibilities.md)
- 服务化架构：[SBA](../06-组网与架构/ch06-q006-sba-service-based-architecture.md)
- 5QI 与 GBR/Non-GBR：[5QI 体系](../06-组网与架构/ch06-q012-5qi-gbr-non-gbr.md)
- VoNR 与 EPS Fallback：[语音方案对比](../01-无线基础与演进/ch01-q016-vonr-vs-eps-fallback.md)

## 面试追问

- **AMF 和 SMF 的职责边界？为什么 5G 要把控制面拆这么细？** —— 要点：AMF 管接入与移动性（不管会话），SMF 管会话（不管移动性）；拆细是服务化架构"功能解耦、按需组合"的体现——AMF 可服务多切片、SMF 可按 DNN/切片灵活选择，4G MME 把两者绑在一起，扩展性差。
- **PDU Session 和 4G 的 PDN Connection 有什么本质区别？** —— 要点：PDU Session 支持多种 PDU 类型（IPv4/IPv6/Ethernet/Unstructured）、可锚定多个 UPF（支持 SSC 模式切换与会话连续性）、QoS 粒度到 QoS Flow 且支持反射式 QoS——一句话"从'一条管道'变成'可编排、可迁移的会话'"。
- **N2 和 N3 分别走什么？为什么分开？** —— 要点：N2 是 gNB-AMF 控制面信令，N3 是 gNB-UPF 用户面数据；分开是 C/U 分离的延续——控制面集中慢变、用户面可灵活下沉快变，UPF 换位置不需要动 AMF 关系。
