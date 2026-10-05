---
title: SRB0–SRB3 的用途与差异
chapter: 4
difficulty: 易
frequency: 高
tags: [RRC, SRB, 信令承载]
---

## 一句话答案

SRB（Signalling Radio Bearer，信令无线承载）共四种：SRB0 专传 RRC 建立前的初始消息（CCCH），SRB1 传 RRC 信令及捎带的 NAS（DCCH），SRB2 传安全激活后的 NAS 信令，SRB3 仅在 NR 双连接/CA 场景用于直传辅节点（SN）的 RRC 信令。核心差异是"传什么、什么时候可用、要不要加密"。

## 详细展开

| SRB | 信道/逻辑信道 | 承载内容 | 可用时机 | RLC 模式 |
|---|---|---|---|---|
| SRB0 | CCCH | RRCSetupRequest / RRCSetup（及恢复/重建请求阶段的对应初始消息复用该机制） | 接入最早期，无安全、无专用配置 | TM |
| SRB1 | DCCH | 全部 RRC 消息 + 捎带（piggyback）的 NAS 消息 | RRC 建立即配，安全激活前也能用 | AM |
| SRB2 | DCCH | 仅 NAS 消息（可捎带少量 RRC，如测量上报相关的容器类消息） | AS 安全激活后（网络在重配置中建立） | AM |
| SRB3 | DCCH | 仅 SN 侧 RRC 消息（测量上报、SN 状态相关等） | EN-DC/双连接配置了 SRB3 后 | AM |

**要点展开**：

1. **SRB0 的特殊性**：此时 UE 没有 C-RNTI 也没有安全上下文，用 TM（透传）模式、无加密无完整性保护，消息里靠随机值/恢复标识区分 UE；接入成功后立即转入 SRB1 交互。
2. **SRB1 vs SRB2 的分工原因**：SRB1 在安全激活前就工作，若 NAS 消息也走 SRB1，则非接入层信令可能在未受 AS 保护的情况下传输；把 NAS 挪到"必须先激活 AS 安全"的 SRB2，就保证了 NAS 消息的空口加密与完整性。例外：极少量 NAS（如注册早期的消息）允许经 SRB1 捎带。
3. **SRB3 的价值**：EN-DC 或 NR-DC 下，SN 侧的测量上报等 RRC 交互不必绕经 MN 转发（走 SRB1 由 MN 处理再转 SN），SRB3 让 UE 与 SN 直接对话，降低时延、简化处理；是否配置由网络决定。
4. **共同点**：SRB1/2/3 均为 AM 模式、均受 AS 安全保护（SRB0 除外）；所有 SRB 不经 SDAP（无 QoS 映射需求）。

## 关联考点

- [NR 控制面协议栈与 NAS/RRC 的分层关系](ch04-q002-cp-stack-nas-rrc.md)
- [RRC 重建的条件、流程与 SRB0 的使用](ch04-q031-rrc-reestablishment-srb0.md)
- [EN-DC 下主节点/辅节点协议栈的差异](ch04-q034-en-dc-mn-sn-stack.md)
- [RRC 三种状态及各状态下的行为差异](ch04-q021-rrc-three-states.md)

## 面试追问

- **为什么 SRB0 用 TM 而 SRB1/2/3 用 AM？** —— SRB0 只有一来一回的初始接入消息，没有重传与按序需求，TM 最简单；SRB1 及以上承载的是不可丢、不可乱序的专用信令，必须 AM 保证可靠。
- **NAS 消息能不能全走 SRB1？** —— 技术上捎带允许少量（主要是注册/服务请求等初始 NAS），但设计上 NAS 应走 SRB2；这是为了确保 NAS 消息都在 AS 安全激活后传输。
- **SRB3 没配置时 SN 侧测量上报怎么走？** —— 走 SRB1 交给 MN，由 MN 处理或经 X2/Xn 接口转发给 SN；SRB3 是性能优化选项而非必需。
