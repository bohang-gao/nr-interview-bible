---
title: N2/N3/Xn 接口的作用与协议栈
chapter: 6
difficulty: 中
frequency: 高
tags: [N2, N3, Xn, 接口协议栈]
---

## 一句话答案

N2 是 gNB 与 AMF 之间承载 NGAP 信令的控制面接口（对应 LTE 的 S1-MME）；N3 是 gNB 与 UPF 之间的用户面接口，跑 GTP-U 隧道（对应 S1-U）；Xn 是 gNB 与 gNB 之间的接口，同时承载信令（XnAP）与数据前转/用户面（Xn-U），支撑站间切换与双连接。三者构成 NG-RAN 对外的主要连接。

## 详细展开

**1. 三接口对比**

| 接口 | 两端 | 面向 | 协议栈（承载层以上） | 主要功能 |
|---|---|---|---|---|
| N2 | gNB ↔ AMF | 控制面 | NGAP over SCTP | UE 上下文管理、PDU 会话资源管理、切换信令、寻呼、NAS 透传 |
| N3 | gNB ↔ UPF | 用户面 | GTP-U over UDP/IP | 承载 PDU 会话用户数据（上行分类/下行转发） |
| Xn | NG-RAN 节点 ↔ NG-RAN 节点 | 控制面+用户面 | XnAP over SCTP（Xn-C）；GTP-U over UDP（Xn-U） | 站间切换（含数据前转）、上下文获取、双连接（EN-DC/NGEN-DC 中 MN↔SN 的 X2/Xn） |

**2. 协议栈细节**

- **N2/NGAP**：SCTP 保障信令可靠有序；NGAP 消息分 UE 相关（UE Context Setup/Modification/Release、PDU Session Resource Setup 等）与非 UE 相关（NG Setup、Error Indication、寻呼）。NAS 消息在 N2 上只是"透传包裹"，逻辑上属于 N1（UE↔AMF）。
- **N3/GTP-U**：每个 QoS flow 到 DRB 映射后，gNB 与 UPF 之间按 PDU 会话建 GTP-U 隧道，TEID 标识隧道端点；QoS flow 级别的标记（QFI）封装在 GTP-U 扩展头中。
- **Xn**：控制面 Xn-C（SCTP）+ 用户面 Xn-U（UDP/GTP-U）。切换时源站经 Xn-U 前转未确认数据，减少丢包；XnAP 的 Xn Setup 过程交互小区信息，实现 ANR 式自动邻区建立的基础。

**3. 与 LTE 接口的对应**

| LTE | NR | 变化点 |
|---|---|---|
| S1-MME | N2 | MME→AMF，会话管理信息由 AMF 中转给 SMF |
| S1-U | N3 | SGW→UPF，可直接对接分布式 UPF |
| X2 | Xn | 功能类似，增加 EN-DC 场景兼容（Xn 兼容部分 X2 流程） |

## 关联考点

- Xn 切换流程：[Xn 接口切换的完整流程](../05-关键信令流程/ch05-q023-xn-handover-procedure.md)
- NG 与 Xn 切换对比：[NG 接口切换与 Xn 切换的差异](../05-关键信令流程/ch05-q024-ng-vs-xn-handover.md)
- QFI 与 QoS 映射：[QoS flow、DRB、PDU session 的层级关系](ch06-q013-qos-flow-drb-session.md)

## 面试追问

- **N2 和 N3 为什么要分开？** —— 要点：控制面与用户面分离（CUPS）的结果。信令归 AMF、数据归 UPF，用户面可以按需下沉扩容而不牵动信令网；4G 的 S1-MME/S1-U 也是分离的，但 5G 中 UPF 数量与位置更灵活，解耦价值更大。
- **Xn 切换和 NG 切换数据面有什么不同？** —— 要点：Xn 切换期间源 gNB 直接经 Xn-U 向目标 gNB 前转数据，路径切换（UPF 侧隧道改向）在 UE 接入目标小区后进行，中断更短；NG 切换数据前转经核心网中转（源 gNB→UPF→目标 gNB），信令也经 AMF，时延略高但适用于无 Xn 或跨 AMF 场景。
- **NG Setup（N2 上第一条非 UE 消息）交互什么信息？** —— 要点：gNB 向 AMF 上报全局标识（PLMN、gNB ID）、支持的 TAI/切片（S-NSSAI）列表，AMF 回复可用 PLMN/切片信息；这是基站"入网登记"，让 AMF 知道该 gNB 覆盖哪些 TA、支持哪些切片。

---

*难度提示：中 | 相关规范方向：38.413（NGAP）、38.423（XnAP）、29.281（GTP-U）*
