---
title: F1 接口与 CU-CP/CU-UP 进一步分离
chapter: 6
difficulty: 中
frequency: 中
tags: [F1, CU/DU, 控制面用户面分离]
---

## 一句话答案

F1 是 CU 与 DU 之间的逻辑接口，分为控制面 F1-C（承载 NGAP 类似的应用协议 F1AP）与用户面 F1-U（GTP-U 隧道）。3GPP 进一步把 CU 拆成控制面部分（CU-CP）与用户面部分（CU-UP），二者之间通过 E1 接口互联，实现控制面与用户面的独立扩展与容灾。

## 详细展开

**1. F1 接口**

- **F1-C**：基于 SCTP，承载 F1AP，负责 UE 上下文管理（上下文建立/修改/释放）、RRC 消息传递（DU 与 CU-CP 之间透传 RRC）、系统信息调度、寻呼、测量报告转发等。
- **F1-U**：基于 GTP-U/UDP，承载用户数据隧道；PDCP 在 CU、RLC 在 DU，所以 F1-U 传递的是 PDCP PDU。
- 特点：RRC 在 CU，DU 只做 RRC 的中转与部分信令（如小区配置）；F1 支持无状态化设计，UE 上下文可在 CU 与 DU 间建立/删除。

**2. CU 内部进一步分离：CU-CP 与 CU-UP**

一个 gNB-CU-CP 可连接多个 gNB-CU-UP（1:N），一个 CU-UP 可服务多个 CU-CP 与多个 DU（M:N）。

| 节点 | 承载协议 | 接口 |
|---|---|---|
| CU-CP | RRC、PDCP-C（控制面） | F1-C（对 DU）、NG-C（对 AMF）、Xn-C |
| CU-UP | SDAP、PDCP-U（用户面） | F1-U（对 DU）、NG-U（对 UPF）、Xn-U |
| CU-CP ↔ CU-UP | — | E1（承载 E1AP，承载上下文管理） |

**3. 分离带来的好处**

- **独立扩容**：用户面（流量驱动）与控制面（信令驱动）资源需求不同，可分别弹性伸缩。
- **容灾与池化**：CU-UP 可池化部署，故障影响面小；CU-CP 故障影响控制信令，需重点保障。
- **灵活选路**：核心网侧用户面锚点不变时，可独立更换 CU-UP，减少切换时数据中断。

## 关联考点

- 上一级架构：[gNB 逻辑架构：CU/DU 分离的动机与切分点](ch06-q001-gnb-cu-du-split.md)
- NG 与 Xn 接口：[N2/N3/Xn 接口的作用与协议栈](ch06-q007-ng-n3-xn-interfaces.md)
- 切换中 CU-UP 更换：[NG 接口切换与 Xn 切换的差异](../05-关键信令流程/ch05-q024-ng-vs-xn-handover.md)

## 面试追问

- **E1 接口上传送什么？** —— 要点：E1AP 消息，核心是承载上下文管理（Bearer Context Setup/Modification/Release），CU-CP 通过它指示 CU-UP 建立/修改/释放 SDAP 与 PDCP-U 实体及对应隧道；还有 gNB-CU-UP 配置更新、测量信息交互等。
- **CU-CP 与 CU-UP 分离后，切换流程有什么变化？** —— 要点：Xn/NG 切换中，源与目标可以是不同 CU-UP；CU-CP 负责信令决策与上下文协调，CU-UP 只负责数据面，路径切换（如 UPF 侧隧道端点更新）由 CU-CP 经 NGAP 触发，数据中断更短。
- **F1-U 上跑的是 PDCP PDU 还是 RLC PDU？** —— 要点：PDCP PDU。因为 PDCP 在 CU、RLC 在 DU，DU 的 RLC 从 F1-U 收到 PDCP PDU 后再加 RLC/MAC 头；这也决定了加密（PDCP 层）在 CU 完成。

---

*难度提示：中 | 相关规范方向：38.460 系列（F1AP/F1-U）、38.463（E1AP）*
