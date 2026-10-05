---
title: 协议栈各层与空口调度资源的对应关系
chapter: 4
difficulty: 中
frequency: 中
tags: [调度, 协议栈, 资源映射]
---

## 一句话答案

一次空口传输是"协议栈纵向加工 + 调度资源横向摆放"的过程：PHY 以 RE（资源粒子）为最小单位、12 个 RE 组成 RB，频域 RB×时域符号/时隙构成调度颗粒；MAC 在授权到的时频资源上组装传输块（TB），RLC 提供分段后的数据块，PDCP/SDAP 只管数据处理不管资源。即"资源在 PHY/MAC 分配与填充，数据形态在 PDCP/RLC 预加工"。

## 详细展开

**资源颗粒金字塔**：

| 层 | 资源单位 | 说明 |
|---|---|---|
| PHY | RE（Resource Element） | 1 个子载波×1 个 OFDM 符号，最小颗粒 |
| PHY | RB（Resource Block） | 频域 12 个连续子载波；NR 无 LTE 的时域 0.5 ms 绑定 |
| MAC | VRB→PRB 映射 / 频域调度单位 | 调度器按 RB 分配频域资源 |
| MAC | TB（Transport Block） | 一次调度（一个时隙/多个符号）内的完整传输单元，含 CRC |
| 时域 | 符号/mini-slot/时隙 | URLLC 可用 mini-slot，常规按时隙调度 |

**逐层对应关系（发送方向自上而下）**：

1. **SDAP/PDCP**：产出 PDCP PDU（加密后的带 SN 数据包），与资源无关；PDCP SN 会随包一路带到接收端用于排序。
2. **RLC**：按 MAC 指示的可用空间对 PDCP PDU 做**分段**（NR 只在发送时按需分段，无重分段），生成 RLC PDU；分段信息写在 RLC 头。
3. **MAC**：多个逻辑信道的 RLC PDU + MAC CE（BSR/PHR/TCI 状态指示等）+ 填充，组装成一个 MAC PDU = TB 的载荷；MAC 子头标注各部分来源。
4. **PHY**：对 TB 做 LDPC 编码、码块分割、速率匹配、调制、映射到调度器授权的时频资源（RB×符号），经波束赋形发出。

**反向理解（调度器视角）**：调度器（gNB MAC）掌握的是物理资源与信道状态（CQI/PHR/BSR），输出是"某 UE 在某时刻、某 RB 上、用某 MCS 发 TB"；上三层只负责把数据"切成合适的块"——因此面试问"BSR/PHR 属于哪层、作用于什么资源"，答案是 MAC 层 MAC CE，影响的是调度授权（RB 数与 MCS）。

**典型换算直觉**：30 kHz SCS 时 1 RB 频宽 360 kHz，1 时隙 0.5 ms 14 符号；一个 100 MHz 载波约 273 个 RB——这些量级数字用于展示"资源颗粒与协议栈块大小如何对上"。

## 关联考点

- [MAC 层主要功能与逻辑信道复用](ch04-q013-mac-functions-mux.md)
- [NR 无线帧、子帧、时隙与符号的时间结构](../02-物理层/ch02-q001-frame-structure.md)
- [参数集（Numerology）与子载波间隔的对应关系](../02-物理层/ch02-q002-numerology-scs.md)
- [逻辑信道优先级 LCP 与资源分配顺序](ch04-q014-lcp-priority.md)

## 面试追问

- **RLC 为什么必须知道 MAC 给了多大空间？** —— NR 取消 MAC 级联后，分段职责在 RLC：MAC 组装时按剩余空间向 RLC 索取，RLC 才能切出恰好填满 TB 的分段，资源利用率最大化。
- **一个 TB 一定能装满吗？装不满怎么办？** —— 不一定：无数据时 MAC 用填充（padding）补齐 TB；LCP 规则还允许为控制单元（BSR 等）预留空间，资源与数据量的差值由填充消化。
- **URLLC 的资源对应关系有何不同？** —— 可用 mini-slot（2/4/7 符号）级调度、puncturing 打孔抢占 eMBB 资源，时域颗粒从"时隙"细化到"符号"，这是资源映射灵活性服务低时延的典型例子。
