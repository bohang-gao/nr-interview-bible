---
title: QCL Type D 在波束指示中的应用实例
chapter: 3
difficulty: 中
frequency: 高
tags: [QCL, TCI, 波束管理]
---

## 一句话答案

QCL Type D 表示"空间接收参数相同"——UE 应当用接收源参考信号的波束去接收目标信道。典型实例：PDSCH 的 TCI 状态引用一个 CSI-RS 做 Type A（时频估计）、引用一个 SSB 做 Type D（波束），UE 收到 DCI 里的 TCI 码点后，直接把当初测 SSB 时的接收波束拿来收 PDSCH，免去重新扫波束。

## 详细展开

**实例场景**：UE 处于连接态，SSB 突发集中波束 3 最强。gNB 通过 RRC 给 UE 配了 TCI 状态 #5：

```
TCI State #5:
  QCL-TypeA ← CSI-RS resource #12   （提供时延/多普勒估计基准）
  QCL-TypeD ← SSB #3                （提供接收波束方向）
```

**指示与接收过程**：

1. MAC CE 将 TCI 状态 #5 激活为 DCI 码点 2。
2. gNB 在波束 3 方向调度 PDSCH，DCI（1_1）携带 TCI 字段 = 2。
3. UE 解析出状态 #5，按 Type D 关系确定：收 PDSCH 用"收 SSB #3 时的 Rx 波束"。
4. Type A 关系同时告诉 UE：PDSCH DMRS 的定时/频偏/信道估计可沿用 CSI-RS #12 的测量结果。

**上行侧的镜像应用**：gNB 通过 SRI 指示 PUSCH 使用某个 SRS 资源的空间滤波，等于告诉 UE"用发 SRS 的波束发 PUSCH"——TDD 下这就是基于互易性的下行波束选择，与 Type D 指示共同构成收发波束闭环。

**实际价值**：Type D 把"波束选择"问题转化为"参考信号关联"问题，gNB 只需维护 QCL 映射，无需理解 UE 内部波束实现；波束切换由 DCI 逐调度实时完成，时延从 RRC 重配的几十毫秒压缩到毫秒级。

## 关联考点

- [TCI 状态的配置与激活机制](/03-MIMO与波束管理/ch03-q008-tci-activation)
- [QCL 的四种类型及对应参数含义](/03-MIMO与波束管理/ch03-q007-qcl-types)
- [波束失败恢复 BFR 的完整流程](/03-MIMO与波束管理/ch03-q011-bfr-procedure)

## 面试追问

- **一个 TCI 状态为什么常常同时带 Type A 和 Type D 两个源？** —— 两个源分工不同：Type A 源提供时频域信道估计基准（通常选周期 CSI-RS/TRS，波束不一定对准 UE），Type D 源提供波束方向（通常是强覆盖的 SSB 或专用 CSI-RS）；单一信号很难同时是时频基准和最优波束。
- **FR1 的 TCI 状态一般带 Type D 吗？** —— FR1 波束较宽、UE 多为全向接收，很多配置只有 Type A 不含 Type D；Type D 主要服务于模拟波束赋形明显的场景（FR2 终端、FR1 的 64T64R 窄波束赋形下行）。
- **Type D 指示的"波束"如果对端已经变了怎么办？** —— 依赖 L1 测量刷新：UE 持续测量 RSRP，若当前波束质量跌落触发波束失败检测，就走 BFR 流程重新选择并上报候选波束，gNB 更新 TCI 关联。
