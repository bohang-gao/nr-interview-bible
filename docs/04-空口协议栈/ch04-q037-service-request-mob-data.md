---
title: 数据到达触发的连接建立全链路（service request 视角）
chapter: 4
difficulty: 中
frequency: 高
tags: [服务请求, 连接建立, NAS, 信令流程]
---

## 一句话答案

UE 在 IDLE/INACTIVE 有上行数据要发时，走"Service Request 全链路"：先小区选择/重选驻留，再经 SRB0 发 RRCSetupRequest 建立连接，捎带 NAS Service Request，核心网下发布 DRB 并完成 AS 安全激活，随后数据开始传输；INACTIVE 态则可跳过 NAS 环节直接走 RRCResume 快速恢复。这条链路把 RRC 状态机、SRB、安全、核心网流程全部串起来，是综合题的高频母题。

## 详细展开

**IDLE 起步的全链路（上行数据触发）**：

1. **小区驻留**：UE 完成小区搜索与系统信息读取（SIB1），按 S 准则选择合适小区驻留；已在驻留态则跳过。
2. **RRC 建立**：UE 经 SRB0 发 RRCSetupRequest（建立原因 mo-Data）→ 网络回 RRCSetup 配置 SRB1 → UE 在 SRB1 发 RRCSetupComplete，捎带 NAS 消息。
3. **NAS Service Request**：捎带的或后续发出的 Service Request 通知 AMF 有业务；AMF 鉴权（如需）后向 gNB 下发 INITIAL CONTEXT SETUP REQUEST（含 KgNB、安全能力、QoS 流列表）。
4. **AS 安全激活**：gNB 发 SecurityModeCommand，UE 回 Complete——此后 SRB 受保护。
5. **DRB 建立**：gNB 发 RRCReconfiguration 建立 DRB（按 QoS 流映射），UE 回 Complete；gNB 完成与核心网的用户面打通。
6. **数据传输**：DRB 就绪，UE 触发 BSR/SR 请求上行授权，开始收发数据。

**INACTIVE 起步的捷径**：UE 发 RRCResumeRequest（带 I-RNTI）→ 网络取回上下文回 RRCResume（含安全刷新与 SRB/DRB 恢复）→ UE 发 RRCResumeComplete 即可传数据；NAS 层通常无需介入（CM 仍为 CONNECTED），时延显著低于 IDLE 路径。

**下行数据触发**：数据先到 AMF/gNB → 网络发寻呼（IDLE 按 CN 寻呼、INACTIVE 按 RAN 寻呼）→ UE 收到后按上述对应路径接入（建立原因 mt-Access 或 resume）；这解释了"寻呼响应也是建立流程的一种触发"。

**时延构成（面试量化感）**：IDLE 路径 = 小区接入 + RRC 建立 + NAS 往返 + 安全 + DRB 重配（十毫秒到百毫秒级，视配置）；INACTIVE 路径 = 接入 + 一次 Resume 往返（毫秒到十毫秒级）——这正是 INACTIVE 存在的价值。

## 关联考点

- [RRC 状态转换流程与涉及信令](ch04-q023-rrc-state-transition-signaling.md)
- [NAS 注册流程要点（鉴权/安全模式/注册区域更新）](../05-关键信令流程/ch05-q013-nas-registration-flow.md)
- [AS 安全与 NAS 安全的激活时机与流程](ch04-q027-as-nas-security-activation.md)
- [NR 寻呼机制与 PF/PO 的计算](ch04-q032-nr-paging-pf-po.md)

## 面试追问

- **为什么 Service Request 要尽快触发 AS 安全而不是等 DRB？** —— 安全不激活，后续任何 NAS/DRB 配置都无法受保护传输；先把安全链建立起来，DRB 配置与数据面打通才能安全推进，这是时序上的硬约束。
- **INACTIVE 恢复失败会退化成什么流程？** —— 退化到 IDLE 全链路：网络释放后 UE 回 IDLE，重新走 RRCSetupRequest + NAS Service Request + 安全激活 + DRB 建立；因此恢复失败的业务感知代价接近冷启动。
- **下行触发与上行触发流程的最大区别？** —— 下行多一个寻呼环节且建立原因是 mt-Access，数据在网络上先到（gNB 会缓存等待接入完成）；上行由 UE 主动发起，流程起点就是接入请求。
