---
title: "RNTI 类型（SI-RNTI/RA-RNTI/C-RNTI 等）与 PDCCH 加扰的作用"
chapter: 2
difficulty: 中
frequency: 高
tags: [RNTI, PDCCH, 加扰]
---

## 一句话答案

无线网络临时标识（RNTI, Radio Network Temporary Identifier）是区分不同 PDCCH 用途的"地址标签"：小区无线网络临时标识（C-RNTI, Cell RNTI）标识 UE 专属调度，系统信息 RNTI（SI-RNTI, System Information RNTI）、随机接入 RNTI（RA-RNTI, Random Access RNTI）、寻呼 RNTI（P-RNTI, Paging RNTI）等标识公共信道调度。DCI 的 CRC 用 RNTI 加扰，UE 只在自己匹配的 RNTI 上盲检成功，从而既实现寻址，又天然区分了搜索空间里的信息类型。

## 详细展开

**常见 RNTI 一览（面试常考前六个）**：

| RNTI | 全称 | 用途 |
|---|---|---|
| SI-RNTI | System Information RNTI | 广播 SIB 调度（PDSCH），全小区固定值 |
| RA-RNTI | Random Access RNTI | 随机接入响应（MSG2/RAR）调度，与 PRACH 时频位置绑定 |
| C-RNTI | Cell RNTI | UE 专属上下行调度，接入成功后分配 |
| TC-RNTI | Temporary C-RNTI | 竞争解决前的临时标识（MSG3/MSG4 阶段），成功后升级为 C-RNTI |
| P-RNTI | Paging RNTI | 寻呼消息调度，全小区固定值 |
| CSF-RNTI / SP-CSI-RNTI | Configured Scheduling / Semi-Persistent CSI RNTI | 配置授权重传激活/释放、半持续 CSI 激活 |
| INT-RNTI / SFI-RNTI / TPC-RNTI | — | 抢占指示、时隙格式指示、功控命令（组公共 DCI） |
| MCS-RNTI | MCS-C-RNTI | 建议用更保守 MCS 的临时降速指示 |

**加扰的作用（三点）**：

1. **寻址与信息类型区分**：CRC 用 RNTI 异或（加扰）后，只有持有该 RNTI 的 UE 才能解出 CRC 校验通过的 DCI。同一搜索空间里，SI-RNTI 的 DCI 与 C-RNTI 的 DCI 天然分开，UE 按用途选择对应格式解读。
2. **白化随机化**：加扰使 CRC 比特随机化，避免 PDCCH 弱块长下出现规律性比特模式，改善译码性能。
3. **安全/隔离**：非目标 UE 解不出别人的调度信息，用户间调度彼此不可见。

注意区分层次：RNTI 加扰的是 **PDCCH 的 CRC**；而 PDCCH 本身的极化编码输出、PDSCH/PUSCH 数据比特还有各自的扰码序列（初始化值也与 RNTI 关联）。另外 RA-RNTI 只由 PRACH 发送时机（时频位置）决定，与前导码 ID 无关——同一个时机上多个 UE 发不同前导码，会同时监听同一个 RA-RNTI 的 RAR。

## 关联考点

- [DCI 常见格式（0_0/0_1/1_0/1_1）与调度信息字段](/02-物理层/ch02-q019-dci-formats)
- [PDCCH 的 CORESET 与搜索空间（公共/专用）](/02-物理层/ch02-q017-pdcch-coreset-css)
- 随机接入流程与 MSG2/MSG4（第 5 章）
- 寻呼机制与 P-RNTI（第 5 章）

## 面试追问

- **TC-RNTI 和 C-RNTI 什么时候切换？** —— 竞争解决（MSG4）成功后，TC-RNTI 升级为 C-RNTI；失败则放弃，重新发起接入。MSG4 的 HARQ-ACK 就是用 TC-RNTI 加扰的 PUCCH 发送的。
- **为什么 RA-RNTI 与前导码无关？** —— RAR 以"时机"为单位调度，gNB 在一个 PRACH 时机上收到的所有前导码都共用一次 RAR 发送，每个前导码通过 RAR 内的 Rapid 子头区分，这样一次 RAR 能同时响应多个 UE。
- **G-RNTI 是什么？** —— 组播/广播业务（MBS）的组标识，gNB 用它向一组 UE 发送组播 PDSCH 调度，是 RNTI 家族中面向多播业务的扩展。
