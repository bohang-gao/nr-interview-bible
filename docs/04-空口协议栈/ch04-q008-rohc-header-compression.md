---
title: ROHC 头压缩的收益与配置
chapter: 4
difficulty: 中
frequency: 中
tags: [PDCP, ROHC, 头压缩, VoNR]
---

## 一句话答案

ROHC（RObust Header Compression，健壮头压缩）在 PDCP 层把 IP/UDP/RTP 等"头部重复信息"压缩后再走空口，对 VoNR 这类小包业务收益最大——40~60 字节的协议头可压到几字节，显著降低头开销占比。压缩由 RRC 半静态配置（含 ROHC 通道数与支持的算法 profile），上下文建立后靠反馈保持鲁棒性，仅对数据承载生效。

## 详细展开

**为什么需要头压缩**：

- VoIP 典型载荷：AMR 编码约 30 字节/20 ms，而 IPv4+UDP+RTP 头 40 字节、IPv6 下 60 字节——不压缩时空口一半以上带宽在传头，频谱效率极差；
- TCP 业务头（IP+TCP 约 40 字节）在小包高频交互（如网页）场景同样浪费明显。

**ROHC 工作机制要点**：

1. **profile 选择**：每种协议组合一个 profile（如 RTP/UDP/IP、UDP/IP、ESP/IP、TCP/IP），RRC 配置里带 maxCID（通道数上限）与允许的 profile 列表；
2. **上下文与 CID**：每条流分配一个 CID（Context Identifier，上下文标识符），压缩端与解压端各自维护上下文，头中的变化字段按差分编码发送；
3. **三态压缩**（FO/SO/IR 状态概念）：初始发全头（IR），稳定后只发变化量与序列增量（FO），进一步稳定后只发最低位序列号（SO），开销降至几字节；
4. **鲁棒性**：靠 ACK/NACK 反馈与"W-LSB 窗口编码"容忍丢包——丢包后不需要重传整个上下文，这正是"Robust"的含义；
5. **反馈通道**：解压侧通过 PDCP 控制 PDU（ROHC feedback）携带上下文状态反馈，反馈 PDU 不加密。

**收益量化（口播版）**：

- VoNR：40~60 字节头 → 约 3~8 字节，头开销占比从 50%+ 降到 15% 以内，等效提升 VoNR 容量近一倍量级；
- 大包业务（视频/MSS）：头部占比本身小（<5%），压缩收益有限，还占处理资源——所以网络一般只对 QCI/5QI 为会话类语音的承载启用。

**配置要点**：RRC 中 per-DRB 配置 ROHC 是否启用、maxCID、profile 集合；切换/重建时上下文尽量保持（PDCP 重建不清 ROHC 上下文，只有安全变更才重置）；NR 还新增了 EHC（Ethernet Header Compression，以太网头压缩）用于 TSN 类以太网载荷。

## 关联考点

- [PDCP 层主要功能与 PDCP SN 长度选择](ch04-q005-pdcp-functions-sn.md)
- [PDCP 加密与完整性保护范围（AS 层哪些加密哪些不加密）](ch04-q007-pdcp-ciphering-integrity.md)
- [BSR 缓存状态报告的类型与触发条件](ch04-q016-bsr-types-trigger.md)

## 面试追问

- **ROHC 压缩失败/上下文失步怎么办？** —— 解压端校验失败返回 NACK 或直接丢弃，压缩端从 IR 态重建上下文（重发全头）；ROHC 的 W-LSB 设计让短丢包不触发完全重建，鲁棒性来自"容忍丢包的差分编码 + 反馈"。
- **为什么语音收益大、视频收益小？** —— 收益取决于"头/载荷比"：语音小包头占一半以上，压缩几乎翻倍有效带宽；视频大包头占比个位数，省几个字节意义不大。
- **切换后 ROHC 上下文会丢吗？** —— 正常切换 PDCP 上下文迁移时 ROHC 上下文保持，压缩继续；只有涉及安全算法变更的重建才要求重置头压缩上下文。
