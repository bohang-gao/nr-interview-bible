---
title: 网络切片 S-NSSAI 的结构与配置
chapter: 6
difficulty: 中
frequency: 高
tags: [网络切片, S-NSSAI, 切片标识]
---

## 一句话答案

S-NSSAI（Single Network Slice Selection Assistance Information）是网络切片的标识，由 SST（Slice/Service Type，8 bit，表示切片类型）和可选的 SD（Slice Differentiator，24 bit，区分同类型不同实例）组成。UE 通过它表达想接入的切片，网络按 S-NSSAI 做选择、签约、准入与资源隔离。

## 详细展开

**1. 结构**

```
S-NSSAI = SST（8 bit）+ SD（24 bit，可选）
```

| 字段 | 长度 | 含义 | 取值示例 |
|---|---|---|---|
| SST | 8 bit | 切片/服务类型，标准化范围 0–127 | 1 = eMBB，2 = URLLC，3 = mIoT（3GPP 预定义） |
| SD | 24 bit | 切片区分符，运营商自定义 | 0x01A2B3（区分不同租户/区域） |

- 只含 SST 的 S-NSSAI 称"默认 S-NSSAI"（如仅 SST=1）。
- SST 128–255 为非标准取值，运营商可用 SD 配合做私有切片。
- **配置约定**：SST/SD 在 PLMN 内有效；漫游场景签约里可带 mapped S-NSSAI（归属网络与拜访网络切片的映射）。

**2. 配置位置**

| 位置 | 内容 |
|---|---|
| UE（USIM/签约） | 允许的 S-NSSAI（Allowed NSSAI）、默认配置 NSSAI |
| UDM 签约 | 订阅的 S-NSSAI、各切片对应的 DNN、默认 SSC mode |
| gNB | 本小区支持的切片列表（NG Setup / Xn Setup 时上报 AMF/对端） |
| NSSF | 切片→AMF 集合/网络切片实例的映射 |
| AMF | 可服务的 S-NSSAI 集合（AMF 按切片能力选择） |

**3. NSSAI 的几种形态**

- **Requested NSSAI**：UE 发起注册时带上想用的切片。
- **Allowed NSSAI**：网络（AMF 参照签约与切片可用性）批准 UE 在当前注册区域可用的切片。
- **Configured NSSAI**：签约预配置给 UE 的切片集合，用于构造 Requested NSSAI。

注册接受消息把 Allowed NSSAI 下发给 UE；之后每个 PDU 会话必须绑定到 Allowed NSSAI 中的一个切片。

## 关联考点

- 切片选择流程：[切片选择流程（NSSF 与 AMF 的分工）](ch06-q010-slice-selection-nssf.md)
- 切片与 QoS：[切片与 5QI/QoS 策略的关系](ch06-q011-slice-5qi-qos.md)
- 会话建立中的切片参数：[PDU 会话建立流程涉及的功能与接口](ch06-q008-pdu-session-establishment.md)

## 面试追问

- **SST 和 SD 各起什么作用？只配 SST 行不行？** —— 要点：SST 表达业务类型大类（eMBB/URLLC/mIoT），SD 在同类型下区分不同切片实例（不同租户、不同区域、不同隔离等级）；只配 SST 完全合法，表示"该类型下的默认切片"，SD 是可选的精细化手段。
- **Requested NSSAI 和 Allowed NSSAI 不一致怎么办？** —— 要点：网络只批准签约且当前可用的子集，注册接受会带 Rejected NSSAI（及拒绝原因，如该 TA 不可用/未签约）；UE 若必须用被拒切片，可在相应条件下换 TA 或发起重注册，否则只能用 Allowed NSSAI 建会话。
- **切片隔离体现在哪些层面？** —— 要点：签约/准入隔离（不同切片不同用户群）、控制面隔离（可部署独立 AMF/SMF 实例）、用户面隔离（独立 UPF/传输）、资源隔离（gNB 可为切片配置专用 PRB/权重）；从"逻辑隔离"到"物理专网"由 SLA 决定。

---

*难度提示：中 | 相关规范方向：23.501（切片架构与 NSSAI）、23.003（S-NSSAI 编码）*
