---
title: 4G/5G 融合核心网与互操作（N26 接口）
chapter: 6
difficulty: 中
frequency: 高
tags: [N26, 互操作, EPS fallback, 4G/5G融合]
---

## 一句话答案

N26 是 5GC 的 AMF 与 EPC 的 MME 之间的互通接口，让 4G/5G 混合组网下 UE 在 EPC 与 5GC 之间切换/重选时能转移上下文、保持 IP 与业务连续。它是 EPDG/5G 互操作的"桥梁"，最典型应用是 EPS fallback 语音：5G 上发起 VoNR 条件不满足时切回 4G VoLTE 接续。

## 详细展开

**1. 融合组网形态**

- 运营商现实组网常为 4G/5G 长期共存：EPC 与 5GC 并行运行，gNB 与 eNB 共站。
- 融合的实现要素：
  - **HSS+UDM 融合**：同一签约库同时服务 MME 与 AMF。
  - **PCF+PCRF 融合**：统一策略。
  - **MME 与 AMF 经 N26 互通**：移动性上下文转移。
  - UE 支持"4G/5G 双模 + 互通注册"，NAS 层有 unified registration 概念（E-UTRA connected to EPC 与 NR connected to 5GC 间的模式切换）。

**2. N26 的作用**

| 场景 | N26 的角色 |
|---|---|
| 5GC → EPC 切换/重选（如 5G 覆盖弱） | AMF 向 MME 转移 MM/SM 上下文，MME 向 SGW/PGW 发起承载建立，尽量保持 IP 不变 |
| EPC → 5GC 迁移 | 反向：MME 经 N26 把上下文交给 AMF，PDU 会话/承载映射延续 |
| EPS fallback 语音 | 5G 数据态 → 4G VoLTE：基于 N26 的互通切换是优选路径，语音接续快 |
| 互通注册管理 | MME/AMF 互相标记对端注册状态，避免双注册冲突 |

**3. 有无 N26 的差异**

| 对比项 | 有 N26 | 无 N26 |
|---|---|---|
| 切换方式 | 互通切换（上下文转移，IP 可保持） | 只能先释放再重选（interworking without N26：UE 换网后重新注册/建会话） |
| 业务连续性 | 会话连续（SSC 类似效果） | 业务中断、IP 变更 |
| 语音 | EPS fallback 快速接续 | 只能靠重选回 4G 后再发起（时延长） |
| 部署要求 | MME 与 AMF 同 PLMN 且打通 N26 | 无需打通 |

**4. 工程要点**

- N26 上跑的是 **GTPv2-C** 类互通信令（沿用 EPC 语境的上下文请求/响应 + 创建承载请求等），并非 SBA/HTTP。
- 无 N26 互操作适用于数据业务为主、语音已有 VoNR 或不依赖 fallback 的网络。

## 关联考点

- 语音互操作：[EPS fallback 与 VoNR 的关系](../01-无线基础与演进/ch01-q015-nsa-voice-eps-fallback.md) 、[VoNR 与 EPS fallback](../01-无线基础与演进/ch01-q016-vonr-vs-eps-fallback.md)
- 互操作全景：[4G/5G 互操作：EPC 与 5GC 间的切换与重选](../01-无线基础与演进/ch01-q017-4g-5g-interworking.md)
- N26 专题：[N26 接口的作用与无 N26 互操作的区别](../01-无线基础与演进/ch01-q018-n26-interface.md)
- 会话连续性：[UPF 的位置、作用与下沉部署](ch06-q005-upf-position-deployment.md)

## 面试追问

- **EPS fallback 为什么偏好基于 N26 的切换而不是重选？** —— 要点：基于切换的 fallback 走"上下文转移+承载建立"，UE 在 4G 侧直接进入连接态接续语音，端到端时延可控；重选要先释放、小区重选、再注册再建承载，接续时延大且易掉话。现网把"无 N26 也强制走切换"作为优化项，但 N26 存在时体验最稳。
- **N26 接口用什么协议？为什么不是 SBA？** —— 要点：GTPv2-C（复用 EPC 的 S3/S10/S11 信令风格）。因为对端 MME 是 4G 设备，不支持 HTTP/2 的 SBI；N26 本质是把 EPC 的 S10 语义搬到 4G/5G 之间，AMF 充当"5G 侧的 MME"角色与之对话。
- **5G 会话（PDU session）和 4G 承载（EPS bearer）在互操作中怎么映射？** —— 要点：一对一映射为默认规则——一个 PDU 会话对应一个（默认）EPS 承载，QoS flow 与 EPS bearer 的 QoS 参数近似对齐（5QI↔QCI 取同值）；非 GBR 会话易迁移，GBR/特殊切片会话可能无法迁移（MME 拒绝或降级），这也是 EPS fallback 只迁语音相关会话的原因。

---

*难度提示：中 | 相关规范方向：23.501/23.502（4G/5G 互操作）、38.413（N2 切换语境）*
