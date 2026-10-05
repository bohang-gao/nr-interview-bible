---
title: CFRA 免竞争随机接入与使用场景（切换/波束恢复）
chapter: 5
difficulty: 中
frequency: 中
tags: [随机接入, CFRA, 切换]
---

## 一句话答案

免竞争随机接入（CFRA, Contention-Free Random Access）由网络预先给 UE 分配专用 preamble，UE 发出后直接在 msg2 拿到 TA 与确认，无需 msg3/msg4 竞争解决；典型场景是切换、SCG 添加/变更和波束失败恢复——这些场景网络已知 UE 身份，可以"点名"接入。

## 详细展开

**与 CBRA 的差异**：

| 维度 | CFRA | CBRA |
|---|---|---|
| preamble 来源 | 网络专用分配（RRC 信令/DCI） | UE 从公共池随机选 |
| 流程 | msg1 → msg2 即完成 | msg1 → msg2 → msg3 → msg4 |
| 竞争风险 | 无（专用资源） | 有（需竞争解决） |
| 时延 | 低 | 高（多两步 + 重传可能） |
| 典型场景 | 切换、SCG、BFR、SI 请求（部分配置） | 初始接入、重建、失同步数据到达 |

**典型场景展开**：

1. **切换**：源 gNB 向目标 gNB 发切换请求，目标 gNB 在 HANDOVER COMMAND 中携带专用 RACH 资源（rach-OccasionAndPreambleIndex 等）；UE 收到 RRCRelease/切换命令后在目标小区发送专用 preamble，msg2 带 TA，切换即完成上行同步。
2. **SCG 添加/变更**（EN-DC / NR-DC）：主节点为 UE 在 SCG 小区申请专用 preamble，SCG MAC 层完成接入后通知 MCG。
3. **波束失败恢复（BFR）**：UE 检测到波束失败（BFD）后，在 candidate beam list 中选一个质量达标的候选波束，发送与该波束关联的专用 preamble；gNB 以 C-RNTI 加扰 PDCCH 回应即恢复成功。
4. **on-demand SI 请求**：SIB1 中 si-RequestConfig 若配置专用 preamble，UE 发送后网络把 SI 置为广播。

**要点**：

- CFRA 失败会回落 CBRA（如专用 preamble 失效、波束又变了），回落机制保证鲁棒性。
- DCI 1_0 / PDCCH order 也可触发 CFRA（网络主动"点名"UE 做接入，常用于 TA 校正）。

## 关联考点

- 竞争流程：[CBRA 竞争随机接入四步流程](ch05-q007-cbra-four-step.md)
- 触发场景：[随机接入的触发场景枚举](ch05-q006-ra-trigger-scenarios.md)
- 切换流程：[测量配置三要素与测量 GAP](ch05-q019-meas-config-gap.md)

## 面试追问

- **CFRA 为什么没有竞争解决步骤？** —— 要点：专用 preamble 只有该 UE 使用，网络收到即知身份，msg2 直接以 C-RNTI 加扰 PDCCH 携带 TA 与授权，无需 msg3/msg4 确认。
- **波束恢复用 CFRA 的前提是什么？** —— 要点：网络需提前通过 RRC 配置 candidateBeamList，把候选波束（SSB/CSI-RS）与专用 preamble 关联；UE 在质量达标的候选波束上发对应 preamble，网络由此知道"往哪个波束调度 UE"。
- **CFRA 失败会怎样？** —— 要点：专用 preamble 无效或 msg2 超时后，UE 回退到 CBRA（用公共池资源）；若 CBRA 也超限（preambleTransMax），触发 RLF 走重建。
