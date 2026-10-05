---
title: 事件 B1/B2 的含义与异系统测量流程
chapter: 5
difficulty: 易
frequency: 高
tags: [测量事件, 异系统, B1, B2]
---

## 一句话答案

B 事件是异系统（inter-RAT）测量事件：B1 表示"异系统邻区质量好于绝对门限"，用于 NR→LTE 重定向/E-UTRAN 测量的开启与触发；B2 表示"服务小区质量差于门限1，且异系统邻区好于门限2"，双门限确认服务确实恶化、目标确实可用。两者都基于异系统对应信号量（如 E-UTRA RSRP/RSRQ）判决，是 4G/5G 互操作的核心判决依据。

## 详细展开

**1. 两个事件的触发条件与典型用途**

| 事件 | 进入条件 | 典型使用场景 |
|---|---|---|
| B1 | 异系统邻区质量 > 绝对门限 | 负载均衡/语音 EPS fallback 时寻找 LTE 落脚小区；与 A2 配合：A2 先开异系统测量，B1 触发重定向 |
| B2 | 服务小区质量 < 门限1 且 异系统邻区 > 门限2 | 覆盖边缘向低频段/异系统迁移，确保"服务确实差、目标确实好"才走，防误切 |

**2. 触发的完整信令链（以 NR→LTE 重定向为例）**

1. gNB 通过 RRC Reconfiguration 下发 measConfig：measObject（E-UTRA 频点）、reportConfig（B1/B2 事件门限 + hysteresis + timeToTrigger）；
2. 若异系统频点与服务小区不共帧，还需配测量 GAP（gap 模式让 UE 离开当前频点去测异系统）；
3. UE 上报 MeasurementReport（含 E-UTRA RSRP/RSRQ）；
4. gNB 判决后执行移动性动作：连态走重定向（RRC Release 带 redirectedCarrierInfo，去 LTE 读 SIB1 重选回落）或 N2/NG 切换到 EPC； idle 态按广播的重选优先级执行小区重选。

**3. 与 A 事件的关系**

- A 事件解决"NR 内部移动性"（同频/异频），B 事件解决"跨 RAT 移动性"（NR↔E-UTRA）；
- 典型组合是"A2 启动、B1 触发"或"A2 + B2 直接判决"，A2 是测量开关，B1/B2 是执行开关；
- 参数结构与 A 事件一致：门限 + hysteresis（迟滞）+ timeToTrigger（触发时间）三重防抖。

## 关联考点

- 同系统事件对照：[事件 A1–A6 的含义与典型使用场景](ch05-q020-events-a1-a6.md)
- NSA 侧的 B 事件用法：[NSA 终端如何驻留 LTE 并测量 NR（B1/B3 事件与系统消息配合）](../01-无线基础与演进/ch01-q014-nsa-measurement-b1-b3.md)
- 测量配置与 GAP：[测量配置三要素（测量对象/报告配置/测量标识）与 GAP](ch05-q019-meas-config-gap.md)
- 互操作总览：[4G/5G 互操作：EPC 与 5GC 间的切换与重选](../01-无线基础与演进/ch01-q017-4g-5g-interworking.md)

## 面试追问

- **为什么语音 EPS fallback 常用 B1 而不是 B2？** —— 要点：发起回落时服务小区 NR 覆盖往往尚可（业务不受限），只需确认 LTE 目标够好即可，用 B1 绝对门限更直接；若等 B2 的双门限，可能服务先掉到不可用，回落时延和失败率都变差。边缘弱覆盖场景才用 B2 兜底。
- **B1 门限配高了/低了会怎样？** —— 要点：配高→LTE 目标要求苛刻，触发慢甚至不触发，回落时延大或 fallback 失败重试；配低→目标质量不保证，回落到 LTE 后可能立即弱覆盖掉话。需要按覆盖衔接仿真+路测校准，并结合 hysteresis/TTT 防乒乓。
- **UE 连态测 E-UTRA 一定要 GAP 吗？** —— 要点：取决于 UE 测量能力和频点关系；若终端支持无 GAP 测异频/异系统（能力上报声明），且不与收发冲突，可省 GAP；否则必须配 GAP，GAP 会打断数据传输，是覆盖与速率权衡的一部分。
