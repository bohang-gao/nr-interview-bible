---
title: NSA 语音方案：EPS fallback 与 VoLTE 的关系
chapter: 1
difficulty: 中
frequency: 高
tags: [NSA, 语音, VoLTE, EPS fallback]
---

## 一句话答案

NSA（EN-DC）下语音只能走 LTE 的 VoLTE（Voice over LTE）——因为 EPC 不支持 5GC 的 5QI 语音承载框架，NR 侧不承载 IMS 语音。所谓 EPS fallback（回落到 4G）本质是 SA 时代的概念：SA 终端在 NR 上发起 VoNR 前若网络尚不支持 VoNR，就回落到 LTE 用 VoLTE 打电话。因此 NSA 阶段"语音 = VoLTE"，EPS fallback 是 SA 与 VoNR 之间的过渡桥。

## 详细展开

**1. NSA 下语音为什么只能是 VoLTE**

- NSA 核心网是 EPC，语音由 IMS（IP 多媒体子系统）通过 QCI=1 专用承载承载，整个体系定义在 LTE/EPC 框架内。
- NSA 的控制面锚在 MeNB，终端的 IMS 信令天然走 LTE；NR（SgNB）只是用户面加速器，没有为 IMS 语音建立专用 QCI 承载的机制。
- 结论：NSA 终端打电话时，数据业务可继续走 EN-DC，语音本身始终是 VoLTE（LTE 空口 + EPC + IMS）。

**2. EPS fallback 是什么、属于谁**

- EPS fallback 是 **SA 组网下的过渡语音方案**：SA 终端在 5G（NR+5GC）上建立 IMS 语音时，若网络暂未开通 VoNR（或终端在 NR 弱覆盖），网络发起向 4G 的重定向或切换，终端回落到 LTE 后以 VoLTE 完成通话。
- 流程概要：终端在 NR 发起 IMS 会话 → 5GC/网络判断需回落 → 触发 NGAP/RRC 层面的切换（handover）或重定向（release with redirect，可能带测量的重定向）到 LTE → 终端在 LTE 重新注册并建立 VoLTE 承载 → 通话建立，通话结束后可返回 NR。
- 判别要点：EPS fallback 发生在 **SA 终端 + 5GC** 环境；NSA 终端"本来就在 LTE 上"，不存在"回落"动作。

**3. 三者关系一张表**

| 阶段 | 语音方案 | 承载空口 | 说明 |
|---|---|---|---|
| NSA（Option 3x） | VoLTE | LTE | 语音走 LTE，数据可走 NR |
| SA 过渡期（无 VoNR） | EPS fallback → VoLTE | 先 NR 后 LTE | 回落建立 VoLTE，通话后返回 NR |
| SA 成熟期 | VoNR | NR | NR 空口 + 5GC + IMS，5QI=1 承载，目标终态 |

**4. 面试常见混淆点澄清**

- "NSA 的 EPS fallback"是错误说法：NSA 无 fallback 动作，语音本来就在 LTE。
- EPS fallback 的两种实现：**基于切换的回落**（handover based，时延小、体验好，需 LTE 邻区与切换准备）与**基于重定向的回落**（release with redirect，实现简单但呼叫建立时延长，盲重定向时延更大）。
- 语音连续性问题：通话中从 LTE 返回 NR 的时机由网络策略控制；若通话中移出 LTE 覆盖，靠 eSRVCC 切到 2G/3G（存量场景）保障不掉话。

## 关联考点

- NSA 与 SA 组网区别及演进路径：[NSA 与 SA](./ch01-q003-nsa-vs-sa-evolution.md)
- Option 3/3a/3x 与 Option 2 差异：[部署选项](./ch01-q004-deployment-options.md)
- EN-DC 控制面与用户面走向：[控制面与用户面](./ch01-q006-en-dc-cp-up.md)

## 面试追问

- **为什么 NSA 不能直接在 NR 上打 VoNR？** —— 要点：VoNR 依赖 5GC 的 QoS 框架（5QI=1 专用承载）与 NR 侧 IMS 承载建立流程，NSA 的 EPC + MeNB 锚点架构两者皆无；且 NSA 语音走 IMS/LTE 生态已成熟，无演进动力。
- **EPS fallback 用切换还是重定向更好？** —— 要点：切换式提前做了目标小区准备，中断时间短（百毫秒级），呼叫建立时延与 VoLTE 相当；重定向式需释放后重新驻留接入，时延长（可到秒级），但网络配置简单；商用网优先切换式，弱覆盖区域辅以盲重定向兜底。
- **VoNR 相比 VoLTE 有什么挑战？** —— 要点：TDD 大配比下语音包到达周期与帧结构适配、NR 弱覆盖（FR1 远点）下的鲁棒编码（如专用 5QI 语音的鲁棒模式）、与数据业务共调度时的时延抖动控制；这也是运营商最后开通 VoNR 的原因。
