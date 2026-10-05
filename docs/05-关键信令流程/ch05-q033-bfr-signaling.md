---
title: 波束失败恢复 BFR 的信令流程
chapter: 5
difficulty: 难
frequency: 中
tags: [BFR, 波束失败, 恢复]
---

## 一句话答案

波束失败恢复（BFR, Beam Failure Recovery）是服务波束质量恶化时 UE 快速换波的应急流程：UE 检测到波束失败（BFD 参考信号低于门限达次数上限）后，在专用 PRACH 资源上向候选波束发波束恢复请求（BFRQ），gNB 通过 DCI 或 CS-RNTI 调度确认后，UE 在指定时机上报候选波束信息，gNB 经 RRC/MAC 层激活新 TCI 状态完成恢复。它发生在"波束级"，若恢复失败才升级为"小区级"处理（随机接入或 RLF）。

## 详细展开

**1. 流程三段式：检测 → 请求 → 恢复**

| 阶段 | 动作 | 关键要素 |
|---|---|---|
| 检测（BFD） | UE 对 BFD-RS（周期 CSI-RS 或 SSB）持续测量，虚拟 DCI 盲检配合；连续 qout 次低于门限 Qout → 判波束失败 | 由 beamFailureInstanceMaxCount 与 Qout_LR 门限控制灵敏度 |
| 请求（BFRQ） | UE 启动 beamFailureRecoveryTimer，在候选波束（CB-RS 集中质量最好的）对应的专用 PRACH 资源发前导码 | 候选波束来自网络配置（SSB 或 CSI-RS 关联的 rach 资源） |
| 响应 | gNB 用专门 RA-RNTI 的 DCI（在 BFR 专用 CORESET/搜索空间）回应；UE 收到后停止定时器，经 PUCCH/PUSCH 上报候选波束标识 | 若配置了 CS-RNTI，gNB 可用 CS-RNTI 调度重传请求消息 |
| 恢复 | gNB 经 MAC CE 激活新 TCI 状态（PDCCH/PDSCH 的接收波束），UE 完成波束对准 | MAC CE 生效有时延要求（数 ms 量级） |

**2. 与随机接入的关系**

- BFRQ 本质是"带专用资源的随机接入"：gNB 为每个候选波束预留专用前导码与 RACH 时机，UE 按波束选资源，隐式告知候选波束——这是 CFRA 思想在波束管理的复用；
- 若未配置专用资源（无 beamFailureRecoveryConfig），UE 退化为发正常随机接入流程（在竞争资源上），gNB 通过其他方式感知。

**3. 失败升级路径**

- beamFailureRecoveryTimer 超时（请求无响应）或前导码发送次数达上限 → 波束恢复失败 → 判定 RLF（T310 超时）→ 走 RRC 重建立；
- 即 BFR 是"小区级失败"前的第一道缓冲：多数瞬时遮挡/波束失配在 BFR 阶段即可恢复，避免掉话。

**4. FR2 与 FR1 的差异**

- FR2（毫米波）波束窄、易遮挡，BFR 价值最大，通常必配；
- FR1 宽波束，波束失败概率低，BFR 常按需配置。

**5. SCG 侧的特殊处理**

- PSCell 波束失败不走 MCG 的 BFR，而是走 SCG failure 信息上报（SCGFailureInformation），由 MN 决定 SCG 重建或释放——两套处理路径不可混淆。

## 关联考点

- 检测判定细节：[波束失败检测 BFD 与候选波束 CBF 的判定条件](../03-MIMO与波束管理/ch03-q010-bfd-cbf-criteria.md)
- 完整恢复流程：[波束失败恢复 BFR 的完整流程](../03-MIMO与波束管理/ch03-q011-bfr-procedure.md)
- SCG 侧失败：[SCG failure 流程与失败信息上报](ch05-q034-scg-failure-report.md)

## 面试追问

- **BFRQ 为什么用专用 PRACH 而不是普通随机接入？** —— 要点：专用资源绑定候选波束（前导码与 SSB/CSI-RS 波束对应），UE 发前导码即隐式上报"我认为这个波束最好"，gNB 从接收资源即可定向用该波束回应，省掉一轮显式上报；且免竞争，响应快、冲突少。
- **BFR 失败为什么会升级为 RLF？** —— 要点：BFR 是波束级的快速自救，前提是小区还有可用参考信号与上行资源；请求无响应说明下行链路或上行授权都不可用，链路已无法在原小区维系，按协议转入 RLF 流程（T310/T311 → 重建立），这是分层失败的兜底设计。
- **BFR 与切换是什么关系，会不会冲突？** —— 要点：两者可并行触发——网络可能正在准备切换，UE 同时在做 BFR；执行顺序上谁先满足谁先生效（BFR 恢复成功则继续原配置等切换命令，切换命令到达则丢弃 BFR 状态）；CHO 场景下若 BFR 失败与条件满足同时发生，以实际执行的为准，协议要求避免并发冲突。
