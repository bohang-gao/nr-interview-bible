---
title: "PDCCH 的 CORESET 与搜索空间（公共/专用）"
chapter: 2
difficulty: 中
frequency: 高
tags: [PDCCH, CORESET, 搜索空间]
---

## 一句话答案

PDCCH 在 CORESET（Control Resource Set，控制资源集）内传输——CORESET 定义频域 RB 集合与持续符号数（1/2/3 个）；UE 在搜索空间（Search Space）配置的时域时机上对 CORESET 盲检。搜索空间分公共（CSS，含 Type0~Type3）与专用（USS），分别承载小区级公共信令与 UE 专属调度。

## 详细展开

**CORESET：控制信道的频域/时域资源框**

- 频域：一组 RB（以 6 的倍数配置），可位于 BWP 内任意位置；时域：1~3 个 OFDM 符号。
- 每个下行 BWP 可配置多个 CORESET（其中 CORESET#0 由 MIB 指示、专用于 SIB1/接入阶段），每个 CORESET 独立配置 CCE 到 RE 的映射（资源元素组 REG bundle → 控制信道元素 CCE 的交织与否）。
- 与 LTE 不同，NR 的控制区不是固定占每时隙头 1~3 符号，而是按 CORESET 配置灵活摆放，配合 mini-slot/短时隙调度更省资源。
- CORESET 还可配置 precoder granularity（预编码粒度）与 TCI（传输配置指示）状态，实现波束化的 PDCCH。

**搜索空间：UE 的"监听时刻表"**

- 定义监测周期、起止时刻、每时机聚合等级集合与候选数、关联的 CORESET。
- **公共搜索空间（CSS）**：Type0（SIB1，SI-RNTI）、Type0A（OSI）、Type1（随机接入响应，RA-RNTI）、Type2（寻呼，P-RNTI）、Type3（组公共，如 SFI/TPC，CSF/TPC 类 RNTI）——承载所有 UE 共享的信令。
- **专用搜索空间（USS）**：C-RNTI/CS-RNTI 加扰，承载该 UE 的调度与重配指令。
- RRC 为每个 BWP 配置搜索空间集合；没有显式配置时，协议预定义默认图样（如接入阶段的 Type0-PDCCH 公共搜索空间）。

**工作流**：UE 只在"搜索空间指示的时机 × 关联 CORESET 的资源"内按配置的聚合等级/候选数做相关检测 → 解出属于自己的 DCI → 按其调度 PDSCH/PUSCH。盲检预算有限（见关联考点），网络配置时须控制候选总数。

## 关联考点

- [聚合等级与 PDCCH 盲检次数的限制](/02-物理层/ch02-q018-al-blind-decode)
- [DCI 常见格式与调度信息字段](/02-物理层/ch02-q019-dci-formats)
- [初始 BWP 与 SIB1 中 BWP 配置的关系](/02-物理层/ch02-q009-initial-bwp-sib1)

## 面试追问

- **CORESET#0 是什么、为什么特殊？** —— MIB 直接指示的公共 CORESET，用于调度 SIB1（Type0 CSS），其频域位置、SCS 与 SSB 的复用关系通过查预定义表获得，是 UE 接入链条（SSB→MIB→CORESET#0→SIB1）的一环。
- **USS 和 CSS 的 RNTI 有什么不同？** —— USS 用 UE 专属 RNTI（C-RNTI 等），每个 UE 各自盲检自己的 DCI；CSS 用公共 RNTI（SI/P/RA-RNTI 等），小区内所有（或一组）UE 共同监测。
- **NR 控制区为什么不像 LTE 固定占前几个符号？** —— 灵活放置可避开 SSB/参考信号、配合 TDD 图案与 mini-slot 调度，把控制开销按需压缩或展开，提升资源利用率。
