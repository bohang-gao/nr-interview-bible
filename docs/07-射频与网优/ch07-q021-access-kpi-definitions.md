---
title: 5G 接入类 KPI 的定义与统计口径
chapter: 7
difficulty: 中
frequency: 高
tags: [KPI, 接入性, 随机接入]
---

## 一句话答案

接入类 KPI 衡量"用户能不能顺利连上网"，核心是 RRC 建立成功率和 E-RAB/PDU 会话建立成功率（SA 网还有 NG 接口相关建立）。RRC 建立成功率 = RRC 建立成功次数 ÷ RRC 连接建立请求次数，口径的关键在分子分母都要落在同一段信令链路上（从 RRCSetupRequest 到 RRCSetupComplete），且要剔除重发造成的重复统计。

## 详细展开

**接入链路分层**：一次完整接入是"随机接入（L1）→ RRC 建立（L3）→ NAS 注册 → QoS 流/PDU 会话建立"逐层串联，KPI 也逐层统计：

| KPI | 分子/分母 | 反映的问题 |
|---|---|---|
| 随机接入成功率 | 收到 Msg3 / 发送 Msg1（设备商口径不一） | 前导接收、上行覆盖 |
| RRC 建立成功率 | RRCSetupComplete / RRCSetupRequest | 接入准入、拥塞、覆盖 |
| NG 口径的注册类指标 | 注册成功 / Initial UE Message | 核心网、鉴权 |
| PDU 会话建立成功率 | 会话建立成功 / 尝试次数 | 5GC、QoS 策略 |

**统计口径要点**（面试常考细节）：

1. **尝试次数的定义**：以收到第一条 RRCSetupRequest 计一次尝试，同一 UE 的重发（相同 RRC 事务标识）不重复计数；若设备把重发也计数，成功率会被人为压低。
2. **建立原因分类**：RRC 建立按原因值（emergency、highPriorityAccess、mt-Access、mo-Signalling、mo-Data 等）分类统计，通常以 mo-Data 为业务口径，信令类单独看。
3. **失败在哪一层**：RRC 建立失败常见于小区-barred、接入拥塞（ACB 统一接入控制）、RRCSetupComplete 丢失（上行覆盖差）；随机接入失败在更底层，先用 RA 指标定位再往下钻。
4. **NSA 与 SA 口径不同**：NSA 下"接入"主体在 4G 锚点，NR 侧看的是辅节点添加成功率（SN Addition Success Rate）；SA 才有完整的 RRC/注册/会话建立 KPI 链。

**分析套路**：先看时段分布（忙时拥塞还是突发故障），再分原因值/失败阶段拆分，最后结合 CHR（Call History Record）与信令跟踪定位到具体消息。接入成功率劣化往往和小区退服、PCI 混淆、上行干扰、license/容量参数改动相关。

## 关联考点

- [随机接入失败的综合定位思路（案例向）](../05-关键信令流程/ch05-q039-ra-failure-troubleshooting.md)
- [随机接入的触发场景枚举](../05-关键信令流程/ch05-q006-ra-trigger-scenarios.md)
- [RRC 建立流程与建立原因值](../05-关键信令流程/ch05-q012-rrc-establishment.md)
- 投诉处理案例：无服务/注册失败的排查（ch07-q029）

## 面试追问

- **RRC 建立成功率和随机接入成功率有什么关系？哪个先出问题？** —— 随机接入是 RRC 建立的第一步（L1 过程），RA 失败则连 RRCSetupRequest 都发不出去，表现为 RA 成功率低而 RRC 尝试次数同步下降；若 RA 正常而 RRC 建立差，问题在准入控制/拥塞/覆盖边缘 Msg3 丢包，需要分层定位。
- **为什么同一 UE 重发 RRCSetupRequest 不能重复计入分母？** —— 上行覆盖差时 UE 会多次重发同一请求，若逐条计数，分母虚增、成功率失真；规范做法按 RRC 事务标识去重，取首条作为尝试。
- **NSA 网的"5G 接入"看什么指标？** —— 看 SN Addition 成功率与 NR 侧的测量上报/添加时延，锚点 4G 的 RRC 建立属于 4G 口径；两套指标要分开看，不能混用。
