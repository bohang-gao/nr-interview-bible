# 空口协议栈

本章覆盖 SDAP/PDCP/RLC/MAC/PHY 各层功能、RRC 状态机、HARQ/ARQ 重传机制等 NR 空口用户面与控制面协议栈知识。

<!-- QUESTIONS-TOC:BEGIN -->
- [NR 用户面协议栈总览与各层职责](/04-空口协议栈/ch04-q001-up-stack-overview) — 难度易 · 频率高 · 协议栈 / 用户面 / SDAP / 分层
- [NR 控制面协议栈与 NAS/RRC 的分层关系](/04-空口协议栈/ch04-q002-cp-stack-nas-rrc) — 难度易 · 频率高 · 协议栈 / 控制面 / RRC / NAS
- [SDAP 层的引入与 QoS flow 到 DRB 的映射](/04-空口协议栈/ch04-q003-sdap-qos-flow-drb) — 难度中 · 频率中 · SDAP / QoS / DRB / 映射
- [反射 QoS（RQA）的工作机制](/04-空口协议栈/ch04-q004-reflective-qos) — 难度难 · 频率低 · SDAP / 反射QoS / RQA
- [PDCP 层主要功能与 PDCP SN 长度选择](/04-空口协议栈/ch04-q005-pdcp-functions-sn) — 难度易 · 频率高 · PDCP / 序列号 / 头压缩
- [PDCP 重排序与按序递交（含重建/切换场景）](/04-空口协议栈/ch04-q006-pdcp-reordering) — 难度中 · 频率高 · PDCP / 重排序 / 切换
- [PDCP 加密与完整性保护范围（AS 层哪些加密哪些不加密）](/04-空口协议栈/ch04-q007-pdcp-ciphering-integrity) — 难度中 · 频率高 · PDCP / 安全 / 加密 / 完整性保护
- [ROHC 头压缩的收益与配置](/04-空口协议栈/ch04-q008-rohc-header-compression) — 难度中 · 频率中 · PDCP / ROHC / 头压缩 / VoNR
- [PDCP duplication 的作用与适用场景](/04-空口协议栈/ch04-q009-pdcp-duplication) — 难度中 · 频率中 · PDCP / duplication / 可靠性 / URLLC
- [RLC 三种模式 TM/UM/AM 的适用承载类型](/04-空口协议栈/ch04-q010-rlc-modes) — 难度易 · 频率高 · RLC / TM / UM / AM
- [RLC AM 的重传与状态 PDU（注意 NR 无重分段）](/04-空口协议栈/ch04-q011-rlc-am-retransmission) — 难度中 · 频率中 · RLC / ARQ / 状态PDU / 重分段
- [RLC 与 MAC 的功能划分变化（相对 LTE 的取舍）](/04-空口协议栈/ch04-q012-rlc-mac-function-split) — 难度中 · 频率中 · RLC / MAC / 功能划分 / LTE对比
- [MAC 层主要功能与逻辑信道复用](/04-空口协议栈/ch04-q013-mac-functions-mux) — 难度易 · 频率高 · MAC / 复用 / 调度 / 逻辑信道
- [逻辑信道优先级 LCP 与资源分配顺序](/04-空口协议栈/ch04-q014-lcp-priority) — 难度中 · 频率高 · MAC / LCP / 调度 / 优先级
- [调度请求 SR 的配置、触发与禁止机制](/04-空口协议栈/ch04-q015-sr-config-trigger) — 难度中 · 频率高 · MAC / SR / PUCCH / 调度
- [BSR 缓存状态报告的类型与触发条件](/04-空口协议栈/ch04-q016-bsr-types-trigger) — 难度中 · 频率高 · MAC / BSR / 上行调度
- [功率余量报告 PHR 的触发与作用](/04-空口协议栈/ch04-q017-phr-trigger) — 难度中 · 频率中 · MAC / PHR / 功控 / 上行调度
- [MAC CE 的常见类型与用途](/04-空口协议栈/ch04-q018-mac-ce-types) — 难度易 · 频率中 · MAC / MAC CE / 快速控制
- [HARQ 实体与进程管理（上下行差异）](/04-空口协议栈/ch04-q019-harq-process) — 难度难 · 频率高 · HARQ / MAC / 进程数 / 上下行
- [HARQ 与 RLC ARQ 的分工协作关系](/04-空口协议栈/ch04-q020-harq-arq-split) — 难度中 · 频率高 · HARQ / ARQ / 重传 / 分层
- [RRC 三种状态及各状态下的行为差异](/04-空口协议栈/ch04-q021-rrc-three-states) — 难度易 · 频率高 · RRC / 状态机 / 连接管理
- [RRC INACTIVE 与 LTE IDLE 的区别及 RNA 概念](/04-空口协议栈/ch04-q022-rrc-inactive-vs-lte-idle) — 难度中 · 频率高 · RRC / INACTIVE / RNA / 状态机
- [RRC 状态转换流程与涉及信令](/04-空口协议栈/ch04-q023-rrc-state-transition-signaling) — 难度中 · 频率中 · RRC / 状态机 / 信令流程
- [SRB0–SRB3 的用途与差异](/04-空口协议栈/ch04-q024-srb0-to-srb3) — 难度易 · 频率高 · RRC / SRB / 信令承载
- [DRB 与 QoS flow 的映射关系（含主辅节点拆分）](/04-空口协议栈/ch04-q025-drb-qos-flow-mapping) — 难度中 · 频率中 · QoS / DRB / SDAP / 双连接
- [NR 安全密钥体系（K 到 KgNB/KAMF 的推导链）](/04-空口协议栈/ch04-q026-nr-key-hierarchy) — 难度难 · 频率中 · 安全 / 密钥 / 5G-AKA
- [AS 安全与 NAS 安全的激活时机与流程](/04-空口协议栈/ch04-q027-as-nas-security-activation) — 难度中 · 频率中 · 安全 / AS 安全 / NAS 安全
- [切换中的密钥更新（KgNB 刷新与水平/垂直推导）](/04-空口协议栈/ch04-q028-handover-key-update) — 难度难 · 频率中 · 安全 / 切换 / 密钥 / NCC
- [关键计时器 T300/T301/T310/T311 的作用](/04-空口协议栈/ch04-q029-timers-t300-t311) — 难度中 · 频率高 · 计时器 / RRC / 连接管理
- [无线链路失败 RLF 的判定条件与后续动作](/04-空口协议栈/ch04-q030-rlf-declaration-recovery) — 难度中 · 频率高 · RLF / 连接管理 / 无线链路监控
- [RRC 重建的条件、流程与 SRB0 的使用](/04-空口协议栈/ch04-q031-rrc-reestablishment-srb0) — 难度中 · 频率高 · RRC / 重建 / SRB0
- [NR 寻呼机制与 PF/PO 的计算](/04-空口协议栈/ch04-q032-nr-paging-pf-po) — 难度难 · 频率中 · 寻呼 / DRX / PF / PO
- [eDRX 扩展寻呼周期与功耗优化](/04-空口协议栈/ch04-q033-edrx-extended-paging) — 难度难 · 频率低 · eDRX / 省电 / 寻呼 / IoT
- [EN-DC 下主节点/辅节点协议栈的差异](/04-空口协议栈/ch04-q034-en-dc-mn-sn-stack) — 难度中 · 频率中 · EN-DC / 双连接 / 协议栈
- [上行免调度 CG 类型1/类型2 的配置与使用](/04-空口协议栈/ch04-q035-cg-type1-type2) — 难度难 · 频率中 · CG / 免调度 / 上行 / URLLC
- [RLC UM 与 VoNR 语音承载的适配](/04-空口协议栈/ch04-q036-rlc-um-vonr) — 难度中 · 频率中 · RLC / UM / VoNR / 语音
- [数据到达触发的连接建立全链路（service request 视角）](/04-空口协议栈/ch04-q037-service-request-mob-data) — 难度中 · 频率高 · 服务请求 / 连接建立 / NAS / 信令流程
- [PDCP 丢包处理与 SDU 丢弃定时器](/04-空口协议栈/ch04-q038-pdcp-discard-timer) — 难度中 · 频率中 · PDCP / discardTimer / 丢包
- [NR 与 LTE 协议栈主要差异总结（高频对比题）](/04-空口协议栈/ch04-q039-nr-lte-stack-diff) — 难度易 · 频率高 · 协议栈 / LTE 对比 / 总结
- [协议栈各层与空口调度资源的对应关系](/04-空口协议栈/ch04-q040-stack-layer-resource-mapping) — 难度中 · 频率中 · 调度 / 协议栈 / 资源映射
<!-- QUESTIONS-TOC:END -->
