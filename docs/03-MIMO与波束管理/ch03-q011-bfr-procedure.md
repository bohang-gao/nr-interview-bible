---
title: 波束失败恢复 BFR 的完整流程
chapter: 3
difficulty: 难
frequency: 中
tags: [波束失败, BFR, 随机接入]
---

## 一句话答案

BFR（Beam Failure Recovery，波束失败恢复）在 BFD 宣布失败后启动：UE 从候选波束中选出高于 qin 门限的最优波束，通过该波束关联的专用随机接入前导（或 PUCCH 上的 BFR 请求）通知 gNB，gNB 回复响应后在新波束上恢复 PDCCH 监听，随后可能触发 RRC 重配更新 TCI 配置。核心是"发现失败 → 找新波束 → 无缝恢复控制面"。

## 详细展开

**完整流程分五步**：

1. **触发**：BFD 计数（连续 qfi_out 次失败指示，默认 10）达到门限，MAC 层宣布波束失败，启动 BFR。
2. **候选选择**：UE 在配置的候选波束参考信号（SSB / 周期 CSI-RS）中测量，选择 L1-RSRP 高于 qin 门限的最优波束；若存在，则该波束关联的专用 PRACH 资源与前导由 RRC 预先配置（CFRA 方式）。
3. **恢复请求（两类方案）**：
   - **基于竞争随机接入（CBRA 载体下的专用前导）**：UE 在候选波束对应的 PRACH occasion 发专用前导，gNB 由前导/时机位置直接得知 UE 选的波束；后续走 4 步 RA 的 msg2/msg4 完成 HARQ 确认与 C-RNTI 竞争解决。
   - **基于 PUCCH 的 BFR-SR**：R16 起引入，UE 在专用 BFR PUCCH 资源发送 SR 携带候选波束信息（多 bit 上行控制信息），gNB 再调度 UL 授权让 UE 报告候选波束索引与恢复原因；时延更低、开销更小。
4. **gNB 响应**：gNB 在所选波束方向（与新候选 QCL）发送响应——RA 方式是 Random Access Response + msg4 PDCCH；PUCCH 方式是调度 PUSCH 接收报告。UE 收到后认为控制面在新波束恢复，清零 BFD 计数。
5. **后续处理**：若候选列表中无合格波束，UE 发不含波束信息的 BFR 请求，gNB 需重新配置测量/TCI；恢复完成后 gNB 可通过 RRC 重配/MAC CE 更新 TCI 状态列表与失败检测资源，指向新波束。

**与 RLF 的关系**：BFR 成功则避免无线链路失败（RLF, Radio Link Failure）；若恢复失败（前导达最大次数或无候选波束且回复超时），走 RLF 流程重建——BFR 是波束级的快速自愈，RLF 是小区级的慢速兜底。

## 关联考点

- [波束失败检测 BFD 与候选波束 CBF 的判定条件](/03-MIMO与波束管理/ch03-q010-bfd-cbf-criteria)
- [TCI 状态的配置与激活机制](/03-MIMO与波束管理/ch03-q008-tci-activation)
- [NR 波束管理整体流程是怎样的？](/03-MIMO与波束管理/ch03-q005-beam-management-flow)

## 面试追问

- **BFR 和 RRC 连接重建是什么关系？会不会都要做？** —— BFR 成功就不需要重建，UE 保持 RRC_CONNECTED 且不丢上下文；只有 BFR 失败（无候选波束且请求无响应）才升级为 RLF，走 RRC 重建。BFR 是"原小区换波束"，重建是"回退重来"。
- **基于 RA 和基于 PUCCH 的两种 BFR 请求各有什么优劣？** —— RA 方式成熟、gNB 定位波束直接（前导时机即波束），但需完整 4 步流程、时延较大且占用 PRACH 资源；PUCCH 方式一次 SR 即可表达候选波束、时延低，但需要预配置 PUCCH 资源且后续仍需一次调度交互。
- **UE 怎么知道用哪个波束收 gNB 的 BFR 响应？** —— UE 发起请求时就已按所选候选波束的方向收听，gNB 的响应（RAR 或调度 PDCCH）会在与候选波束 QCL 关联的波束上发送，双方天然对齐，这正是专用前导按波束预配置的意义。
