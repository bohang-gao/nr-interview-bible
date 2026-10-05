---
title: RRC 状态转换流程与涉及信令
chapter: 4
difficulty: 中
frequency: 中
tags: [RRC, 状态机, 信令流程]
---

## 一句话答案

NR RRC 三状态间的转换由六条 RRC 消息串起来：建立走 RRCSetup/RRCSetupComplete，恢复走 RRCResume/RRCResumeComplete，释放走带 suspendConfig 的 RRCRelease（挂起到 INACTIVE）或不带配置的 RRCRelease（回 IDLE）。其中 RRCSetup 系列在 SRB0 上传初始消息、SRB1 上传后续消息，Resume 系列全程在 SRB1。

## 详细展开

**六条迁移路径**：

| 迁移 | 信令 | 承载 | 触发方 |
|---|---|---|---|
| IDLE → CONNECTED | RRCSetup（SRB0）→ RRCSetupComplete（SRB1） | SRB0/SRB1 | UE 发起 RRCSetupRequest，网络响应 |
| IDLE → INACTIVE（少见，直接挂起） | RRCSetup 后网络在 Setup/Release 中带 suspendConfig | — | 网络决策 |
| CONNECTED → INACTIVE | RRCRelease（带 suspendConfig） | SRB1 | 网络决策（数据间歇） |
| CONNECTED → IDLE | RRCRelease（不带 suspendConfig） | SRB1 | 网络决策（去注册/异常释放） |
| INACTIVE → CONNECTED | RRCResume（网络下发）← UE 发 RRCResumeRequest | SRB1 | UE 收寻呼或上行数据到达/ RNAU |
| INACTIVE → IDLE | 网络在恢复流程中下发 RRCRelease（带/不带 suspend 配置的拒绝处理） | SRB1 | 上下文取回失败等情况 |

**流程要点**：

1. **建立流程**：UE 在 SRB0 上发 RRCSetupRequest（带建立原因：emergency、highPriorityAccess、mt-Access、mo-Signalling、mo-Data 等）→ 网络回 RRCSetup 配置 SRB1 → UE 在 SRB1 发 RRCSetupComplete 并携带 NAS 消息（如注册请求）→ 网络随后下发安全激活与重配置。
2. **恢复流程**：UE 发 RRCResumeRequest（带 I-RNTI 与恢复原因）→ 网络校验上下文后回 RRCResume（重置安全、恢复 SRB1/DRB 配置）→ UE 发 RRCResumeComplete（可携带 NAS 消息）。恢复成功后默认安全已基于恢复密钥重新激活。
3. **挂起语义**：RRCRelease 中的 suspendConfig 包含 RNA 配置与 I-RNTI，UE 据此进入 INACTIVE；后续重选过程中任何恢复尝试都以该 I-RNTI 为凭据。

**与 LTE 的对照**：LTE 只有 Setup/Release 一套（两状态），NR 多出的 Resume 对与 suspend 指示是 INACTIVE 的实现载体；NR 建立原因值新增 mt-Access（移动终接接入）对应被叫/寻呼响应场景。

## 关联考点

- [RRC 三种状态及各状态下的行为差异](ch04-q021-rrc-three-states.md)
- [RRC INACTIVE 与 LTE IDLE 的区别及 RNA 概念](ch04-q022-rrc-inactive-vs-lte-idle.md)
- [RRC 建立流程与建立原因值](../05-关键信令流程/ch05-q012-rrc-establishment.md)
- [RRC 重建的条件、流程与 SRB0 的使用](ch04-q031-rrc-reestablishment-srb0.md)

## 面试追问

- **RRCSetupComplete 里带什么？为什么要带 NAS 消息？** —— 带选中的 PLMN/注册区信息与上行 NAS 传递（如 Registration request）； piggyback 的目的是让 NAS 注册流程与 AS 建立并行推进，减少总时延。
- **INACTIVE 恢复时网络为什么能一次消息就把安全激活了？** —— 因为上下文（含密钥层级与 AS 安全算法）在挂起时已保留，恢复消息基于恢复推导的密钥做完整性保护，UE 验证通过即视为安全已激活，省去单独的 SecurityModeCommand 轮次。
- **从 CONNECTED 直接挂起到 INACTIVE，核心网知道吗？** —— 知道：gNB 挂起时会通过 NGAP 指示 UE 进入 CM-CONNECTED with RRC INACTIVE 状态，N2 连接保持，因此下行数据仍能到达 gNB，由 gNB 缓存并发起 RAN 寻呼。
