---
title: 连接去激活流程与两侧状态保持
chapter: 5
difficulty: 中
frequency: 低
tags: [去激活, RRC Release, 状态保持]
---

## 一句话答案

连接去激活指网络在业务间隙释放空口专用资源但保留 UE 上下文与核心网连接（N2/PDU 会话）的过程：gNB 发 RRC Release（可带 suspendConfig 让 UE 进入 RRC INACTIVE，或直接回 IDLE），UE 侧保留 AS 安全上下文、密钥与部分承载状态，网络侧保留 UE 上下文以便快速恢复。价值在于"下次业务来时恢复快、信令少"，是状态机在"连接态资源开销"与"空闲态恢复时延"之间的折中设计。

## 详细展开

**1. 两条去激活路径**

| 路径 | 空口消息 | UE 目标状态 | 保留内容 |
|---|---|---|---|
| 释放挂起（suspend） | RRC Release 带 suspendConfig | RRC INACTIVE | AS 安全上下文、UE 非激活态标识（I-RNTI）、RNA 配置、PDCP 状态（部分实现保留） |
| 直接释放 | RRC Release（无 suspend） | RRC IDLE | 仅 NAS 层注册状态（5G-GUTI 等），AS 上下文全清 |

**2. 网络侧状态保持**

- **gNB（最后服务 gNB）**：INACTIVE 路径下保留完整 UE 上下文与 AN 状态，等待 RNA 内其他 gNB 取回（通过 Xn 寻址上下文检索）或 UE 回来；
- **AMF**：无论哪条路径，N2 连接与 PDU 会话上下文都保留（除非走显式的去注册流程），CN 侧"知道"UE 曾在哪个接入网区域；
- **UPF**：PDU 会话的锚点保留，下行数据到达即触发网络侧寻呼（INACTIVE 时经 RAN 寻呼，IDLE 时经 CN 寻呼）。

**3. 恢复侧的差异**

- **INACTIVE 恢复**：UE 发 RRC Resume Request（带 I-RNTI），最后服务 gNB 取回上下文（或从新 gNB 经 Xn 取），跳过完整安全建立（密钥基于恢复参数刷新），快速回到 CONNECTED——信令轮次远少于完整建立；
- **IDLE 恢复**：走完整 RRC 建立 + NAS Service Request/注册更新，时延与信令开销大得多。

**4. 网络为什么需要"去激活"这个动作**

- 无线资源（SR/调度、DRB 配置）是稀缺的，业务突发间隙挂起可释放给其他用户；
- 但完整释放到 IDLE 会让下一次恢复变慢（尤其对物联网小包、即时消息类业务不友好）；
- INACTIVE 态（NR 新增，LTE 没有的状态）正是为这类"间歇小业务"设计的中间态。

## 关联考点

- INACTIVE 态详解：[RRC INACTIVE 与 LTE IDLE 的区别及 RNA 概念](../04-空口协议栈/ch04-q022-rrc-inactive-vs-lte-idle.md)
- 释放挂起流程：[RRC Release with suspend 与进入 INACTIVE](ch05-q017-rrc-release-suspend.md)
- 恢复触发：[Service Request 流程（寻呼响应/上行数据触发）](ch05-q016-service-request.md)

## 面试追问

- **去激活与释放是一回事吗？** —— 要点：不是。释放是空口资源与上下文的清理（可到 IDLE 或 INACTIVE），去激活强调"核心网连接与 UE 上下文保留、仅空口专用资源释放"；严格说 RRC Release with suspend 是实现去激活效果的空口动作，CN 侧 N2/PDU 会话始终未拆除。
- **INACTIVE 下 UE 侧具体保留了什么？** —— 要点：AS 安全上下文与密钥、I-RNTI、RNA（基于 RAN 的通知区域）配置、测量与移动性相关参数、部分 PDCP 状态；这些正是"快速恢复"的资本，也是它与 IDLE 态最本质的区别。
- **什么场景下网络宁愿直接释放到 IDLE？** —— 要点：UE 长时间无业务、终端移动性极强（RNA 更新开销大于收益）、网络上下文资源紧张或调度策略；对 eMBB 大流量用户业务结束后也常直接到 IDLE，INACTIVE 主要服务小包间歇业务。
