---
title: NTN卫星通信
---

# NTN卫星通信

本章聚焦 R17 引入的非地面网络（NTN, Non-Terrestrial Network）：卫星轨道与架构、传播时延与多普勒补偿、定时预补偿与 K-offset、随机接入与移动性特殊设计，以及典型应用场景。

<!-- QUESTIONS-TOC:BEGIN -->
- [什么是 NTN？R17 为什么引入非地面网络？](/09-NTN卫星通信/ch09-q001-ntn-concept-r17-motivation) — 难度易 · 频率高 · NTN / 卫星 / 概念
- [NTN 弯管（transparent）与再生（regenerative）两种架构的区别](/09-NTN卫星通信/ch09-q002-transparent-vs-regenerative) — 难度中 · 频率高 · NTN / 卫星 / 架构
- [GEO/MEO/LEO 轨道特点及其对通信系统设计的影响](/09-NTN卫星通信/ch09-q003-geo-meo-leo-orbits) — 难度中 · 频率高 · NTN / 卫星 / 轨道
- [NTN 与地面 5G 的核心差异：多普勒与传播时延的量级分析](/09-NTN卫星通信/ch09-q004-doppler-delay-analysis) — 难度中 · 频率高 · NTN / 多普勒 / 时延
- [TR 38.821 的 NTN 参考场景（场景 A/B/C/D）与链路类型](/09-NTN卫星通信/ch09-q005-38821-reference-scenarios) — 难度中 · 频率中 · NTN / 卫星 / 参考场景
- [卫星星历（ephemeris）与星历有效期的概念](/09-NTN卫星通信/ch09-q006-satellite-ephemeris) — 难度中 · 频率高 · NTN / 卫星 / 星历
- [NTN 公共 TA（ta-Common）与 UE 位置参考的作用](/09-NTN卫星通信/ch09-q007-common-ta-ue-location) — 难度中 · 频率高 · NTN / 定时 / TA
- [K-offset（k_offset）的定义、用途与取值来源](/09-NTN卫星通信/ch09-q008-k-offset-definition) — 难度中 · 频率高 · NTN / 调度 / 时序
- [NTN 上行定时预补偿流程（ta-Common + 自主 TA + GNSS 位置）](/09-NTN卫星通信/ch09-q009-uplink-timing-precompensation) — 难度难 · 频率高 · NTN / 定时 / 上行同步
- [NTN 中 HARQ 的去激活/禁用与时延的关系](/09-NTN卫星通信/ch09-q010-harq-disable-ntn) — 难度中 · 频率高 · NTN / HARQ / 时延
- [NTN 随机接入的特殊考虑（长时延、波束对准与星历辅助）](/09-NTN卫星通信/ch09-q011-random-access-ntn) — 难度中 · 频率中 · NTN / 随机接入 / PRACH
- [馈电链路与用户链路及馈电切换（feeder link switchover）](/09-NTN卫星通信/ch09-q012-feeder-link-switchover) — 难度中 · 频率中 · NTN / 卫星 / 馈电切换
- [NTN 小区设计：大波束、移动波束与地球固定小区](/09-NTN卫星通信/ch09-q013-earth-fixed-vs-moving-cells) — 难度中 · 频率中 · NTN / 卫星 / 小区设计
- [NTN 的频率规划：S 频段与 MSS 频谱（n255/n256 等）](/09-NTN卫星通信/ch09-q014-frequency-planning-mss) — 难度中 · 频率中 · NTN / 卫星 / 频率
- [再生架构下的 gNB 上星部署（gNB-DU 与卫星平台）](/09-NTN卫星通信/ch09-q015-gnb-du-satellite-regenerative) — 难度难 · 频率低 · NTN / 卫星 / 架构
- [NTN 的移动性管理：无距离依赖切换与卫星间切换](/09-NTN卫星通信/ch09-q016-ntn-mobility-handover) — 难度难 · 频率中 · NTN / 移动性 / 切换
- [R17 NTN 对 UE 能力的新要求（38.306 相关 IE 概览）](/09-NTN卫星通信/ch09-q017-ntn-ue-capabilities) — 难度中 · 频率中 · NTN / UE能力 / 终端
- [NTN 直连手机（direct-to-device）的现状与挑战](/09-NTN卫星通信/ch09-q018-ntn-direct-to-phone) — 难度中 · 频率中 · NTN / 卫星 / 直连手机
- [NTN 链路预算手算：LEO 覆盖半径与路径损耗量级](/09-NTN卫星通信/ch09-q019-ntn-link-budget-leo) — 难度难 · 频率中 · NTN / 链路预算 / 卫星
- [NTN 的典型应用与商用进展（海洋/航空/应急/物联网）](/09-NTN卫星通信/ch09-q020-ntn-applications-commercial) — 难度易 · 频率中 · NTN / 卫星 / 应用
<!-- QUESTIONS-TOC:END -->
