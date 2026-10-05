# 组网与架构

本章覆盖 CU/DU 分离、5GC 网络功能与接口、网络切片、QoS 流等端到端组网架构知识。

<!-- QUESTIONS-TOC:BEGIN -->
- [gNB 逻辑架构：CU/DU 分离的动机与切分点](/06-组网与架构/ch06-q001-gnb-cu-du-split) — 难度中 · 频率高 · CU/DU / gNB架构 / F1
- [F1 接口与 CU-CP/CU-UP 进一步分离](/06-组网与架构/ch06-q002-f1-cucp-cuup) — 难度中 · 频率中 · F1 / CU/DU / 控制面用户面分离
- [5GC 网络功能总览（AMF/SMF/UPF/UDM/PCF/AUSF/NSSF/NRF）](/06-组网与架构/ch06-q003-5gc-nf-overview) — 难度易 · 频率高 · 5GC / SBA / 网络功能
- [AMF 与 SMF 的职责区分及协作](/06-组网与架构/ch06-q004-amf-smf-responsibilities) — 难度易 · 频率高 · AMF / SMF / 会话管理
- [UPF 的位置、作用与下沉部署（边缘计算）](/06-组网与架构/ch06-q005-upf-position-deployment) — 难度中 · 频率高 · UPF / 边缘计算 / CUPS
- [SBA 服务化架构与网络功能接口](/06-组网与架构/ch06-q006-sba-service-based-architecture) — 难度中 · 频率中 · SBA / 服务化 / 5GC
- [N2/N3/Xn 接口的作用与协议栈](/06-组网与架构/ch06-q007-ng-n3-xn-interfaces) — 难度中 · 频率高 · N2 / N3 / Xn / 接口协议栈
- [PDU 会话建立流程涉及的功能与接口](/06-组网与架构/ch06-q008-pdu-session-establishment) — 难度难 · 频率高 · PDU会话 / 会话管理 / SMF / UPF
- [网络切片 S-NSSAI 的结构与配置](/06-组网与架构/ch06-q009-snssai-structure) — 难度中 · 频率高 · 网络切片 / S-NSSAI / 切片标识
- [切片选择流程（NSSF 与 AMF 的分工）](/06-组网与架构/ch06-q010-slice-selection-nssf) — 难度难 · 频率中 · 网络切片 / NSSF / AMF选择
- [切片与 5QI/QoS 策略的关系](/06-组网与架构/ch06-q011-slice-5qi-qos) — 难度中 · 频率中 · 网络切片 / 5QI / QoS策略 / PCF
- [5QI 标准化取值与 GBR/非 GBR 分类](/06-组网与架构/ch06-q012-5qi-gbr-non-gbr) — 难度中 · 频率高 · 5QI / QoS / GBR
- [QoS flow、DRB、PDU session 的层级关系](/06-组网与架构/ch06-q013-qos-flow-drb-session) — 难度中 · 频率高 · QoS flow / DRB / PDU会话 / SDAP
- [动态 PCC 与 PCF 策略下发](/06-组网与架构/ch06-q014-dynamic-pcc-pcf) — 难度难 · 频率中 · PCF / PCC / 策略控制
- [4G/5G 融合核心网与互操作（N26 接口）](/06-组网与架构/ch06-q015-n26-interworking) — 难度中 · 频率高 · N26 / 互操作 / EPS fallback / 4G/5G融合
- [跟踪区 TA/TAI 列表与注册区设计](/06-组网与架构/ch06-q016-ta-tai-list-registration-area) — 难度中 · 频率中 · 移动性管理 / 跟踪区 / 注册区 / 寻呼
- [NFV/云化对 gNB 与核心网部署的影响](/06-组网与架构/ch06-q017-nfv-cloud-gnb-core) — 难度中 · 频率中 · NFV / 云化 / 5GC / 部署
- [MEC 边缘计算架构与 UPF 下沉的协同](/06-组网与架构/ch06-q018-mec-upf-synergy) — 难度中 · 频率中 · MEC / 边缘计算 / UPF / 低时延
- [本地分流方案（LADN 与 ULCL）](/06-组网与架构/ch06-q019-ladn-ulcl-local-traffic) — 难度难 · 频率中 · 本地分流 / LADN / ULCL / 边缘计算
- [漫游架构（home-routed 与 LBO）](/06-组网与架构/ch06-q020-roaming-home-routed-lbo) — 难度中 · 频率中 · 漫游 / home-routed / LBO / 5GC
- [O-RAN 架构概览（O-RU/O-DU/O-CU 与 RIC）](/06-组网与架构/ch06-q021-oran-architecture-ric) — 难度中 · 频率中 · O-RAN / 开源架构 / RIC / 前传
- [5G 与边缘云/云网协同的落地场景](/06-组网与架构/ch06-q022-edge-cloud-scenarios) — 难度易 · 频率中 · 边缘计算 / 云网协同 / 行业应用 / 低时延
- [网络自动化（自优化/自愈合）与意图驱动网络](/06-组网与架构/ch06-q023-network-automation-son-intent) — 难度中 · 频率低 · 网络自动化 / SON / 意图网络 / 智能运维
- [5GC 与 EPC 的核心差异总结（高频对比题）](/06-组网与架构/ch06-q024-5gc-vs-epc-diff) — 难度易 · 频率高 · 5GC / EPC / 对比 / 架构
- [控制面/用户面分离 CUPS 的思想与价值](/06-组网与架构/ch06-q025-cups-separation-value) — 难度中 · 频率中 · CUPS / 控制面 / 用户面 / 架构分离
- [EN-DC 双连接下的核心网锚定与用户面走向](/06-组网与架构/ch06-q026-endc-core-anchoring-userplane) — 难度难 · 频率中 · EN-DC / NSA / 锚点 / 用户面
- [网络切片 SLA 保障与企业专网运营](/06-组网与架构/ch06-q027-slice-sla-private-network) — 难度难 · 频率中 · 网络切片 / SLA / 企业专网 / 切片运营
- [定位架构（LMF）与常见定位方法](/06-组网与架构/ch06-q028-lmf-positioning-methods) — 难度中 · 频率低 · 定位 / LMF / URLLC / NRPPa
- [5GC 对 IoT 的支持（NB-IoT 演进路径）](/06-组网与架构/ch06-q029-5gc-iot-nbiot-evolution) — 难度中 · 频率低 · IoT / NB-IoT / mMTC / 物联网
- [运营商 5GC 建设模式与计费话单链路简述](/06-组网与架构/ch06-q030-operator-deployment-billing) — 难度中 · 频率低 · 5GC建设 / 计费 / CHF / 运营商
<!-- QUESTIONS-TOC:END -->
