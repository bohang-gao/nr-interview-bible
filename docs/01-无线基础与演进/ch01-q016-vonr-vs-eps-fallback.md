---
title: SA 语音方案：VoNR 与 EPS fallback 的对比
chapter: 1
difficulty: 中
frequency: 高
tags: [SA, 语音, VoNR, EPS fallback]
---

## 一句话答案

VoNR（Voice over NR）是 SA 的目标语音方案：IMS 语音由 NR 空口 + 5GC 承载，走 5QI=1 的专用承载，数据与语音可同时留在 5G。EPS fallback（EPS Fallback）是过渡方案：网络暂不支持 VoNR 或 NR 覆盖不足时，把终端回落到 LTE 用 VoLTE 完成通话。商用策略是"先 fallback 保语音、后逐步开通 VoNR"，最终收敛到 VoNR。

## 详细展开

**1. 两种方案的机制对比**

| 维度 | VoNR | EPS fallback |
|---|---|---|
| 所处网络 | SA（NR + 5GC + IMS） | SA（回落时用 LTE + EPC + IMS） |
| 语音承载 | NR 空口，5QI=1 专用承载 | 回落后在 LTE 建立 VoLTE（QCI=1）承载 |
| 呼叫时延 | 与 VoLTE 相当甚至更优（NR 调度更灵活） | 切换式回落百毫秒级中断；盲重定向可达秒级 |
| 数据业务 | 语音期间可继续走 NR | 回落期间数据也回到 LTE（速率下降） |
| 网络要求 | NR 连续覆盖、5GC 开通 VoNR 功能、IMS 对接完成 | 需 LTE 覆盖兜底与互操作参数配置 |
| 定位 | 目标终态 | 过渡方案 |

**2. EPS fallback 的两种实现**

- **基于切换的回落（handover based）**：网络在呼叫建立时提前对 LTE 目标小区做测量与切换准备，终端以切换方式迁移到 4G，中断时间短、体验好，是商用主流。
- **基于重定向的回落（release with redirect）**：网络直接释放 NR 连接并携带目标频点重定向，终端重新驻留 4G 后再建立 VoLTE；实现简单但时延长，弱覆盖/无邻区配置时用盲重定向兜底。

**3. 演进策略与判别**

1. **初期**：5G 覆盖不连续、VoNR 产业链未成熟，商用网普遍先开通 EPS fallback，保证"有 5G 也能打电话"。
2. **成熟期**：NR 连续覆盖 + VoNR 功能开通后，语音原生驻留 NR，fallback 仅作为 NR 弱覆盖时的兜底路径。
3. **判别要点**：EPS fallback 只发生在 SA 终端 + 5GC 环境；NSA 终端语音本来就是 VoLTE，不存在"回落"动作（上一题已述）。通话结束后终端可按网络策略返回 NR。

**4. VoNR 落地的主要挑战**

- TDD 大配比下语音包周期与帧结构适配、时延抖动控制。
- NR 远点/弱覆盖下的语音鲁棒性（覆盖补偿与专用鲁棒模式）。
- 与数据业务共调度时的资源保障（5QI=1 的 GBR 保障比特速率调度优先级）。

## 关联考点

- NSA 阶段语音只能走 VoLTE 的原因：[NSA 语音与 EPS fallback](./ch01-q015-nsa-voice-eps-fallback.md)
- SA 与 NSA 组网差异：[NSA 与 SA](./ch01-q003-nsa-vs-sa-evolution.md)
- 部署选项与语音能力的关系：[部署选项](./ch01-q004-deployment-options.md)

## 面试追问

- **EPS fallback 用切换还是重定向更好？** —— 要点：切换式提前准备目标小区、中断短（百毫秒级），商用首选；重定向式配置简单但需重新驻留接入，时延可到秒级，多作兜底。
- **VoNR 通话中走出 NR 覆盖怎么办？** —— 要点：依赖 4G/5G 互操作，通话中从 NR 向 LTE 的切换（或回落式切换）保证连续性；在纯 SA 覆盖边缘，网络可按策略触发向 LTE 的异系统切换，语音不中断。
- **为什么 VoNR 开通滞后于数据业务？** —— 要点：语音对时延/鲁棒性要求苛刻，需 NR 连续覆盖与 5GC/IMS 全链路就绪；TDD 配比与远点覆盖问题需要专门优化，运营商宁可先 fallback 保体验。

