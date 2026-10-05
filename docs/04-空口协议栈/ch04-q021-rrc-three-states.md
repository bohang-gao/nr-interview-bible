---
title: RRC 三种状态及各状态下的行为差异
chapter: 4
difficulty: 易
frequency: 高
tags: [RRC, 状态机, 连接管理]
---

## 一句话答案

NR 的 RRC（Radio Resource Control，无线资源控制）状态从 LTE 的两种扩展为三种：RRC_IDLE、RRC_INACTIVE 和 RRC_CONNECTED。IDLE 下 UE 无连接、靠小区重选驻留；CONNECTED 下有完整 RRC 连接可收发数据；INACTIVE 是 NR 新增的中间态，连接被挂起但保留 UE 上下文，省电的同时可快速恢复。

## 详细展开

**三状态对比**：

| 维度 | RRC_IDLE | RRC_INACTIVE | RRC_CONNECTED |
|---|---|---|---|
| UE 上下文 | 核心网/UE 侧无 AS 上下文 | gNB 保留 UE 上下文（挂起） | gNB 保存完整上下文 |
| 标识 | 使用 5G-S-TMSI 等核心网标识 | 使用 I-RNTI 恢复标识 | 使用 C-RNTI |
| 移动性 | 小区重选（UE 自主） | 小区重选为主（RNA 内） | 网络控制切换/重定向 |
| 寻呼 | CN 发起寻呼（5GC 寻呼） | RNA 内寻呼（gNB 发起，RAN paging） | 不需要寻呼，随时可调度 |
| 数据收发 | 不能收发用户数据 | 不能收发用户数据 | 双向收发用户数据 |
| 功耗 | 最低 | 低（介于两者之间） | 最高 |
| 建数据连接 | 需走完整 RRC 建立 + NAS 注册相关流程 | 走 RRC 恢复流程（RRCResume），快 | 已就绪 |

**关键行为细节**：

1. **IDLE**：UE 监听寻呼、读取系统信息、执行测量用于重选；不发送任何专用信号。
2. **INACTIVE**：由 gNB 通过带 suspend 指示的 RRCRelease 进入；UE 在 RNA（RAN-based Notification Area，基于 RAN 的通知区）内移动不通知网络，跨 RNA 或超过周期性 RNAU（RNA Update）定时器才需要更新；网络按 RNA 粒度寻呼。
3. **CONNECTED**：UE 持续监听 PDCCH、上报 CSI、执行测量上报，网络可随时调度上下行。

**状态迁移入口**：开机/注册完成 → IDLE；业务到达 → 建立为 CONNECTED；数据间歇 → 网络释放到 IDLE 或挂起到 INACTIVE；INACTIVE 收到寻呼或发起恢复 → RRCResume 成功回到 CONNECTED，失败则回落 IDLE 重新建立。

## 关联考点

- [RRC INACTIVE 与 LTE IDLE 的区别及 RNA 概念](ch04-q022-rrc-inactive-vs-lte-idle.md)
- [RRC 状态转换流程与涉及信令](ch04-q023-rrc-state-transition-signaling.md)
- [数据到达触发的连接建立全链路（service request 视角）](ch04-q037-service-request-mob-data.md)

## 面试追问

- **INACTIVE 状态下 UE 还需要监听寻呼吗？与 IDLE 监听的有何不同？** —— 需要；INACTIVE 监听的是 gNB 发出的 RAN 寻呼（按 RNA 配置的 DRX），IDLE 监听的是 5GC 发出的 CN 寻呼（按注册区配置），两者寻呼时机计算方式一致但发起实体与覆盖范围不同。
- **为什么说 INACTIVE 是 5G 面向 mMTC/小包业务的"性价比"状态？** —— 大量 IoT/小包终端大部分时间无数据，若留在 CONNECTED 上下文与功耗开销太大，回 IDLE 又要重走注册建立；INACTIVE 折中：保留上下文使恢复只需一次 RRCResume 交互，同时状态功耗接近 IDLE。
