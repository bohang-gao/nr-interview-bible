---
title: 5GC 与 EPC 的核心差异总结（高频对比题）
chapter: 6
difficulty: 易
frequency: 高
tags: [5GC, EPC, 对比, 架构]
---

## 一句话答案

5GC 相对 4G EPC 的差异可归纳为五大转变：接口从点对点专有接口变为服务化接口（SBI）；控制面与用户面彻底分离（CUPS 完全体）；网元按功能拆得更细（MME 拆为 AMF+部分 SMF，SGW/PGW 合一化拆为 SMF+UPF）；数据与逻辑分离（UDM+UDR、统一数据仓库）；原生支持网络切片与更灵活的会话/业务锚点（SSC、LADN、本地分流），并统一承载 3GPP 与非 3GPP 接入。

## 详细展开

**1. 核心差异对照表**

| 维度 | 4G EPC | 5G 5GC |
|---|---|---|
| 接口形态 | 点对点专有接口（GTP-C/S1-MME 等，Diameter/GTPv2） | 服务化接口 SBI：HTTP/2 + JSON，NF 即服务 |
| 网元对应 | MME → AMF + （部分）SMF；SGW-C/PGW-C → SMF；SGW-U/PGW-U → UPF；HSS → UDM+UDR+AUSF；PCRF → PCF | |
| 鉴权 | 4G-AKA / EAP-AKA | 5G-AKA / EAP-AKA'，锚点密钥体系升级（Kseaf/Kamf 分层） |
| 移动性状态机 | ECM-IDLE/CONNECTED | CM-IDLE/CM-CONNECTED + RRC INACTIVE（RAN 侧节电与快速唤醒） |
| 会话模型 | EPS 承载（默认+专有承载） | PDU 会话 + QoS flow（一个会话多条 QoS 流，免专有承载信令风暴） |
| 锚点灵活性 | PGW 固定锚点 | SSC mode 1/2/3、多锚点、ULCL、IPv6 Multi-homing |
| 切片 | 无原生切片（靠 APN/DNN 区分） | 原生 S-NSSAI 切片，NSSF 选网 |
| 本地分流 | SIPTO/LIPA（有限） | LADN、ULCL、DNAI 原生化 |
| 接入统一 | eUTRAN 为主，non-3GPP 走 ePDG/PGW | 3GPP 与 non-3GPP 接入统一到 5GC（TNGF/N3IWF） |
| 网络智能化 | 网管集中式 | SBA 便于能力开放（NEF）、网络数据分析 NWDAF |
| 语音 | VoLTE | VoNR（+EPS fallback 互操作） |

**2. 三个"为什么"**

- **为什么换 SBI？** 点对点接口下，任何网元升级都牵动全网接口改造；SBI 让 NF 注册到 NRF、按服务调用，网元可独立演进、弹性扩缩，这是云化的前提。
- **为什么控制面无状态化？** 状态（用户上下文）外置到统一数据存储层后，控制面 NF 成为"无状态计算单元"，可随时重启、扩容、迁移——电信级高可用从"主备"走向"池化+自愈"。
- **为什么 QoS flow 替代专有承载？** EPS 每条专有承载要端到端信令建立，应用流多时信令开销大；5G 把"会话"和"QoS 流"解耦，QoS flow 的建立可以由 NAS/RRC 灵活映射，反射式 QoS 还能让 UE 自学过滤规则，省显式信令。

**3. 面试答题框架（30 秒结构）**

1. 先说接口革命：点对点 → SBA；
2. 再说 CUPS：控制/用户面彻底分离，UPF 可下沉；
3. 然后网元映射与拆分（MME 拆 AMF/SMF、HSS 拆 UDM/AUSF）；
4. 最后点两个 5G 新能力：切片与会话锚点灵活性（SSC/本地分流）。

## 关联考点

- NF 总览：[5GC 网络功能总览（AMF/SMF/UPF/UDM/PCF/AUSF/NSSF/NRF）](ch06-q003-5gc-nf-overview.md)
- SBA 详解：[SBA 服务化架构与网络功能接口](ch06-q006-sba-service-based-architecture.md)
- CUPS 思想：[控制面/用户面分离 CUPS 的思想与价值](ch06-q025-cups-separation-value.md)
- 4G/5G 互通：[4G/5G 融合核心网与互操作（N26 接口）](ch06-q015-n26-interworking.md)

## 面试追问

- **EPC 就不能云化吗？为什么说 5GC 才是"云原生"？** —— 要点：EPC 可以虚拟化（vEPC，把网元搬上虚机），但接口仍是点对点、状态在网元内部，只能"整机级"弹性；5GC 从架构上按微服务拆分、SBI 解耦、状态外置，可按 NF 甚至按服务粒度伸缩与灰度——前者是"搬上云"，后者是"为云而生"。
- **QoS flow 与 EPS bearer 的映射关系？** —— 要点：一对一映射是互操作默认——默认承载 ↔ 默认 QoS flow，专有承载 ↔ GBR 类 QoS flow；5QI 与 QCI 参数语义基本对齐。互操作（如 N26 切换）时按此映射转换，这也是 4G/5G 会话能连续的技术基础。
- **5GC 统一了 non-3GPP 接入，有什么实际意义？** —— 要点：Wi-Fi 等非 3GPP 接入可以经 N3IWF/TNGF 直连 5GC，与 5G 接入共享统一鉴权、统一会话与统一策略，运营商可实现"固移/Wi-Fi/蜂窝一体"的融合产品（如 Wi-Fi 通话 2.0、多接入切换 PDU 会话 MA-PDU），业务体验与计费统一，这是 EPC 时代做不到的原生能力。

---

*难度提示：易 | 相关规范方向：23.501 vs 23.401（架构对比）*
