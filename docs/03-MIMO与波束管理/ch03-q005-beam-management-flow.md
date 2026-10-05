---
title: NR 波束管理整体流程是怎样的？
chapter: 3
difficulty: 中
frequency: 高
tags: [波束管理, 波束赋形]
---

## 一句话答案

NR 波束管理是 gNB 与 UE 联合维护最优收发波束的闭环过程：gNB 扫描发送各波束的 SSB/CSI-RS，UE 测量（L1-RSRP）并上报最优波束，gNB 用 TCI 状态/DCI 指示下行收发波束对，波束失败时由波束失败恢复流程重新获取。五个环节依次是扫描 → 测量 → 上报 → 指示 → 恢复。

## 详细展开

**1. 扫描（Beam sweeping）**：gNB 在不同时间（SSB 突发集内不同符号）或不同资源（CSI-RS 时频位置）上依次发送不同方向的波束，覆盖整个小区扇区。FR1 宏站 SSB 波束典型 4~8 个，FR2 可达 64 个；UE 侧同时对接收波束做轮询训练（尤其毫米波）。

**2. 测量**：UE 对候选波束做 L1-RSRP / L1-SINR 测量，基于 SSB 或 CSI-RS。SSB 用于粗测（初选波束、接入），CSI-RS 支持更细粒度的波束精调与周期/非周期/半持续测量。

**3. 上报**：UE 通过 RSRP 类型 CSI 上报（含 CRI/SSBRI 波束索引与 L1-RSRP 值），或由波束失败时上报候选参考信号；上报可以是周期 PUCCH、半持续或非周期 PUSCH。

**4. 指示**：gNB 根据测量结果为每个下行信道/信号配置 TCI（Transmission Configuration Indicator）状态，通过 RRC 配置 + MAC CE 激活 + DCI 指示（TCI 字段）告知 UE 用哪个 QCL 关系接收 PDCCH/PDSCH/CSI-RS；上行通过 SRI（SRS 资源指示）或空间关系信息（spatial relation）指示发送波束。

**5. 恢复**：当 PDCCH 波束失败（BFD 判据连续失败）时，UE 在配置的候选波束中找新波束，通过专用 PRACH 或 PUCCH 上的 BFR 请求发起恢复，gNB 应答后在新波束上重建链路。

整个流程的目的是在模拟波束对（gNB Tx 波束 ↔ UE Rx 波束）空间中持续锁定最优对，且高/低频均适用——高频因波束窄、易遮挡，恢复环节尤为关键。

## 关联考点

- [P1/P2/P3 过程的触发场景与各自作用](/03-MIMO与波束管理/ch03-q006-beam-p1-p2-p3)
- [波束失败恢复 BFR 的完整流程](/03-MIMO与波束管理/ch03-q011-bfr-procedure)
- [TCI 状态的配置与激活机制](/03-MIMO与波束管理/ch03-q008-tci-activation)

## 面试追问

- **波束管理和 LTE 的自适应天线有什么本质区别？** —— LTE 天线调整对 UE 透明，靠 CRS 隐式覆盖；NR 把波束显式标准化为可测量、可上报、可指示的实体（SSB/CSI-RS + TCI），使窄波束在高频场景可管可控。
- **SSB 测量和 CSI-RS 测量在波束管理中怎么分工？** —— SSB 覆盖小区级粗波束（接入、切换、失败检测基准），CSI-RS 提供更窄的精波束与更灵活的触发时机（非周期），用于连接态的精细化波束维护。
- **波束管理流程是 UE 触发还是 gNB 触发？** —— 扫描与测量配置由 gNB 发起；波束失败恢复由 UE 触发，其余精调（P2/P3）由 gNB 按需配置，属于 gNB 主导、UE 协助反馈的闭环。
