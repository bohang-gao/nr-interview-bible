---
title: CSI-RS 波束与 SSB 波束的对应关系
chapter: 3
difficulty: 中
frequency: 中
tags: [CSI-RS, SSB, 波束管理]
---

## 一句话答案

SSB 波束是宽的广播波束，负责初始接入与粗粒度波束测量；CSI-RS 波束是窄的业务波束，负责连接态的精细波束测量与 CSI 获取。两者的对应关系通过波束管理建立：UE 先在 SSB 上完成粗选，网络再下发与最优 SSB 波束准共址（QCL）或空间对齐的 CSI-RS 细化测量，报告的波束即业务赋形的依据。接入阶段"锚在 SSB"，连接后"迁移到 CSI-RS"，这是一条从粗到细的波束演进链。

## 详细展开

**分工对比**：

| 维度 | SSB 波束 | CSI-RS 波束 |
|---|---|---|
| 角色 | 接入、广播、粗测量 | 连接态精细测量、CSI/波束报告 |
| 波束宽度 | 宽（覆盖小区面，典型 4/8 个） | 窄（赋形后用户级/波束级） |
| 周期 | 固定周期（默认 20 ms） | 可配置更密或按需（aperiodic） |
| 端口 | 单端口（SSB 内） | 1~32 端口（可复用做多端口测量） |
| UE 状态 | 空闲/连接态都要测 | 主要连接态 |

**建立对应的三种典型方式**：

1. **CSI-RS 与 SSB 准共址（QCL）关联**：网络配置某 CSI-RS 资源与某 SSB 波束 QCL Type D——UE 用接收该 SSB 的同一接收波束去收这个 CSI-RS，等于告诉 UE"这个 CSI-RS 在这个 SSB 波束的方向上"。P1 阶段粗选 SSB 后，gNB 下发与各候选 SSB 关联的 CSI-RS 做 P2 细化。
2. **波束级 CSI-RS 轮发**：gNB 用业务波束权值逐个发送 CSI-RS（波束扫描），UE 上报最优资源索引（CRI, CSI-RS Resource Indicator）+ L1-RSRP，gNB 据此确定赋形方向；这类 CSI-RS 不必与 SSB 一一对应，覆盖"业务波束比 SSB 波束更窄/更多"的场景。
3. **CSI 上报承载对应结果**：报告配置中可同时包含 SSB 资源与 CSI-RS 资源（SSBRI 与 CRI），网络从上报中统一维护"SSB 波束 ↔ CSI-RS 波束 ↔ 用户最佳方向"的映射。

**时序上的衔接**（以典型流程为例）：

1. 初始接入：UE 扫 SSB burst，选最优 SSBRI 发 PRACH（随机接入信道，Physical Random Access Channel），gNB 从 PRACH 时频位置得知用户所选 SSB 波束。
2. RRC 连接后：gNB 按该 SSB 方向配置关联 CSI-RS（P2/P3 细化 + 周期/半持续 CSI-RS 测量）。
3. 业务阶段：调度基于 CSI-RS 反馈（CQI/PMI/CRI），波束指示用 TCI 指向 CSI-RS 或 SSB；SSB 继续负责移动性测量与广播。

**为什么不能只用 SSB**：SSB 波束宽、周期长、开销受限，无法支撑连接态的高精度赋形与快速信道跟踪；为什么不能只用 CSI-RS：接入前网络不知道用户在哪，无法按需赋形下发 CSI-RS，且空闲态移动性必须依赖常开的 SSB。两者是"粗覆盖 + 精跟踪"的互补关系。

## 关联考点

- [SSB 突发集与波束扫描](/02-物理层/ch02-q011-ssb-burst-beam-sweep)
- [CSI-RS 的资源配置与用途](/03-MIMO与波束管理/ch03-q012-csi-type1-type2)
- [QCL Type D 在波束指示中的应用实例](/03-MIMO与波束管理/ch03-q009-qcl-type-d-example)

## 面试追问

- **UE 收到"CSI-RS 与 SSB 3 是 QCL Type D"意味着什么？** —— 意味着该 CSI-RS 与 SSB 波束 3 空间方向一致：UE 可以用接收 SSB 3 时训练好的接收波束去收这个 CSI-RS，不必重新训练；这也隐含业务波束当前与 SSB 3 对齐。
- **随机接入怎么把"用户选中的 SSB 波束"告诉 gNB？** —— 网络把 RO（PRACH 发送时机）与 SSB 波束关联：UE 在其选定 SSB 对应的 RO/前导上发随机接入，gNB 从收到的时频资源与前导编号反推出用户眼中的最佳 SSB 波束，后续信令（Msg2/Msg4）也用该波束方向赋形。
- **连接态还要测 SSB 吗？波束全用 CSI-RS 不行吗？** —— 要测。SSB 承担邻区测量、移动性（同频/异频切换依据）与寻呼/广播接收；CSI-RS 只服务本小区连接态 CSI，邻小区间没有统一的 CSI-RS 测量机制（测量参考是 SSB），所以 SSB 不能省。
