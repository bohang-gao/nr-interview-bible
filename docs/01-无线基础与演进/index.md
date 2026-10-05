# 无线基础与演进

本章覆盖 LTE→NR 演进脉络、NSA/SA 组网、EN-DC 架构与 FR1/FR2 频段，是理解 5G NR 整体设计的入门知识域。

<!-- QUESTIONS-TOC:BEGIN -->
- [5G NR 与 LTE 相比的主要设计目标与技术差异](/01-无线基础与演进/ch01-q001-nr-vs-lte-design) — 难度易 · 频率高 · 演进 / LTE / 设计目标
- [eMBB/uRLLC/mMTC 三大应用场景及各自关键指标](/01-无线基础与演进/ch01-q002-three-scenarios-embb-urllc-mmtc) — 难度易 · 频率高 · 应用场景 / eMBB / uRLLC / mMTC
- [NSA 与 SA 组网架构的区别及演进路径](/01-无线基础与演进/ch01-q003-nsa-vs-sa-evolution) — 难度易 · 频率高 · 组网 / NSA / SA
- [NSA/SA 常见部署选项 Option 3/3a/3x 与 Option 2 的差异](/01-无线基础与演进/ch01-q004-deployment-options) — 难度中 · 频率高 · 组网 / Option / NSA / SA
- [EN-DC 双连接的基本概念与整体架构](/01-无线基础与演进/ch01-q005-en-dc-architecture) — 难度中 · 频率高 · EN-DC / 双连接 / NSA
- [EN-DC 中控制面与用户面的走向（锚点与承载分拆）](/01-无线基础与演进/ch01-q006-en-dc-cp-up) — 难度中 · 频率高 · EN-DC / 控制面 / 用户面 / 承载
- [MCG bearer、SCG bearer 与 split bearer 的区别及选择](/01-无线基础与演进/ch01-q007-bearer-types) — 难度中 · 频率高 · EN-DC / 承载 / MCG / SCG
- [SCG 添加、修改、变更与失败的典型流程](/01-无线基础与演进/ch01-q008-scg-procedures) — 难度难 · 频率高 · EN-DC / SCG / 信令流程
- [FR1 与 FR2 频段范围、传播特点及典型频段号](/01-无线基础与演进/ch01-q009-fr1-fr2-bands) — 难度易 · 频率高 · 频段 / FR1 / FR2
- [中国运营商主流 5G 频段与组网策略（移动/电信/联通/广电）](/01-无线基础与演进/ch01-q010-china-operator-bands) — 难度中 · 频率高 · 频段 / 运营商 / 组网策略
- [载波聚合（CA）与双连接（DC）的区别与联系](/01-无线基础与演进/ch01-q011-ca-vs-dc) — 难度中 · 频率高 · 载波聚合 / 双连接 / CA / DC
- [LTE 与 NR 帧结构设计差异（灵活参数集与自包含子帧）](/01-无线基础与演进/ch01-q012-lte-nr-frame-structure-diff) — 难度中 · 频率高 · 帧结构 / 参数集 / 自包含子帧
- [LDPC 与 Polar 码在 NR 中的分工及相对 LTE Turbo 码的优势](/01-无线基础与演进/ch01-q013-ldpc-polar-codes) — 难度难 · 频率中 · 信道编码 / LDPC / Polar
- [NSA 终端如何驻留 LTE 并测量 NR（B1/B3 事件与系统消息配合）](/01-无线基础与演进/ch01-q014-nsa-measurement-b1-b3) — 难度难 · 频率高 · NSA / 测量 / B1事件 / EN-DC
- [NSA 语音方案：EPS fallback 与 VoLTE 的关系](/01-无线基础与演进/ch01-q015-nsa-voice-eps-fallback) — 难度中 · 频率高 · NSA / 语音 / VoLTE / EPS fallback
- [SA 语音方案：VoNR 与 EPS fallback 的对比](/01-无线基础与演进/ch01-q016-vonr-vs-eps-fallback) — 难度中 · 频率高 · SA / 语音 / VoNR / EPS fallback
- [4G/5G 互操作：EPC 与 5GC 间的切换与重选](/01-无线基础与演进/ch01-q017-4g-5g-interworking) — 难度中 · 频率中 · 互操作 / 切换 / 重选 / 4G/5G
- [N26 接口的作用与无 N26 互操作的区别](/01-无线基础与演进/ch01-q018-n26-interface) — 难度中 · 频率中 · N26 / 5GC / 互操作 / EPC
- [SgNB 变更与锚点更换的触发场景](/01-无线基础与演进/ch01-q019-sgnb-change-mnb-change) — 难度难 · 频率中 · EN-DC / SgNB 变更 / 双连接
- [5G 小区搜索与 LTE 的异同](/01-无线基础与演进/ch01-q020-cell-search-vs-lte) — 难度中 · 频率中 · 小区搜索 / SSB / 同步
- [R15/R16/R17 各版本主要特性演进（含 RedCap 与覆盖增强）](/01-无线基础与演进/ch01-q021-rel15-16-17-features) — 难度中 · 频率中 · 标准演进 / R15 / R16 / R17
- [5G-A（R18）关键方向：通感一体、AI 空口与 RedCap 增强](/01-无线基础与演进/ch01-q022-5ga-r18-directions) — 难度中 · 频率低 · 5G-A / R18 / 通感一体 / AI
- [上下行解耦（SUL 频段）的概念与应用场景](/01-无线基础与演进/ch01-q023-sul-uplink-decoupling) — 难度中 · 频率低 · SUL / 上下行解耦 / 补充上行
- [DSS 动态频谱共享原理与部署价值](/01-无线基础与演进/ch01-q024-dss-dynamic-spectrum-sharing) — 难度难 · 频率低 · DSS / 频谱共享 / 重耕
- [NSA 升级 SA 对现网设备与终端的要求](/01-无线基础与演进/ch01-q025-nsa-to-sa-upgrade) — 难度难 · 频率低 · SA 升级 / 现网改造 / 终端
- [终端能力上报与 NSA/SA 双模终端的工作模式](/01-无线基础与演进/ch01-q026-ue-capability-dual-mode) — 难度中 · 频率中 · 终端能力 / 双模终端 / UE 能力
- [5G 与 WiFi6 的竞争与互补关系](/01-无线基础与演进/ch01-q027-5g-vs-wifi6) — 难度易 · 频率中 · WiFi6 / 5G / 组网对比
- [中国 5G 共建共享策略（电联共享与移动广电共享）](/01-无线基础与演进/ch01-q028-network-sharing-china) — 难度中 · 频率中 · 共建共享 / 运营商 / 电联 / 移动广电
- [TDD 与 FDD 在 NR 中的应用差异与同步要求](/01-无线基础与演进/ch01-q029-tdd-fdd-nr-diff) — 难度中 · 频率中 · TDD / FDD / 双工 / 帧同步
- [5G 行业专网与公网的差异（组网模式与隔离方式）](/01-无线基础与演进/ch01-q030-private-network-vs-public) — 难度中 · 频率中 · 行业专网 / 网络切片 / 组网模式
<!-- QUESTIONS-TOC:END -->
