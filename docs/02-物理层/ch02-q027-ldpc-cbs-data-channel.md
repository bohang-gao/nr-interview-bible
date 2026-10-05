---
title: "LDPC 编码在 NR 数据信道的应用与码块分割"
chapter: 2
difficulty: 难
frequency: 中
tags: [LDPC, 编码, 码块分割]
---

## 一句话答案

低密度奇偶校验码（LDPC, Low-Density Parity-Check Code）是 NR 数据信道（PDSCH/PUSCH）的信道编码，替代了 LTE 的 Turbo 码，具备大码块、高码率下的并行译码优势。由于 LDPC 编译码复杂度随码长增长，传输块（TB, Transport Block）必须先做**码块分割（Code Block Segmentation, CBS）**：按最大码块尺寸切成多个码块（CB），每块独立加 CRC、独立编码，接收端逐块译码、逐块 CRC 校验，支持只重传出错的块。

## 详细展开

**为什么选 LDPC 弃 Turbo**：

- **并行化友好**：LDPC 置信传播译码天然并行，硬件上以固定迭代次数流水处理，吞吐量随芯片面积线性扩展；Turbo 的 MAP/滑窗译码串行依赖重、高吞吐代价大。
- **大码块性能**：NR 峰值速率要求 TB 达到上百 kbit 甚至 Mbit 级，LDPC 在长码、高码率（8/9、7/8）下性能衰减平缓；Turbo 长码交织器复杂且高码率性能下滑。
- **速率匹配灵活**：LDPC 用打孔/重复即可覆盖任意码率（1/5 到 8/9），配合冗余版本实现增量冗余 HARQ，无需 Turbo 的复杂打图案设计。
- **低时延**：固定迭代结构时延确定性好，适合 URLLC。

**NR LDPC 编码结构（两个基图）**：

- **Base Graph 1（BG1）**：大码块高码率，最大信息位 8448 bit，支持码率 1/3~8/9，用于正常尺寸 TB。
- **Base Graph 2（BG2）**：小码块低码率，最大信息位 3840 bit，支持码率 1/5~2/3，用于小包（URLLC、控制辅助信息）。
- 由提升因子（lifting size）将基图扩展为不同码长，QC-LDPC（准循环）结构保证硬件可实现。

**码块分割流程（面试能手推）**：

1. TB 先加 TB 级 CRC（24 bit）。
2. 按所选基图的最大码块尺寸（BG1 为 8448）判断是否需要分割，均分到每个 CB 信息位长度（向上对齐到最小提升因子的倍数）。
3. 每个 CB 加独立的 CB 级 CRC（24 bit 或 16 bit），再逐块 LDPC 编码。
4. 译码端逐 CB 独立校验，坏块只触发该块的重传（CBG 重传可进一步细化到码块组粒度）。

**记忆口诀**：TB = 大包裹，CB = 分装的小箱，每个小箱有独立"验讫贴"（CRC），运输（HARQ）中只补损坏的箱。

## 关联考点

- [Polar 码用于 PBCH/PDCCH 的原因与特点](/02-物理层/ch02-q028-polar-pbch-pdcch)
- [速率匹配与冗余版本 RV 在 HARQ 重传中的作用](/02-物理层/ch02-q029-rate-matching-rv-harq)
- [LDPC 与 Polar 码在 NR 中的分工及相对 LTE Turbo 码的优势](/01-无线基础与演进/ch01-q013-ldpc-polar-codes)
- HARQ 进程与软合并（本章后续）

## 面试追问

- **TB CRC 和 CB CRC 各干什么用？** —— TB CRC 验证整个传输块是否全部正确（早停：全对即上报 ACK）；CB CRC 定位到出错码块，是 CBG/逐块重传和接收端早停迭代的依据。
- **为什么有两个基图？** —— BG1 为大 TB 高码率优化、BG2 为小包低码率（含 1/5 超低码率）优化；用一套 BG2 兼顾 URLLC 小包的极低码率需求，避免 BG1 在短码长下性能亏损。
- **码块数变多对 HARQ 有什么影响？** —— 一个 TB 内某 CB 错就导致整个 TB 的 ACK 为 NACK（除非启用 CBG 重传把 CB 分组、按组重传），所以大 TB 下 CBG 功能对重传开销改善明显。
