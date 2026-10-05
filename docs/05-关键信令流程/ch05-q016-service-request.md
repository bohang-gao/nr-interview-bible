---
title: Service Request 流程（寻呼响应/上行数据触发）
chapter: 5
difficulty: 中
frequency: 中
tags: [Service Request, 寻呼, 状态迁移]
---

## 一句话答案

Service Request 让处于 CM-IDLE 或 CM-CONNECTED（INACTIVE）的 UE 重新建立 NAS 连接：被叫场景 UE 收寻呼后以 mt-Access 原因做 RRC 建立，上行数据/信令场景以 mo-Data/mo-Signalling 主动发起；NAS 层发 SERVICE REQUEST（用 5G-S-TMSI 或 I-RNTI 标识），AMF 恢复/建立上下文，gNB 随后完成 AS 安全激活与 DRB 建立，用户面打通。

## 详细展开

**1. 两种触发路径**

| 触发 | 起点 | 过程 |
|---|---|---|
| 寻呼响应（被叫） | 网络下行数据到达 → 5GC 寻呼 → RAN 寻呼 → UE 收到 | UE 发 RRCSetup（mt-Access）→ RRCSetupComplete 携带 SERVICE REQUEST（5G-S-TMSI） |
| 上行数据/信令（主叫） | UE 有数据或 NAS 信令要发 | RRC 建立（mo-Data/mo-Signalling）→ 同样在 Complete 中带 SERVICE REQUEST |
| INACTIVE 恢复 | UE 在 RRC_INACTIVE 有数据/被寻呼 | 走 RRCResume 流程（I-RNTI），与 NAS SR 并行或触发 NAS SR |

**2. 信令链（以寻呼响应为例）**

```
UE → RAN : RRCSetupRequest(establishmentCause=mt-Access)
RAN → UE : RRCSetup / UE → RAN : RRCSetupComplete（含 SERVICE REQUEST）
RAN → AMF: Initial UE Message（N2，转发 SERVICE REQUEST）
AMF      : 校验 5G-S-TMSI → 找到 UE 上下文
AMF ⇄ RAN: （可选）鉴权/安全模式
AMF → RAN: Initial Context Setup Request（安全算法、PDU 会话信息、QoS flow）
RAN ⇄ UE : AS 安全激活（AS Security Mode Command）+ RRCReconfiguration（建 SRB2/DRB）
RAN → AMF: Initial Context Setup Response → 用户面隧道建立（N3）
```

- SERVICE REQUEST 可加密完整性保护（NAS 安全已激活时），或用明文 5G-S-TMSI（仅当无有效 NAS 安全时，此时网络需先鉴权）。
- AMF 若判定需要，可回 SERVICE REJECT（如无上下文、鉴权失败）。

**3. INACTIVE 态的差异**

- RRC_INACTIVE 的 UE 先走 RRCResume（AS 层恢复），若 AS 上下文里已带 NAS 传递通道则 NAS SR 可省；触发原因同为被叫寻呼或主叫数据。
- 数据量很小的场景 R17 引入 RRC Inactive 小数据传输（SDT），可在 Resume 消息里直接捎带数据，避免进入 CONNECTED。

**4. 关键点**

- Service Request 是"NAS 连接级"恢复：不重建 PDU 会话，只重建 N3 隧道与空口 DRB。
- 原因值（mt-Access vs mo-Data）沿 RRC 建立原因传递，影响准入与话统。

## 关联考点

- RRC 建立：[RRC 建立流程与建立原因值](ch05-q012-rrc-establishment.md)
- INACTIVE 态：[RRC Release with suspend 与进入 INACTIVE](ch05-q017-rrc-release-suspend.md)
- 注册流程：[NAS 注册流程要点](ch05-q013-nas-registration-flow.md)

## 面试追问

- **被叫 UE 收到寻呼后为什么用 mt-Access 而不是 mo-Data？** —— 要点：establishmentCause 表明"谁发起"——寻呼响应是被网络触发的接入，用 mt-Access；这影响接入控制的优先级分类与话统口径（主叫/被叫区分）。
- **SERVICE REQUEST 放在 RRCSetupComplete 里有什么好处？** —— 要点：省一条独立 NAS 消息，RRC 建立完成的同时就把 NAS 请求带到 AMF，缩短被叫建立时延（寻呼→通话/数据通路少一次往返）。
- **Service Request 和 Registration 有什么区别？** —— 要点：Registration 建立的是"注册上下文"（TAI list、5G-GUTI、签约同步），Service Request 建立的是"连接上下文"（N3 隧道、DRB）；已注册 UE 传数据只需 SR，无需重新注册。
