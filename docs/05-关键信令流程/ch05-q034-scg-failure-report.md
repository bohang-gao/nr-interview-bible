---
title: SCG failure 流程与失败信息上报
chapter: 5
difficulty: 中
frequency: 中
tags: [SCG failure, 双连接, 失败上报]
---

## 一句话答案

SCG failure 指 EN-DC/双连接下辅节点侧（SCG/PSCell）发生失败但主节点侧连接仍正常的情况：UE 通过 SRB1（走 MN）上报 SCGFailureInformation，内容含失败类型与相关测量，MN 据此决定释放 SCG、重建 SCG 或触发 SN change。与 MCG failure 的根本区别在于：SCG 失败不触发 RRC 重建立（MCG 还活着），UE 不掉话，NR 侧业务中断但 LTE 侧业务可继续。

## 详细展开

**1. 触发条件（SCG 侧判定失败）**

| 触发 | 说明 |
|---|---|
| SCG 侧 RLF | PSCell 上 T310 超时判定无线链路失败 |
| PSCell 随机接入失败 | 同步重配置后接入 PSCell 失败、波束恢复请求失败 |
| SCG 重配置失败 | 收到含 SCG 配置的 RRC 消息后建立失败 |
| SR 失败 | SCG 侧调度请求达最大次数（如 sr-ProhibitTimer 到期后仍无授权，达 maxSR-Counter） |
| SCG 侧完整性校验失败 | SCG 承载安全校验不通过 |

**2. 上报与处理流程**

1. UE 判定 SCG 失败，**挂起 SCG 侧所有承载**（SCG bearer 停止收发，split bearer 仅 NR 分支停止），启动相应保护定时器；
2. UE 通过 SRB1（MN 侧）发送 **SCGFailureInformation**，携带失败类型与 PSCell 上的最后测量结果（RRC 消息经 MN 转发）；
3. MN 判决处置：
   - **释放 SCG**（SgNB Release）：NR 覆盖不可用，业务回迁 MN 承载；
   - **重建 SCG**（SN change / SN Addition 重来）：换 SN 或重配 PSCell；
   - **保持并等待**：短暂失败场景下等 UE 侧定时器与恢复；
4. 对 UE 的空口配置：MN 经 RRC 重配置删除或重建 SCG 配置，split/SCG bearer 数据路径调整。

**3. 与 MCG failure 的关键差异**

| 维度 | SCG failure | MCG failure |
|---|---|---|
| 失败范围 | 仅辅节点侧 | 主节点侧（整条连接） |
| UE 动作 | 上报 SCGFailureInformation，不重建 | RLF → T311 → RRC 重建立 |
| 业务影响 | NR 分支中断，LTE 分支（MN 承载）继续 | 全部业务中断，需恢复流程 |
| NAS 影响 | 无 | 无（重建成功时），失败则掉话重连 |
| 数据保全 | split bearer 的 MN 分支不受影响 | 依赖前转与 PDCP 状态保留 |

**4. 失败信息的用途**

- SCGFailureInformation 里的测量结果与失败类型供 MN/SN 分析失败根因（覆盖/干扰/参数过严），驱动移动性参数优化（类似 MCG 侧的 MRO）；
- 也可触发网络侧统计与自愈动作（如 SN 故障告警）。

## 关联考点

- SCG 流程总览：[SCG 添加、修改、变更与失败的典型流程](../01-无线基础与演进/ch01-q008-scg-procedures.md)
- SN 释放：[PSCell 修改与辅节点释放流程](ch05-q028-pscell-modify-sn-release.md)
- MCG 侧失败：[无线链路失败 RLF 的判定条件与后续动作](../04-空口协议栈/ch04-q030-rlf-declaration-recovery.md)

## 面试追问

- **SCG failure 为什么不需要重建立？** —— 要点：重建立的目的是恢复 MCG（SRB1/AS 安全）——这些都在 MN 侧且未受影响；SCG 失败只损失 NR 分支资源，MN 可通过常规 RRC 重配置直接增删 SCG，无需走 SRB0 应急流程，业务（MCG/split 的 MN 分支）全程在线。
- **UE 上报 SCGFailureInformation 用的 SRB1 在哪个节点终结？** —— 要点：SRB1 终结在 MN（EN-DC 下 SRB0/1/2 都在 MN），消息经 MN 的 PDCP/RLC 收发；MN 收到后决定本地处理或经 X2/Xn 转给 SN——这也是"SCG 失败由 MN 主导处置"的控制面依据。
- **PSCell 上 SR 失败也算 SCG failure 吗，为什么？** —— 要点：算。SR 持续失败说明 UE 拿不到 SCG 上行授权，SCG 上行链路已实质不可用（可能覆盖差、功率受限或参数错误），继续保留只会浪费资源；把它纳入 SCG failure 触发集合是"上行先死先报"的设计，让 MN 尽快回收 NR 资源。
