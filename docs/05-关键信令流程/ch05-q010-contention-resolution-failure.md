---
title: 竞争解决失败的表现与定位
chapter: 5
difficulty: 难
frequency: 中
tags: [随机接入, 竞争解决, 故障排查]
---

## 一句话答案

竞争解决失败的典型表现是 UE 在竞争解决定时器（ra-ContentionResolutionTimer）超时前未收到 TC-RNTI 加扰的 msg4，或 msg4 内容与 msg3 不匹配；UE 判定失败后重发 msg1，超过 preambleTransMax 次数则上报 RRC 层，表现为接入失败、RRC 建立请求无响应，最终可能触发无线链路失败（RLF）与重建。

## 详细展开

**1. 失败发生在哪一步**

| 失败点 | 判据 | 信号特征 |
|---|---|---|
| msg1 失败 | 未收到 msg2（RAR） | 基站侧看不到 preamble 解码，或解码但 RAR 覆盖不到 |
| msg3 失败 | msg3 HARQ 重传耗尽仍未成功 | 基站收到 preamble 但无 msg3 解码 |
| msg4 失败（竞争解决失败） | 定时器超时/内容不匹配 | 基站已发 msg4，UE 侧无响应 |

**2. 竞争解决失败的根因**

- **真实冲突**：高负荷小区多个 UE 同时选同一 preamble/RO（大话务、突发并发如地震后批量接入）。
- **覆盖/干扰问题**：msg3 功率不足、上行干扰导致基站解不出或解错 msg3。
- **参数问题**：ra-ResponseWindow 太短、ra-ContentionResolutionTimer 太短、preambleTransMax 过小，弱覆盖 UE 来不及完成流程。
- **msg4 下行丢失**：DL 质量差、PDCCH 聚合度不足、竞争解决 PDSCH 未被 UE 正确接收。
- **msg3 内容冲突**：两个 UE 用同一 NG-5G-S-TMSI（极少见，常因核心网数据异常）。

**3. 定位思路（从计数器入手）**

1. 看基站侧 RACH 尝试次数 vs preamble 解码次数：差值大 → msg1 阶段问题（覆盖/干扰/RACH 资源不足）。
2. 看 RAR 发送 vs msg3 接收：差值大 → msg3 阶段问题（UL 覆盖、TA 异常、功率爬升不够）。
3. 看 msg3 解码 vs msg4 确认（UE 侧 ACK / 基站重传统计）：差值大 → 竞争解决问题（DL 质量或真实冲突）。
4. 结合 UE 侧信令 trace 看 RRCSetupRequest 是否重发、RA 流程终止在哪一步。
5. 现场排查：RACH 资源占比是否够（高负荷要扩 RO）、ssb-PerRACH-OccasionAndCB-PreamblesPerSSB 配置、preamble 目标功率与爬升步长。

## 关联考点

- 四步流程：[CBRA 竞争随机接入四步流程](ch05-q007-cbra-four-step.md)
- RAR 细节：[随机接入响应 RAR 的内容与 UL grant](ch05-q009-rar-content-ul-grant.md)
- 接入控制：[随机接入的触发场景枚举](ch05-q006-ra-trigger-scenarios.md)

## 面试追问

- **怎么区分"真实竞争冲突"和"msg3 解码失败"？** —— 要点：真实冲突时基站能正常解码 msg3，但存在两个 UE 抢同一 preamble——表现为 msg4 发出后一个 UE 确认、另一个无响应；msg3 解码失败则基站根本收不到上行数据，通过 msg3 解码成功率计数器即可区分。
- **大话务场景怎么减少竞争解决失败？** —— 要点：扩展 RACH 资源（增加 RO、增加 CBRA preamble 数）、开启接入限制（ACB/UAC）让部分 UE 延后接入、提高 preambleTransMax 与响应窗，必要时通过 SI 请求引导终端分批接入。
- **UE 竞争解决失败后会立刻重建吗？** —— 要点：不会，先按 backoff 重发 msg1；只有 preambleTransMax 次数耗尽后才进入失败处理——初始接入场景放弃并回 IDLE，连接态场景触发 RLF 走重建流程。
