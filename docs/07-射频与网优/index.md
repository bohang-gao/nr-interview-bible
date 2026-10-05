# 射频与网优

本章覆盖 AAU 射频架构、功控、KPI 指标体系与常见现网问题排查方法，面向网络优化岗位高频考点。

<!-- QUESTIONS-TOC:BEGIN -->
- [5G 站点设备形态演进：BBU+AAU 与一体化基站](/07-射频与网优/ch07-q001-site-equipment-evolution) — 难度易 · 频率高 · 设备形态 / AAU / 基站架构
- [AAU 的内部构成：64T64R、功放与滤波器一体化](/07-射频与网优/ch07-q002-aau-internal-structure) — 难度中 · 频率高 · AAU / 功率放大器 / 滤波器 / 硬件架构
- [射频关键指标 EVM/ACLR/杂散/接收灵敏度](/07-射频与网优/ch07-q003-rf-kpis-evm-aclr-spurious) — 难度中 · 频率中 · 射频指标 / EVM / ACLR / 灵敏度
- [基站功率等级与实际发射功率](/07-射频与网优/ch07-q004-bs-power-class) — 难度易 · 频率中 · 功率等级 / 发射功率 / 覆盖
- [终端功率等级 PC1.5/PC2 与上行覆盖改善](/07-射频与网优/ch07-q005-ue-power-class-pc2) — 难度中 · 频率中 · UE功率等级 / 上行覆盖 / HPUE
- [链路预算的构成与典型 5G 链路预算计算](/07-射频与网优/ch07-q006-link-budget) — 难度难 · 频率高 · 链路预算 / 覆盖规划 / 功率余量
- [穿透损耗与室内覆盖设计（频段间差异）](/07-射频与网优/ch07-q007-penetration-loss-indoor) — 难度中 · 频率高 · 穿透损耗 / 室内覆盖 / 频段
- [阴影衰落余量与边缘覆盖率的关系](/07-射频与网优/ch07-q008-shadow-margin-coverage) — 难度难 · 频率中 · 阴影衰落 / 覆盖率 / 链路预算
- [传播模型（3GPP TR 38.901 等）的概念与用法](/07-射频与网优/ch07-q009-propagation-model-38901) — 难度中 · 频率中 · 传播模型 / 38.901 / 覆盖规划
- [上下行覆盖不平衡的原因与解决手段](/07-射频与网优/ch07-q010-ul-dl-imbalance) — 难度中 · 频率高 · 覆盖 / 上下行不平衡 / 网优
- [SUL 上下行解耦的覆盖价值](/07-射频与网优/ch07-q011-sul-coverage-value) — 难度中 · 频率中 · SUL / 上下行解耦 / 覆盖
- [功控参数体系（P0/alpha/闭环修正）与优化思路](/07-射频与网优/ch07-q012-power-control-params) — 难度中 · 频率高 · 功控 / P0 / alpha / 网优
- [天线下倾角与方位角规划原则及计算](/07-射频与网优/ch07-q013-tilt-azimuth-planning) — 难度中 · 频率中 · 下倾角 / 方位角 / 天线 / 网优
- [天线权值优化的方法与典型收益](/07-射频与网优/ch07-q014-antenna-weight-optimization) — 难度难 · 频率中 · 天线权值 / 波束赋形 / 网优
- [PCI 规划原则（冲突/混淆/模三）](/07-射频与网优/ch07-q015-pci-planning) — 难度中 · 频率高 · PCI / 规划 / 干扰
- [模三干扰的成因与优化方法](/07-射频与网优/ch07-q016-mod3-interference) — 难度中 · 频率高 · 模三干扰 / PCI / 同频干扰
- [交叉时隙干扰 CLI 与 TDD 帧同步要求](/07-射频与网优/ch07-q017-cli-cross-slot-interference) — 难度中 · 频率中 · CLI / 交叉时隙干扰 / TDD / 帧同步
- [远端干扰（大气波导）的识别与抑制](/07-射频与网优/ch07-q018-remote-interference-atmospheric-waveguide) — 难度难 · 频率中 · 大气波导 / 远端干扰 / TDD / 网优
- [邻区规划原则与 ANR 自动邻区关系](/07-射频与网优/ch07-q019-neighbor-planning-anr) — 难度易 · 频率高 · 邻区规划 / ANR / 移动性
- [PRACH 根序列规划与冲突排查](/07-射频与网优/ch07-q020-prach-planning-conflict) — 难度难 · 频率中 · PRACH / 根序列 / ZC序列 / 规划
- [5G 接入类 KPI 的定义与统计口径](/07-射频与网优/ch07-q021-access-kpi-definitions) — 难度中 · 频率高 · KPI / 接入性 / 随机接入
- [掉线率的定义与常见原因分析](/07-射频与网优/ch07-q022-drop-rate-definition-causes) — 难度中 · 频率高 · KPI / 掉线 / 保持性
- [切换成功率的口径与切换失败定位思路](/07-射频与网优/ch07-q023-ho-success-rate-troubleshooting) — 难度中 · 频率高 · KPI / 切换 / 移动性
- [PRB 利用率与小区容量评估](/07-射频与网优/ch07-q024-prb-utilization-capacity) — 难度中 · 频率中 · KPI / 容量 / PRB
- [RRC 连接数与在用户数等指标辨析](/07-射频与网优/ch07-q025-rrc-connections-vs-active-users) — 难度中 · 频率中 · KPI / 用户数 / 连接态
- [单站验证/簇优化/全网优化的流程要点](/07-射频与网优/ch07-q026-site-cluster-network-optimization) — 难度易 · 频率中 · 网络优化 / 流程 / 单站验证
- [投诉处理案例：弱覆盖问题的排查步骤](/07-射频与网优/ch07-q027-complaint-weak-coverage) — 难度易 · 频率高 · 投诉处理 / 弱覆盖 / 案例分析
- [投诉处理案例：上传速率慢的定位](/07-射频与网优/ch07-q028-complaint-upload-slow) — 难度中 · 频率中 · 投诉处理 / 上行速率 / 案例分析
- [投诉处理案例：无服务/注册失败的排查](/07-射频与网优/ch07-q029-complaint-no-service-registration) — 难度中 · 频率中 · 投诉处理 / 注册失败 / 案例分析
- [速率类问题的通用定位框架（覆盖/干扰/容量/参数四象限）](/07-射频与网优/ch07-q030-rate-issue-four-quadrant) — 难度难 · 频率高 · 速率优化 / 定位框架 / 方法论
- [载波聚合部署与 CA 激活率优化](/07-射频与网优/ch07-q031-ca-deployment-activation-rate) — 难度中 · 频率中 · 载波聚合 / 容量 / 专题优化
- [DSS 部署对 4G/5G 性能的影响与调优](/07-射频与网优/ch07-q032-dss-impact-tuning) — 难度难 · 频率低 · DSS / 动态频谱共享 / 频谱
- [基站节能特性（通道/符号/载波关断）与节能效果](/07-射频与网优/ch07-q033-energy-saving-features) — 难度中 · 频率中 · 节能 / 符号关断 / 绿色网络
- [大话务场景保障（演唱会/枢纽）优化要点](/07-射频与网优/ch07-q034-massive-traffic-scenario) — 难度中 · 频率中 · 大话务 / 场景保障 / 容量
- [高铁/高速场景的专网优化（多普勒/重叠覆盖）](/07-射频与网优/ch07-q035-highspeed-rail-doppler) — 难度难 · 频率中 · 高铁专网 / 多普勒 / 移动性
- [数字化室分的特点与优化要点](/07-射频与网优/ch07-q036-digital-indoor-system) — 难度中 · 频率中 · 数字化室分 / 室内覆盖 / 网络优化
- [700MHz 广域覆盖的特点与规划考虑](/07-射频与网优/ch07-q037-700mhz-wide-coverage) — 难度中 · 频率中 · 700MHz / 广覆盖 / 低频
- [4/5G 协同优化（互操作参数与锚点策略）](/07-射频与网优/ch07-q038-lte-nr-cooperation-anchor) — 难度中 · 频率高 · 4G/5G协同 / 互操作 / 锚点
- [网优常用工具（路测/MDT/CHR/网管话统）概览](/07-射频与网优/ch07-q039-optimization-tools-overview) — 难度易 · 频率中 · 网优工具 / 路测 / 话统
- [5G-A 时代网优的新挑战（万兆/低时延/通感）](/07-射频与网优/ch07-q040-5ga-network-optimization-challenges) — 难度难 · 频率低 · 5G-A / 通感一体 / 网络优化
<!-- QUESTIONS-TOC:END -->
