---
title: EN-DC 中控制面与用户面的走向（锚点与承载分拆）
chapter: 1
difficulty: 中
frequency: 高
tags: [EN-DC, 控制面, 用户面, 承载]
---

## 一句话答案

EN-DC 下控制面全部锚定在 LTE：终端唯一的一条 RRC 连接终结在 MeNB，MME 只认识 MeNB，SgNB 的 NR RRC 消息经 MeNB 以容器方式透传。用户面锚点在 S-GW，按承载类型决定走向：只走 LTE、只走 NR，或在 PDCP 层分拆后同时走两侧。

## 详细展开

**控制面走向**（自上而下）：

1. 终端 ↔ MeNB：唯一一条 LTE RRC 连接，NAS（非接入层）消息也经 MeNB 送达 MME。
2. MeNB ↔ SgNB：X2-C 上的 SgNB 添加/修改/释放流程；SgNB 需要给终端下发 NR RRC 消息时（如 NR 专用配置），消息封装在 SgNB 产生的容器里，由 MeNB 转发；反之终端的 NR 测量报告由 MeNB 接收后再决定是否转发给 SgNB。
3. MeNB ↔ MME：S1-MME 终结点，S1AP 流程（如 E-RAB 修改）由 MeNB 与 MME 交互，SgNB 对核心网控制面"不可见"。

**用户面走向**（核心网 S-GW 为总锚点）：

| 承载类型 | S-GW 数据去向 | 空口走向 | 分拆点 |
|---|---|---|---|
| MCG bearer | MeNB | 只走 LTE（MeNB） | 无 |
| SCG bearer | 直连 SgNB（S1-U） | 只走 NR（SgNB） | 无 |
| split bearer | MeNB | MeNB PDCP 分拆 → LTE + NR 同时走 | MeNB PDCP |

两条典型数据路径：

- **Option 3a/3x 下的 SCG bearer**：S-GW →（S1-U 直连）→ SgNB → NR 空口，不经 MeNB。
- **Option 3/3x 下的 split bearer**：S-GW → MeNB PDCP → 分成 LTE PDCP PDU 与经 X2-U 到 SgNB 的 NR 部分；Option 3x 中 gNB 承担主要分流处理。

**关键理解点**：

1. PDCP 层是分拆发生的地方——split bearer 在 MeNB 的 LTE PDCP（严格说是锚点侧 PDCP）做复制/分发；NR 侧与 LTE 侧各自有独立的 RLC/MAC/PHY。
2. 上行方向对称存在：终端侧 split bearer 的上行数据在 PDCP 层按网络指示（如数据量、缓存状态）决定发往哪个节点，或在 SCG 失联时把数据切换回 MCG 侧保障连续性。
3. 承载类型可在 SgNB 添加/修改时由网络决定并动态调整（如从 SCG bearer 改为 split bearer），对核心网表现为 E-RAB 修改。

## 关联考点

- EN-DC 整体架构：[EN-DC 架构](./ch01-q005-en-dc-architecture.md)
- MCG/SCG/split bearer 的选择：[承载类型](./ch01-q007-bearer-types.md)
- Option 3/3a/3x 的用户面差异：[部署选项](./ch01-q004-deployment-options.md)

## 面试追问

- **split bearer 的上行分流由谁决定？** —— 要点：终端在 PDCP/MAC 层依据网络配置（含各节点无线状况、缓存）决定上行发往 MeNB 还是 SgNB；下行分流由 MeNB PDCP 决定，两者不对称。
- **SgNB 失联时用户面业务会中断吗？** —— 要点：取决于承载类型——SCG bearer 上的业务中断，split/MCG bearer 可继续走 LTE；网络可在 SCG 失败流程中把数据从 NR 侧回退到 LTE 侧，保证 MCG bearer 业务连续。
- **NR RRC 消息为什么不能由 SgNB 直接发给终端？** —— 要点：终端只有一条 RRC 连接且加密锚在 MeNB（密钥体系由 MME→MeNB 派生），SgNB 无独立 RRC 通道；经 MeNB 转发既统一了控制权威，也复用了 LTE 的安全与重传机制。
