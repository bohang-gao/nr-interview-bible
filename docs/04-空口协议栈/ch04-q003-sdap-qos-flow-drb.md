---
title: SDAP 层的引入与 QoS flow 到 DRB 的映射
chapter: 4
difficulty: 中
frequency: 中
tags: [SDAP, QoS, DRB, 映射]
---

## 一句话答案

SDAP（Service Data Adaptation Protocol，业务数据适配协议）是 NR 新增的用户面子层，负责把核心网的 QoS 流（QoS flow，由 QFI 标识）映射到空口的 DRB（Data Radio Bearer，数据无线承载）。QoS 流与 DRB 是两个独立的粒度：多条 QoS 流可复用到一条 DRB（相同 PDU 会话内 QoS 特性相近的流），一条 QoS 流也可以切换到不同 DRB，映射规则由 RRC 配置或由 UE 反射式学习。

## 详细展开

**为什么需要 SDAP**：

- LTE/EPS 的 QoS 模型：EPS 承载端到端一对一，无线侧 QoS 粒度 = 核心网承载粒度，灵活性差。
- NR/5GC 的 QoS 模型：核心网以 QoS 流为粒度（每流有 5QI、ARP、GFBR/MFBR 等参数），空口 DRB 是无线资源调度单位。两者解耦后，gNB 可以按需把多条流合到一个 DRB 上调度（省资源），也可以把关键流单独映射（强保障），SDAP 就是完成这个"翻译"的层。

**映射规则**：

1. **范围限制**：映射只发生在同一个 PDU 会话内，不同 PDU 会话的 QoS 流不能混到同一条 DRB。
2. **上行映射两种方式**：
   - **显式配置**：RRC 消息下发 mapping rules（QFI → DRB ID），UE 按表映射；
   - **反射 QoS（Reflective QoS）**：UE 从下行数据包头中的 QFI 学习映射关系，反向应用到上行——详见反射 QoS 专章。
3. **下行映射**：gNB（CU）做映射决策，SDAP PDU 头中带 QFI（可选，按流配置 present），DRB 分组在 MAC 层按 LCID 体现。
4. **end marker**：QoS 流切换 DRB 时，gNB 在旧 DRB 上发送 SDAP end marker，告诉对端该流之后的旧 DRB 数据已经没有了，接收方据此处理重排序边界，避免乱序。

**SDAP PDU 结构要点**：

- SDAP 头很轻：1~2 字节，含 DC（data/control）指示位、QFI（6 bit）、映射控制 RQA/end marker 指示位。
- SDAP 控制 PDU 用于 end marker 与 RQA（Reflective QoS Attribute，反射 QoS 属性）指示。

**与调度配合**：映射到不同 DRB 后，每条 DRB 有独立逻辑信道与优先级（由 RRC 的逻辑信道配置决定），MAC 调度按 LCP 处理——所以"QoS 流的 QoS 保障"实际由三段完成：核心网按流管控、SDAP 按流映射、空口按 DRB（逻辑信道）调度。

## 关联考点

- [反射 QoS（RQA）的工作机制](ch04-q004-reflective-qos.md)
- [NR 用户面协议栈总览与各层职责](ch04-q001-up-stack-overview.md)
- [逻辑信道优先级 LCP 与资源分配顺序](ch04-q014-lcp-priority.md)

## 面试追问

- **多条 QoS 流映射到同一条 DRB 有什么约束？** —— 必须同一 PDU 会话，且一般要求 QoS 特性（5QI 类型）相近，因为空口调度按 DRB 粒度进行，把 GBR 流和非 GBR 流硬塞一条 DRB 会破坏保障；GBR 流通常独占 DRB。
- **QoS 流从 DRB1 切到 DRB2 时如何避免乱序？** —— gNB 先在 DRB1 上发 end marker 通知该流不再出现，UE 对旧 DRB 中该流的缓存与新 DRB 的数据按序处理边界；上行同理由 UE 触发切换流程（含 NAS 反馈）。
- **SDAP 能不能跳过？** —— 可以，RRC 可配置对 DRB 启用 SDAP 或不启用（如 legacy 兼容场景、双连接部分承载），不启用时数据直接进 PDCP，无 QFI 头开销。
