---
title: 切片选择流程（NSSF 与 AMF 的分工）
chapter: 6
difficulty: 难
frequency: 中
tags: [网络切片, NSSF, AMF选择]
---

## 一句话答案

切片选择分两级：注册时 NSSF 根据 UE 的 Requested NSSAI 与签约，决定允许的切片、选择的网络切片实例，并给出应服务的 AMF 集合（若当前 AMF 不合适则触发 AMF 重选）；AMF 则在已定切片的前提下，为每个 PDU 会话选择 SMF 与 UPF。简言之，NSSF 管"选切片+选 AMF"，AMF 管"在切片内选会话网元"。

## 详细展开

**1. 注册阶段的切片选择**

```
① UE → (R)AN → AMF : Registration Request（Requested NSSAI, guided 信息）
② AMF 判断自身能否服务所有 Requested NSSAI
   ├─ 能：直接继续注册，无需 NSSF
   └─ 不能：AMF → NSSF 调用 Nnssf_NSSelection_Get
③ NSSF 查询：
   - 签约切片（经 NRF 找 UDM/NF）
   - 各切片可用的网络切片实例（NSI）
   - 该切片可用的 AMF 集合（AMF Set）
④ NSSF → AMF : Allowed NSSAI、映射关系、目标 AMF 集合（或 NSI 信息）
⑤ 若当前 AMF 不在集合内 → RAN/AMF 触发 AMF 重选（Reroute NAS）
⑥ 新 AMF 继续注册，注册接受携带 Allowed NSSAI
```

**2. 会话阶段的切片选择（AMF 主导）**

- UE 建 PDU 会话时携带目标 S-NSSAI（必须在 Allowed NSSAI 内）。
- AMF 按（S-NSSAI, DNN）选择 SMF：本地配置或经 NRF 发现支持该切片的 SMF 实例。
- SMF 再选 UPF：同样受切片约束——不同切片通常有各自的 UPF 池，保证用户面隔离与 SLA。

**3. NSSF 与 AMF 分工对比**

| 维度 | NSSF | AMF |
|---|---|---|
| 职责 | 切片级：Allowed NSSAI、NSI 选择、候选 AMF 集合 | 会话级：切片内选 SMF、会话承载管理 |
| 介入时机 | 注册阶段（AMF 不确定能否服务时） | 全程（注册与每个 PDU 会话） |
| 输出 | NSSAI 相关决策 + 路由指引 | NAS 流程执行与资源建立 |

**4. 工程要点**

- 多数现网把 NSSF 能力与 NRF/UDM 合设或轻量部署，独立 NSSF 多见于多租户/行业专网。
- "guided 信息"（RAN 侧路由指示）可帮助 RAN 直接把 NAS 消息送到合适 AMF，减少重定向。

## 关联考点

- S-NSSAI 结构：[网络切片 S-NSSAI 的结构与配置](ch06-q009-snssai-structure.md)
- AMF 职责：[AMF 与 SMF 的职责区分及协作](ch06-q004-amf-smf-responsibilities.md)
- NRF 与服务发现：[SBA 服务化架构与网络功能接口](ch06-q006-sba-service-based-architecture.md)

## 面试追问

- **什么情况下注册不需要 NSSF 参与？** —— 要点：当前 AMF 的可服务切片集合覆盖 UE 的全部 Requested NSSAI（AMF 本地可判断），或 UE 请求默认切片且 AMF 能服务；NSSF 只在"AMF 不确定/不能服务"时介入，避免每注册都多一跳查询。
- **AMF 重选（Reroute NAS）怎么做？** —— 要点：NSSF/AMF 给出目标 AMF 集合后，AMF 可指示 RAN 把 UE 的后续 NAS 消息重路由到集合内的新 AMF（含上下文转移或让 UE 重新发起）；目标 AMF 通过 AMF Set 内的上下文获取（N14 接口）延续注册，尽量不让 UE 重头再来。
- **切片实例（NSI）和 S-NSSAI 是一回事吗？** —— 要点：不是。S-NSSAI 是逻辑标识，NSI 是实际部署的一组 NF 实例组合（含 AMF/SMF/UPF 子集）；一个 S-NSSAI 可映射到不同区域的多个 NSI，NSSF 维护这层映射，实现"一个切片标识、多地就近部署"。

---

*难度提示：难 | 相关规范方向：23.501/23.502（切片选择与 AMF 重选）*
