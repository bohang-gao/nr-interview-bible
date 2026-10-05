---
title: TCI 状态的配置与激活机制（RRC / MAC CE / DCI）
chapter: 3
difficulty: 难
frequency: 高
tags: [TCI, QCL, 波束管理]
---

## 一句话答案

TCI（Transmission Configuration Indicator）状态描述目标信道与参考信号间的 QCL 关系，配置走三级：RRC 配置一长串候选 TCI 状态，MAC CE 从中激活最多 8 个映射到 DCI 字段，DCI 用 TCI 字段实时指示当前用哪个。这样既保证 RRC 灵活性，又让波束切换能跟上调度节奏。

## 详细展开

**为什么要三级机制**：RRC 配置可包含几十个 TCI 状态，但 DCI 中 TCI 字段只有 3 bit（最多 8 个取值），若纯靠 RRC 重配切换波束，时延达几十毫秒级、跟不上动态调度；MAC CE 激活补上"从大池子选 8 个"这一层。

**完整流程**：

1. **RRC 配置**：gNB 通过 RRC 重配为 UE 提供候选 TCI 状态列表，每个 TCI 状态包含 1~2 个 QCL 关系（各含参考信号类型 + 资源 ID + QCL 类型），如 `{QCL Type A → CSI-RS-1, QCL Type D → SSB-3}`。
2. **MAC CE 激活**：TCI States Activation/Deactivation MAC CE 从 RRC 列表中选取至多 8 个状态，映射为 DCI 中 TCI 字段的码点 0~7；对 PDCCH 另有单独的 TCI 状态指示 MAC CE（PDCCH 不靠 DCI 指示自身波束）。
3. **DCI 指示**：下行调度 DCI（DCI 1_1）中的 TCI 字段指示本次 PDSCH 及其 DMRS 使用的 TCI 状态；UE 在应用时延（含激活时延）后按新波束接收。
4. **默认波束机制**：若 DCI 未带 TCI 字段（DCI 1_0 或字段不存在），UE 回退默认规则——通常取最近测得的最优 SSB 或激活带宽内预配置的 TCI 状态。

**上行对应关系**：上行波束不走 TCI，而是通过 SRI（SRS Resource Indicator，SRS 资源指示）指示 SRS 资源与 PUSCH 的空间关系，或由 spatial relation information 配置 PUCCH 发送波束；本质同样是"参考信号 → 波束"的映射。

时序要点：MAC CE 激活后 TCI 状态并非立即生效，UE 需要 3 ms 量级的应用时延（协议规定与子载波间隔相关的时隙数）；期间 gNB 应继续用旧波束调度。

## 关联考点

- [QCL 的四种类型及对应参数含义](/03-MIMO与波束管理/ch03-q007-qcl-types)
- [QCL Type D 在波束指示中的应用实例](/03-MIMO与波束管理/ch03-q009-qcl-type-d-example)
- [NR 波束管理整体流程是怎样的？](/03-MIMO与波束管理/ch03-q005-beam-management-flow)

## 面试追问

- **为什么 MAC CE 只激活 8 个而不是全部？** —— DCI 的 TCI 字段 3 bit 只能编码 8 个码点；把最可能用的 8 个波束放进"热列表"，既压缩 DCI 开销又覆盖绝大多数调度场景，其余状态需要时可再次 MAC CE 更新。
- **MAC CE 激活到生效之间 gNB 怎么办？** —— 协议规定 UE 侧应用时延后新状态才生效；gNB 在此之前应按旧 TCI 调度，网络实现上通常等 ACK 反馈确认 UE 收到 MAC CE 后再切换。
- **PDCCH 的波束是怎么指示的？** —— 不经 DCI（因为 DCI 本身要在正确波束上才能收到），而是用 PDCCH TCI 状态指示 MAC CE 直接激活 CORESET 的 TCI 状态；这也正是波束失败恢复要处理 PDCCH 失败的原因。
