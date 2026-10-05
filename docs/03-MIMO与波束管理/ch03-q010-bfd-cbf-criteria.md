---
title: 波束失败检测 BFD 与候选波束 CBF 的判定条件
chapter: 3
difficulty: 难
frequency: 中
tags: [波束失败, BFR]
---

## 一句话答案

波束失败检测（BFD, Beam Failure Detection）的判据是：对当前 PDCCH 波束关联的周期 CSI-RS/SSB 做 L1-RSRP 测量，若低于门限（qout，对应假设 PDCCH BLER 10%），则该测量机会记一次"失败指示"；连续 qfi_out 个失败指示（默认 10 个）且中间无成功指示，即宣布波束失败。候选波束（CBF, Candidate Beam Finding）则是在同一测量中选 RSRP 高于 qin 门限（假设 BLER 2%）的 SSB/CSI-RS 作为恢复用的备选。

## 详细展开

**为什么要基于"假设 PDCCH 质量"**：PDCCH 是控制面的生命线，PDCCH 收不到则一切调度失效。直接统计 PDCCH 盲检失败会误判（DCI 本来就可能没发），因此协议用与 PDCCH 波束 QCL 的参考信号质量作为代理指标——L1-RSRP 低于 qout 门限等价于该波束上 PDCCH 误块率（BLER, Block Error Rate）劣化到 10%。

**BFD 判定流程**：

1. gNB 通过 RRC 配置失败检测资源：与服务 PDCCH 波束 QCL 关联的周期 CSI-RS（或 SSB），以及门限 RSRP-Threshold-qout-qfi。
2. UE 按配置周期测量 L1-RSRP：低于 qout 门限 → 向 MAC 层发一次 Beam Failure Instance 指示；高于门限 → 发成功指示。
3. MAC 层维护计数器：收到失败指示计数 +1（上限 qfi_out，网络可配，默认 10）；收到成功指示计数清零。
4. 计数达到 qfi_out → 宣布波束失败（Beam Failure Detected），触发波束失败恢复（BFR）。

**CBF 判定条件**：UE 在同一阶段对候选波束列表（SSB 或 CSI-RS，可含小区间资源）测量，筛选标准是 L1-RSRP ≥ qin 门限（RSRP-Threshold-qin-qfi，对应假设 PDCCH BLER 2%）且该波束与失败检测资源的空间 QCL 不冲突；从满足条件的波束中选最优作为恢复候选。

| 参数 | 门限语义 | 典型配置 |
|---|---|---|
| qout | 假设 PDCCH BLER 10%（失败判定） | RSRP 绝对门限，网络配置 |
| qin | 假设 PDCCH BLER 2%（候选合格线） | 通常高于 qout 若干 dB |
| qfi_out | 连续失败指示次数（默认 10） | MAC 计数器上限 |

设计意图：qout/qin 双门限带迟滞（qin > qout），避免在门限附近反复触发恢复。

## 关联考点

- [波束失败恢复 BFR 的完整流程](/03-MIMO与波束管理/ch03-q011-bfr-procedure)
- [QCL Type D 在波束指示中的应用实例](/03-MIMO与波束管理/ch03-q009-qcl-type-d-example)

## 面试追问

- **为什么用 L1-RSRP 而不直接统计 PDCCH 误块率？** —— RSRP 是无歧义的物理层测量，成本低、周期固定；PDCCH 是否漏检无法直接观测（UE 不知道是否有发给自己的 DCI），用与 PDCCH 同波束的参考信号质量做代理更可靠。
- **失败计数为什么要有"成功即清零"机制？** —— 短时衰落（快衰落、瞬时遮挡）会造成偶发失败指示，若不清零会累积误触发；成功指示说明波束仍可用，清零实现"持续劣化才触发"的滑窗效果。
- **如果所有候选波束都低于 qin 门限怎么办？** —— UE 发起不含候选波束的 BFR 请求（随机接入方式不指定前导），gNB 收到后自行重新配置波束测量/TCI，相当于回到 P1 重新做波束建立。
