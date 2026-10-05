---
title: RRC 重建的条件、流程与 SRB0 的使用
chapter: 4
difficulty: 中
frequency: 高
tags: [RRC, 重建, SRB0]
---

## 一句话答案

RRC 重建（RRC Re-establishment）用于连接态链路突然失效后"带上下文快速恢复"，触发条件包括 RLF、切换失败、完整性保护失败等；UE 向选定小区发 RRCReestablishmentRequest——这条消息与初始接入一样走 SRB0/CCCH，成功后回到 SRB1 继续流程。重建的前提是网络能取回 UE 上下文且消息完整性校验通过，否则 UE 被释放回 IDLE。

## 详细展开

**触发条件**（UE 侧发起）：

1. RLF 判定成立（T310 超时、随机接入问题、RLC 最大重传）。
2. 切换失败：T304 超时（未能在目标小区完成随机接入与重配完成）、目标小区接入失败、切换命令完整性校验失败。
3. 收到的专用信令完整性保护校验失败（疑似伪造/密钥错）。
4. （NR 特有）从 INACTIVE 恢复失败时网络可能引导 UE 回落重建或 IDLE。

**流程分解**：

| 步骤 | 消息 | 信道/承载 | 说明 |
|---|---|---|---|
| 1 | UE 发 RRCReestablishmentRequest | SRB0 / CCCH | 携带旧 C-RNTI 与源小区 PCI（用于网络定位上下文）、重建原因 |
| 2 | 网络回 RRCReestablishment | SRB1 / DCCH | 恢复 SRB1 并重启 AS 安全（用刷新后的密钥），暂停所有 DRB |
| 3 | UE 回 RRCReestablishmentComplete | SRB1 / DCCH | 受新安全保护 |
| 4 | 网络下发 RRCReconfiguration | SRB1 | 重建 SRB2/DRB、恢复测量配置，数据面随后恢复 |

**关键判定点**：目标小区（含源小区本身）必须能通过 {C-RNTI, PCI} 找到 UE 上下文——同一 gNB 站内必然可行；跨站需此前经过 Xn/切换准备或在同一 CU 下。找不到上下文或完整性校验失败 → 网络回 RRCRelease，UE 回 IDLE 重走建立。

**为什么走 SRB0**：重建请求发出的时刻 UE 已丢失专用资源与同步（否则不必重建），只能像初始接入一样先用 CCCH 让网络"认识"自己；一旦网络接受并恢复 SRB1，后续立即回到受保护的 DCCH。这也解释了重建请求本身虽走 SRB0 明文信道，但网络必须用密钥对上下文做校验——UE 会携带受保护信息供验证，防伪造。

**与 Resume 的区别**：重建恢复的是"连接态异常中断"（CONNECTED 内的自愈，用户面很快回来）；Resume 恢复的是"挂起状态"（INACTIVE → CONNECTED 的正常路径，含密钥推导与安全重启）。

## 关联考点

- [无线链路失败 RLF 的判定条件与后续动作](ch04-q030-rlf-declaration-recovery.md)
- [SRB0–SRB3 的用途与差异](ch04-q024-srb0-to-srb3.md)
- [切换中的密钥更新（KgNB 刷新与水平/垂直推导）](ch04-q028-handover-key-update.md)
- [关键计时器 T300/T301/T310/T311 的作用](ch04-q029-timers-t300-t311.md)

## 面试追问

- **重建成功后 DRB 数据为什么不会立即恢复？** —— 重建流程只恢复 SRB1 与安全，DRB 要等后续 RRCReconfiguration 重建（含 PDCP/RLC 实体重配），期间数据由网络侧缓存/前转，保证连续性。
- **重建请求里为什么带源小区 PCI？** —— {旧 C-RNTI + 源 PCI} 是定位上下文的钥匙：目标小区据此判断上下文在本站还是邻站（可经 Xn/NG 取回），带错或带不出就无法恢复。
- **什么情况下重建必然失败？** —— 典型如 RLF 后跨到无准备邻站（无上下文）、密钥链断裂（NCC 不一致且无法回溯）、以及安全校验失败；这些场景网络直接释放让 UE 回 IDLE 是设计使然，避免用不安全或残缺的上下文续传。
