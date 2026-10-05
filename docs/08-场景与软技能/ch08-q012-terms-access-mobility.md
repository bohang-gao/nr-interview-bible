---
title: 高频英文术语中英对照（一）：接入与移动性
chapter: 8
difficulty: 易
frequency: 高
tags: [术语对照, 接入, 移动性]
---

## 一句话答案

接入与移动性是外企/标准组织面试和现网英文文档中术语密度最高的领域之一，高频词分四组：接入流程类（RACH、RAR、Contention Resolution）、移动性事件类（Handover、Measurement Event、Reestablishment）、RRC 状态类（RRC_CONNECTED/INACTIVE/IDLE）、标识类（C-RNTI、TC-RNTI、5G-S-TMSI、RNA）。背熟"全称 + 缩写 + 一句话含义"，做到听到缩写 1 秒内反应出中文。

## 详细展开

**① 接入流程类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| Random Access Channel | RACH | 随机接入信道 |
| Random Access Preamble | — | 随机接入前导 |
| Random Access Response | RAR | 随机接入响应 |
| RACH Occasion | RO | 随机接入时机 |
| Contention-Based Random Access | CBRA | 基于竞争的随机接入 |
| Contention-Free Random Access | CFRA | 免竞争随机接入 |
| Contention Resolution | — | 竞争解决 |
| Timing Advance | TA | 定时提前 |
| Backoff Indicator | BI | 回退指示 |
| Two-step Random Access | — | 两步随机接入（msgA/msgB） |

**② 移动性与测量类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| Handover | HO | 切换 |
| Measurement Gap | — | 测量间隙 |
| Measurement Report | MR | 测量报告 |
| Reference Signal Received Power | RSRP | 参考信号接收功率 |
| Reference Signal Received Quality | RSRQ | 参考信号接收质量 |
| Signal-to-Interference plus Noise Ratio | SINR | 信干噪比 |
| Measurement Event A1~A6 / B1~B2 | — | 测量事件（A 系列服务小区/同频邻区，B 系列异系统） |
| Conditional Handover | CHO | 条件切换 |
| RRC Reestablishment | — | RRC 重建 |
| Radio Link Failure | RLF | 无线链路失败 |
| Beam Failure Detection / Recovery | BFD/BFR | 波束失败检测/恢复 |

**③ RRC 状态与连接管理类**：

| 英文 | 缩写 | 中文规范名 |
|---|---|---|
| RRC_CONNECTED / INACTIVE / IDLE | — | RRC 连接态/非激活态/空闲态 |
| Radio Network Temporary Identifier | RNTI | 无线网络临时标识（前缀分类：C-小区级、TC-临时、RA-随机接入） |
| 5G S-Temporary Mobile Subscription Identity | 5G-S-TMSI | 5G 全球唯一临时标识（寻呼用） |
| RAN-based Notification Area | RNA | 基于 RAN 的通知区（INACTIVE 态移动性范围） |
| Connection Reconfiguration | — | 连接重配置 |
| Suspension / Resume | — | 挂起/恢复（INACTIVE 转换） |

**记忆方法**：按"一次完整移动过程"串记——UE 在 IDLE 收到 Paging（寻呼）→ 发起 RACH → 拿 RAR（TA + TC-RNTI）→ msg4 竞争解决升 C-RNTI → CONNECTED 下测量 Gap 中做 MR → 满足 Event A3 触发 HO → 失败走 RLF → Reestablishment → 闲时 suspend 进 INACTIVE（RNA 移动）→ Resume。能把这条故事线用双语讲顺，比孤立背词表牢固得多。

## 关联考点

- 四步随机接入流程（术语场景）：[CBRA 四步流程](../05-关键信令流程/ch05-q007-cbra-four-step.md)
- 测量事件体系：[A1~A6 事件](../05-关键信令流程/ch05-q020-events-a1-a6.md)
- RRC 三状态：[RRC 状态](../04-空口协议栈/ch04-q021-rrc-three-states.md)
- 切换完整流程：[Xn 切换](../05-关键信令流程/ch05-q023-xn-handover-procedure.md)

## 面试追问

- **C-RNTI、TC-RNTI、RA-RNTI 有什么区别？** —— 要点：RA-RNTI 按 RACH 时机时频位置算出，用于 msg2 盲检（同 RO 的 UE 共享）；TC-RNTI 是 RAR 分配的临时标识，用于 msg3/msg4 阶段；C-RNTI 是小区级正式标识，竞争解决成功后由 TC-RNTI 升级而来，用于后续所有专用调度。
- **RSRP/RSRQ/SINR 各自在什么决策里用？** —— 要点：RSRP 衡量覆盖强度，用于小区选择/重选与切换判决；RSRQ 反映"强度+干扰"的复合质量，用于负载均衡与异频切换；SINR 直接决定可达速率，用于链路自适应评估。三者的英文全称必须能脱口而出。
- **RLF 和切换失败（HOF）是什么关系？** —— 要点：切换失败是 RLF 的常见诱因之一（T310 超时等），RLF 后 UE 走 RRC 重建或回 IDLE；英文场景能说清"HO failure → RLF → reestablishment / fallback"这条链即达标。
