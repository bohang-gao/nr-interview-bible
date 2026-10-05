---
title: NR 小区搜索完整流程：从 SSB 检测到读取 SIB1
chapter: 5
difficulty: 中
frequency: 高
tags: [小区搜索, SSB, SIB1]
---

## 一句话答案

终端开机后按 GSCN 栅格扫描频点，先检测主同步信号（PSS, Primary Synchronization Signal）获得符号定时与组内标识，再解辅同步信号（SSS, Secondary Synchronization Signal）得到帧定时与组号、合成 PCI；随后解调 PBCH 获得 MIB，据其中的 pdcch-ConfigSIB1 找到公共搜索空间，盲检 SI-RNTI 加扰的 PDCCH 并接收 SIB1，完成小区搜索。

## 详细展开

**流程六步走**：

| 步骤 | 动作 | 获得信息 |
|---|---|---|
| 1 频点扫描 | 优先扫已存频点/邻区列表，否则按 GSCN 栅格全频段搜 | 候选载波 |
| 2 检测 PSS | 3 条序列匹配 | 符号定时 + NID2（0~2） |
| 3 检测 SSS | 336 条序列匹配 | 帧定时 + NID1（0~335） |
| 4 解调 PBCH | 借助 PBCH DMRS | MIB |
| 5 解码 MIB | 解析关键字段 | SFN、kSSB、CORESET 0 配置、cellBarred 等 |
| 6 接收 SIB1 | 盲检 SI-RNTI PDCCH → PDSCH | 驻留与接入所需最小配置 |

- **PCI 合成**：PCI = 3 × NID1 + NID2，共 3 × 336 = 1008 个。
- **MIB 关键内容**：系统帧号高 6 位（低 2 位由 PBCH DMRS 序列隐含）、半帧号与 SSB 索引低位（同样由 DMRS 隐含，终端由此知道自己锁在哪个波束）、公共子载波间隔（subCarrierSpacingCommon）、SSB 与载波中心的偏移 kSSB、pdcch-ConfigSIB1（Type0-PDCCH 公共搜索空间/CORESET 0 位置）、小区禁止标志。
- **读 SIB1**：在 pdcch-ConfigSIB1 指示的公共搜索空间内盲检 SI-RNTI 加扰的 DCI 1_0，按调度接收 SIB1。SIB1 提供初始上下行 BWP、随机接入配置、其余 SI 的调度信息、接入控制与小区选择参数，是判定能否驻留的依据。
- **收尾**：SIB1 读取完成后终端执行小区选择（S 准则），通过则驻留；未广播/受限则按规则换频点或换波束重搜。

## 关联考点

- SSB 的时频结构：[SSB 的组成与时频位置](../02-物理层/ch02-q010-ssb-composition.md)
- SSB 周期与 GSCN 栅格：[SSB 周期、GSCN 频栅与小区搜索的关系](../02-物理层/ch02-q012-ssb-period-gscn.md)
- 初始 BWP 与 SIB1：[初始 BWP 与 SIB1 中 BWP 配置的关系](../02-物理层/ch02-q009-initial-bwp-sib1.md)
- 系统信息获取与有效性：[系统信息的获取流程与有效性判断](ch05-q005-si-acquisition-validity.md)

## 面试追问

- **为什么 PSS/SSS 要分两步而不是一次解出 PCI？** —— 要点：PSS 只有 3 条序列，先做粗同步并确定组内身份，缩小 SSS 的搜索空间（336 选 1），两级检测显著降低复杂度与虚警率。
- **终端怎么知道完整的系统帧号？** —— 要点：MIB 只带 SFN 高 6 位，SFN 低 2 位与半帧号一起隐含在 PBCH DMRS 序列里，四选一的 DMRS 恰好补齐 10 bit SFN。
- **SIB1 一直读不到，可能是什么问题？** —— 要点：常见原因有 kSSB/CORESET 0 配置与实际不符、SIB1 覆盖差（SSB 波束下无 SIB1 资源）、小区被禁止或接入受限；排查先核对 SSB 与 SIB1 复用关系和 MIB 字段一致性。
