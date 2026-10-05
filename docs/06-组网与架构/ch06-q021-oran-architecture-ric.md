---
title: O-RAN 架构概览（O-RU/O-DU/O-CU 与 RIC）
chapter: 6
difficulty: 中
frequency: 中
tags: [O-RAN, 开源架构, RIC, 前传]
---

## 一句话答案

O-RAN（Open RAN，开放无线接入网）联盟在 3GPP 逻辑架构基础上，把 gNB 进一步拆为 O-RU（无线单元）、O-DU（分布单元）、O-CU（集中单元），并用开放接口（开放前传、O-F1、开放 F1 等）打破设备厂商黑盒，再引入 RIC（RAN Intelligent Controller，无线智能控制器）实现无线侧的智能化与第三方应用生态。其核心诉求是：接口开放、硬件白盒化、智能闭环。

## 详细展开

**1. 功能拆分与开放接口**

- O-RAN 沿用 3GPP CU/DU/RU 拆分思想，但把接口标准化得更彻底：
  - **开放前传接口**（替代 CPRI 的 eCPRI/7-2x 类分割）：O-RU ↔ O-DU 之间，经 O-Cloud/交换网络，支持更低成本的光模块与灵活的室内外部署。
  - **O-F1**：O-DU ↔ O-CU，对标 3GPP F1 的增强版。
  - **O2 接口**：RIC/SMO（Service Management and Orchestration）对网元的云化管理接口。
- 逻辑关系：O-CU 可进一步分 O-CU-CP/O-CU-UP（与 3GPP 一致）；O-RU 是最靠近天线的实时单元。

**2. 两大 RIC**

| 组件 | 管控对象 | 时延等级 | 承载技术 |
|---|---|---|---|
| Non-RT RIC | 非实时优化（≥1s 量级）：策略、ML 模型训练、网络级编排 | 非实时 | 部署在 SMO 侧，经 O1/O2 下发 |
| Near-RT RIC | 准实时控制（10ms~1s）：波束/调度策略、切换参数优化、QoE 优化 | 准实时 | 部署在边缘云，经 E2 接口连 O-CU/O-DU |

- E2 接口是 Near-RT RIC 与网元间的重要新接口；xApp（部署在 Near-RT RIC 上的应用）与 rApp（Non-RT RIC 上的应用）构成开放应用生态。
- A1 接口：Non-RT RIC → Near-RT RIC 下发策略/意图。

**3. 与 3GPP 架构的关系**

- O-RAN 不改变 3GPP 空口协议与 UE 行为：Uu 口仍然照旧，N2/N3 对核心网的接口也不变——O-RAN 是"设备与网管层"的开放，不是新空口。
- 分割点选择（如 7-2x）决定了前传带宽与时延预算，是 O-RU/O-DU 工程设计的关键。

**4. 价值与挑战**

- 价值：多供应商混搭、降低专用硬件依赖、把 AI/ML 引入无线优化闭环（如 AI 波束管理、节能）。
- 挑战：多厂商互操作集成成本、E2/xApp 生态尚在成熟中、白盒设备的性能与功耗调优、与既有厂商私有优化能力（预编码、算法）的差距。

## 关联考点

- 3GPP 基线：[gNB 逻辑架构：CU/DU 分离的动机与切分点](ch06-q001-gnb-cu-du-split.md)
- 接口细节：[F1 接口与 CU-CP/CU-UP 进一步分离](ch06-q002-f1-cucp-cuup.md)
- 前传工程：[AAU 内部结构与射频拉远](../07-射频与网优/ch07-q002-aau-internal-structure.md)
- AI 方向：[AI/ML 在波束管理中的应用](../03-MIMO与波束管理/ch03-q031-ai-beam-management.md)

## 面试追问

- **O-RAN 和 3GPP 的 CU/DU 分离是什么关系？** —— 要点：O-RAN 复用并扩展了 3GPP 的逻辑拆分（RU/DU/CU），把 3GPP 未强制的开放前传接口（如 7-2x 分割）、E2/A1/O1/O2 管理接口以及 RIC 智能层标准化出来；可以说 3GPP 定义"功能怎么分"，O-RAN 定义"接口怎么开、智能怎么进"。
- **Near-RT RIC 为什么不能管实时调度？** —— 要点：其闭环时延在 10ms~1s 量级，而 MAC 调度/物理层过程要求亚毫秒级确定性，RIC 经 E2 的策略只能指导网元"如何做"（策略参数、决策建议），不能替代实时执行体；真正的实时执行仍在 O-DU 内，RIC 做的是"调节旋钮"。
- **xApp 和 rApp 的区别？** —— 要点：xApp 运行在 Near-RT RIC 上，面向准实时控制（如切换优化、干扰协调），消费 E2 数据；rApp 运行在 Non-RT RIC/SMO 上，面向非实时分析与模型训练，通过 A1 把策略/模型下发给 Near-RT RIC，形成"慢环训模型、快环做决策"的两级智能闭环。

---

*难度提示：中 | 相关规范方向：O-RAN Alliance 架构规范（WG1）、3GPP 38.401（基线拆分）*
