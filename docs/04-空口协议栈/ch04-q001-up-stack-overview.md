---
title: NR 用户面协议栈总览与各层职责
chapter: 4
difficulty: 易
frequency: 高
tags: [协议栈, 用户面, SDAP, 分层]
---

## 一句话答案

NR 用户面从上到下依次为 SDAP、PDCP、RLC、MAC、PHY 五层，SDAP 是 NR 相对 LTE 新增的层，负责 QoS 流到数据无线承载（DRB, Data Radio Bearer）的映射。各层职责可记为：SDAP 管映射、PDCP 管加密与按序、RLC 管分段与 ARQ、MAC 管调度与 HARQ、PHY 管编码调制与实际传输。

## 详细展开

**自上而下逐层职责**：

| 层 | 主要职责 | 关键点 |
|---|---|---|
| SDAP（Service Data Adaptation Protocol，业务数据适配协议） | QoS 流 ↔ DRB 映射、QFI 标记 | NR 新增，仅用户面、仅 DRB |
| PDCP（Packet Data Convergence Protocol，分组数据汇聚协议） | 头压缩 ROHC、加密、完整性保护、重排序、按序递交、重复丢弃 | 有 SN（序列号），切换数据保护的主责层 |
| RLC（Radio Link Control，无线链路控制） | 分段/重分段（仅 UM/AM）、ARQ 重传、串联 | NR 中 RLC 不再做重排序与加密 |
| MAC（Medium Access Control，媒体接入控制） | 逻辑信道复用、调度、HARQ、随机接入、BSR/PHR 等控制单元 | 物理层之上的调度执行层 |
| PHY（Physical layer，物理层） | 编码、调制、多天线处理、资源映射 | HARQ 软合并在本层 |

**与 LTE 用户面的核心差异**：

1. **新增 SDAP**：LTE 的 EPS 承载是一一对应到无线承载的，QoS 粒度在核心网侧固定；NR 的 5QI 驱动的 QoS 流与 DRB 解耦，需要 SDAP 完成灵活映射，这是 5G QoS 架构落地的空口配套。
2. **RLC"瘦身"**：LTE 中 RLC 承担重排序、按序递交、串联/级联，NR 全部上移到 PDCP，RLC 只保留分段与 ARQ——这样 PDCP 重排序缓冲区可以跨小区（CU/DU 分离、双连接、切换）统一工作。
3. **MAC 串联取消**：LTE MAC 会把多个逻辑信道数据级联到一个 TB，NR 改由 RLC 层用 UMD/AMD PDU 串联，便于不同承载走不同安全路径。

**数据封装关系**：上层 PDU 加上本层头部成为本层 PDU，接收端逐层解封。SDAP PDU 带内 QFI（QoS Flow Identifier，QoS 流标识）可选字段；PDCP PDU 带 SN；RLC 头带分段偏移指示；MAC 子头标识逻辑信道；一个 MAC PDU 在一个 TTI 内发送，内含多个 MAC 子 PDU（RLC 数据、MAC CE、填充）。

## 关联考点

- [NR 控制面协议栈与 NAS/RRC 的分层关系](ch04-q002-cp-stack-nas-rrc.md)
- [SDAP 层的引入与 QoS flow 到 DRB 的映射](ch04-q003-sdap-qos-flow-drb.md)
- [RLC 与 MAC 的功能划分变化（相对 LTE 的取舍）](ch04-q012-rlc-mac-function-split.md)
- [PDCP 重排序与按序递交（含重建/切换场景）](ch04-q006-pdcp-reordering.md)

## 面试追问

- **为什么 NR 要把重排序从 RLC 上移到 PDCP？** —— 因为 RLC 在每次重配置/切换时都要重建并丢掉未确认数据，把重排序放在 RLC 就无法跨小区保持数据连续；PDCP 重建时才做重排序释放，配合 PDCP SN 跨节点不变，切换/双连接中丢包更少、按序性更好。
- **SDAP 为什么只在用户面、只对 DRB 有效？** —— 控制面信令（RRC/NAS）不需要 QoS 流映射，QFI 只标记用户数据；SRB（信令无线承载）走 RRC，天然不经过 SDAP，所以 SDAP 配置只出现在 DRB 上。
- **一个 MAC PDU 里能同时有多个逻辑信道的数据吗？** —— 能，MAC 复用正是干这个的：每个 MAC SDU 前的子头带 LCID 标明来源逻辑信道，按 LCP 优先级分配到的资源组装成 TB。
