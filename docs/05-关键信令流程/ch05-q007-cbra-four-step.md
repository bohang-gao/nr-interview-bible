---
title: CBRA 竞争随机接入四步流程（msg1–msg4 细节）
chapter: 5
difficulty: 中
frequency: 高
tags: [随机接入, CBRA, RAR]
---

## 一句话答案

竞争随机接入（CBRA, Contention-Based Random Access）四步：UE 在 RO 上发随机接入前导（msg1），基站回随机接入响应（msg2，含 TA 与上行授权），UE 用临时标识发 RRC 消息（msg3），基站回竞争解决（msg4，给最终 C-RNTI 或回显 UE 内容）；msg4 收到即认为竞争解决成功。

## 详细展开

**msg1：PRACH 前导**

- UE 按 SIB1 的 rach-ConfigCommon 选择 RACH 时机（RO, RACH Occasion）与前导码（preamble index），两者共同指示"哪个波束"。
- 发送时机由 RSRP 强度阈值与 SSB-RO 映射决定，保证网络能反推下行最佳波束。

**msg2：随机接入响应 RAR**

- 在 ra-ResponseWindow 内用 RA-RNTI 盲检 PDCCH，接收对应 PDSCH 上的 MAC RAR。
- 内容：定时提前命令（TA）、上行授权 UL grant、临时 C-RNTI（TC-RNTI）；针对 msgA 场景还有回退指示（BI）。
- 未收到 msg2 则按功率爬升与回退参数重发 msg1。

**msg3：首次调度上行传输（PUSCH）**

- 用 UL grant 发送 CCCH SDU，常见消息：
  - 初始接入：RRCSetupRequest（携带 NG-5G-S-TMSI 或随机值）
  - 重建：RRCReestablishmentRequest
  - INACTIVE 恢复：RRCResumeRequest
- HARQ 初传，支持重传（网络按 TC-RNTI 调度重传）。

**msg4：竞争解决**

- 网络在竞争解决定时器内用 TC-RNTI 加扰 PDCCH 调度 msg4。
- 内容：对 CCCH 场景回显完整 UE 内容（如 RRCSetup），对 C-RNTI 场景直接以 C-RNTI 加扰 PDCCH 即视为解决。
- UE 收到且内容匹配 → 竞争解决成功，TC-RNTI 升级为正式 C-RNTI；msg4 携带 TA 持续生效，后续用专用调度。

**失败处理**：

- 竞争解决定时器超时 / msg4 不匹配 / msg2 超窗：按 preambleTransMax 判断是否放弃，超限后触发 RLF 上报或重建。

## 关联考点

- 触发场景：[随机接入的触发场景枚举](ch05-q006-ra-trigger-scenarios.md)
- RAR 细节：[随机接入响应 RAR 的内容与 UL grant](ch05-q009-rar-content-ul-grant.md)
- 两步接入：[两步随机接入（2-step RA）与四步流程对比](ch05-q011-two-step-ra.md)

## 面试追问

- **竞争解决为什么用"回显内容"而不是直接分配？** —— 要点：两个 UE 可能选了同一 preamble、同一 RO，网络只知"有一个接入者"；msg4 回显 msg3 的完整内容，只有发送者本人能确认"这是回给我的"，未匹配者判定失败并退避。
- **TC-RNTI 和 C-RNTI 的区别？** —— 要点：TC-RNTI 是 msg2 临时分配、只用于 msg3/msg4 阶段；msg4 竞争解决成功后升级为 C-RNTI，用于后续所有专用调度；已有 C-RNTI 的 UE（如切换）msg4 直接用 C-RNTI 加扰即视为解决。
- **如果两个 UE 的 msg3 完全相同怎么办？** —— 要点：此时用 NG-5G-S-TMSI 区分（包含 UE 专属信息）；若连 S-TMSI 都冲突（概率极低），msg4 后 NAS 层仍会因鉴权失败而剔除其中一个。
