---
title: NR 控制面协议栈与 NAS/RRC 的分层关系
chapter: 4
difficulty: 易
frequency: 高
tags: [协议栈, 控制面, RRC, NAS]
---

## 一句话答案

NR 控制面在用户面协议栈（PDCP/RLC/MAC/PHY，无 SDAP）之上增加了 RRC 层，RRC 之上是终结于核心网 AMF 的 NAS（Non-Access Stratum，非接入层）层。RRC 负责空口无线资源管理（广播、寻呼、连接管理、测量配置、承载配置），NAS 负责与接入网无关的核心网事务（注册、鉴权、移动性管理、会话管理），二者分工明确：NAS 消息由 RRC 承载传输，但内容对 gNB 是加密不可读的。

## 详细展开

**控制面协议栈分层**：

| 层 | 终结点 | 职责 |
|---|---|---|
| NAS | UE ↔ AMF（5GC） | 注册/去注册、鉴权、安全模式、移动性管理（MM）、会话管理（SM）、寻呼辅助 |
| RRC | UE ↔ gNB | 系统信息广播、RRC 连接控制（建立/恢复/释放）、承载管理（SRB/DRB 配置）、测量配置与上报、切换命令、安全激活 |
| PDCP | UE ↔ gNB | SRB 上完整性保护 + 加密（SRB 仅完整性保护，不做加密） |
| RLC/MAC/PHY | UE ↔ gNB | 与用户面相同：分段、复用调度、HARQ、编调传输 |

**SRB（Signaling Radio Bearer，信令无线承载）体系**（记忆点：0/1/2/3）：

- **SRB0**：CCCH 上的 RRC 消息（RRC Setup、RRC Reject），不经过 PDCP。
- **SRB1**：RRC 专用信令（可捎带 NAS 消息），加密与完整性保护在安全激活后生效。
- **SRB2**：NAS 专用信令（如会话管理相关），优先级低于 SRB1，安全激活后才能建立。
- **SRB3**：仅 NR 独立组网下、配置了对应能力时使用，用于少量不经过 MN 的 NR 内 RRC 消息（如测量上报、SCG 相关），减少 MN 中转时延。
- NR 还引入了 split SRB：RRC 消息可在 MN 与 SN 两条腿上重复发送，提升双连接下的信令可靠性。

**NAS 与 RRC 的关系要点**：

1. **承载关系**：NAS 消息封装在 RRC 消息（DL Information Transfer / UL Information Transfer）或经由用户面传输（RRC Inactive 下可选 NAS over UP），但 NAS 状态机独立于 RRC 状态机。
2. **安全分层**：NAS 层有自己的完整性保护与加密（终结在 AMF），AS 层安全由 RRC 触发 PDCP 执行——双层安全是 LTE 以来的设计，NR 延续。
3. **状态对应**：RRC Idle/Inactive/Connected 与 CM-Idle/CM-Connected 两个状态机正交管理，例如 RRC Inactive 属于 CM-Connected 下的省电态。

## 关联考点

- [NR 用户面协议栈总览与各层职责](ch04-q001-up-stack-overview.md)
- [PDCP 加密与完整性保护范围（AS 层哪些加密哪些不加密）](ch04-q007-pdcp-ciphering-integrity.md)
- [RRC 状态机与状态转换](ch04-q021-rrc-three-states.md)

## 面试追问

- **为什么 NAS 对 gNB 不可读？** —— NAS 消息在 UE 与 AMF 之间有独立的安全保护，gNB 只做透明转发，这是控制面安全分层设计：接入网被攻破也不泄露核心网信令内容，同时支持接入网与核心网解耦演进。
- **SRB3 的意义是什么？什么场景下才有？** —— SA 组网下减少 RRC 消息经 MN/LTE 中转的开销，让 NR 侧测量上报等消息直达 gNB；EN-DC 中 SRB3 可选存在，仅用于 SN 侧 RRC 过程，切换命令仍走 SRB1。
- **RRC Inactive 和 RRC Idle 的本质区别？** —— Inactive 下 UE 保持 NAS/AS 上下文与安全密钥（可从 Inactive 直接恢复连接），核心网侧仍是 CM-Connected，寻呼由 RAN 与 CN 两侧配合；Idle 下上下文释放，需重新走 RRC 建立与 NAS 注册流程。
