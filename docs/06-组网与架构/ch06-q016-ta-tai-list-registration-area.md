---
title: 跟踪区 TA/TAI 列表与注册区设计
chapter: 6
difficulty: 中
frequency: 中
tags: [移动性管理, 跟踪区, 注册区, 寻呼]
---

## 一句话答案

跟踪区（TA, Tracking Area）是核心网侧的移动性管理区域，AMF 通过 TAI 列表（一个 UE 同时被分配多个 TA）来抑制边界区的频繁位置更新，寻呼则在 TAI 列表覆盖的所有 TA 内下发。5G 还引入了基于 RAN 的通知区（RNA, RAN-based Notification Area）配合 RRC INACTIVE 状态，把小颗粒移动性管理下沉到无线侧，减轻核心网信令。

## 详细展开

**1. 基本概念**

- **TA（Tracking Area）**：由运营商规划的一组小区集合，是核心网寻呼与位置管理的基本单元；每个 TA 用 TAI（TA Identifier = PLMN + TAC，Tracking Area Code）唯一标识。
- **TAI List**：注册时 AMF 给 UE 分配一个 TAI 列表（可包含多个 TAI，数量受信令容量限制），UE 处于列表内任意 TA 都不必发起注册区更新——这是对抗"边界乒乓"的关键设计。
- **RNA（RAN-based Notification Area）**：5G 特有，服务于 RRC INACTIVE 状态；RNA 更新由 gNB 处理，不上报核心网。RNA 粒度可以是小区列表、RAN 通知区内的 TA 列表或整个 TA，比 TA 更小更灵活。

**2. 设计权衡**

| 规划倾向 | 效果 |
|---|---|
| TA 规划过大 | 寻呼范围大、寻呼信道负担重，寻呼响应时延增加 |
| TA 规划过小 | 位置更新（TAU）信令频繁，消耗空口与核心网资源 |
| TAI 列表条数多 | 边界 UE 少发 TAU，但核心网寻呼范围变大 |
| TAI 列表条数少 | 信令省了，边界 UE 频繁 TAU |

工程上通常：TA 边界尽量与行政区/高速铁路走廊、话务热点错开，避免把密集商圈切在边界上；相邻 TA 不重叠、一个小区只属于一个 TA。

**3. 寻呼与注册区更新的关系**

- 有下行数据/信令时，AMF 向 TAI 列表内所有 TA 的 gNB 发寻呼（经 N2），UE 在任一 TA 内小区都能被叫到。
- UE 移动到 TAI 列表外的 TA 时，发起移动性注册更新，AMF 重新分配 TAI 列表。
- RRC INACTIVE 的 UE 移动跨 RNA 时只做 RNA 更新（RRC 层信令，gNB 间经 Xn 联系），核心网无感知——这是 5G 相对 4G 减负的体现。

## 关联考点

- RRC INACTIVE 与 RNA：[RRC INACTIVE 与 LTE IDLE 的区别](../04-空口协议栈/ch04-q022-rrc-inactive-vs-lte-idle.md)
- RNA 更新流程：[RRC 去激活与 RNA 更新](../05-关键信令流程/ch05-q018-rna-update.md)
- 寻呼机制：[5G 寻呼流程与 PF/PO 计算](../05-关键信令流程/ch05-q035-nr-paging-flow.md)
- 4G 对应机制：[跟踪区更新 TAU 流程](../05-关键信令流程/ch05-q032-tau-tracking-update.md)

## 面试追问

- **TAI 列表和 RNA 能不能互相替代？** —— 要点：不能。TAI 列表服务核心网管理态（CM-IDLE/连接态的注册区），RNA 服务 RRC INACTIVE；颗粒度上 RNA 可细到小区列表，TA 至少是一个 TAC。二者配合实现"核心网粗管、无线侧细管"。
- **为什么 5G 把部分位置管理下沉到 RAN（RNA）？** —— 要点：海量物联网与高频小包终端若全部 TAU 打到 AMF，核心网信令风暴风险大；INACTIVE+RNA 让大量短距离移动只在 gNB 间消化，AMF 只在跨 RNA 寻呼等必要场景被唤醒。
- **TA 规划和寻呼成功率的关系？** —— 要点：TA 过大导致单 TA 寻呼小区数多、寻呼资源（PF/PO、PDCCH）拥塞而漏呼；TA 过小则 TAU 频发、UE 耗电。规划要结合话务分布与寻呼容量联合评估。

---

*难度提示：中 | 相关规范方向：23.501（移动性管理与注册区域）*
