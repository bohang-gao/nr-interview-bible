# MIMO 与波束管理

本章覆盖 massive MIMO、波束赋形与波束管理、准共址（QCL）、CSI 反馈等 NR 多天线技术要点。

<!-- QUESTIONS-TOC:BEGIN -->
- [什么是 Massive MIMO？相对 4G MIMO 有哪些演进点？](/03-MIMO与波束管理/ch03-q001-massive-mimo-definition) — 难度易 · 频率高 · Massive MIMO / 多天线
- [64T64R AAU 中通道数、端口数与流数是什么关系？](/03-MIMO与波束管理/ch03-q002-channel-port-layer) — 难度中 · 频率高 · Massive MIMO / AAU
- [模拟、数字与混合波束赋形的结构与成本权衡](/03-MIMO与波束管理/ch03-q003-analog-digital-hybrid) — 难度中 · 频率高 · 波束赋形 / AAU
- [波束赋形增益与阵列孔径、阵元数的关系](/03-MIMO与波束管理/ch03-q004-array-aperture-gain) — 难度中 · 频率中 · 波束赋形 / 天线原理
- [NR 波束管理整体流程是怎样的？](/03-MIMO与波束管理/ch03-q005-beam-management-flow) — 难度中 · 频率高 · 波束管理 / 波束赋形
- [P1/P2/P3 波束过程分别解决什么问题？](/03-MIMO与波束管理/ch03-q006-beam-p1-p2-p3) — 难度中 · 频率高 · 波束管理 / CSI
- [QCL 的四种类型及对应参数含义](/03-MIMO与波束管理/ch03-q007-qcl-types) — 难度中 · 频率高 · QCL / 波束管理
- [TCI 状态的配置与激活机制（RRC / MAC CE / DCI）](/03-MIMO与波束管理/ch03-q008-tci-activation) — 难度难 · 频率高 · TCI / QCL / 波束管理
- [QCL Type D 在波束指示中的应用实例](/03-MIMO与波束管理/ch03-q009-qcl-type-d-example) — 难度中 · 频率高 · QCL / TCI / 波束管理
- [波束失败检测 BFD 与候选波束 CBF 的判定条件](/03-MIMO与波束管理/ch03-q010-bfd-cbf-criteria) — 难度难 · 频率中 · 波束失败 / BFR
- [波束失败恢复 BFR 的完整流程](/03-MIMO与波束管理/ch03-q011-bfr-procedure) — 难度难 · 频率中 · 波束失败 / BFR / 随机接入
- [CSI 反馈 Type I 与 Type II 码本有什么差异？](/03-MIMO与波束管理/ch03-q012-csi-type1-type2) — 难度中 · 频率高 · CSI / 码本 / 波束赋形
- [PMI 预编码矩阵指示的选择逻辑](/03-MIMO与波束管理/ch03-q013-pmi-selection) — 难度中 · 频率高 · CSI / 码本 / 波束赋形
- [Rank 自适应 RI 与传输层数怎么选？](/03-MIMO与波束管理/ch03-q014-rank-adaptation-ri) — 难度中 · 频率高 · CSI / 多天线 / 波束赋形
- [MU-MIMO 的配对条件与配对后干扰抑制](/03-MIMO与波束管理/ch03-q015-mu-mimo-pairing) — 难度难 · 频率高 · MU-MIMO / 调度 / 波束赋形
- [SU-MIMO 与 MU-MIMO 之间的切换依据是什么？](/03-MIMO与波束管理/ch03-q016-su-mu-switching) — 难度中 · 频率中 · MU-MIMO / 调度 / 波束赋形
- [SRS 如何用于上行波束管理与信道互易性估计？](/03-MIMO与波束管理/ch03-q017-srs-beam-reciprocity) — 难度中 · 频率高 · SRS / 波束管理 / 互易性
- [TDD 信道互易性与 FDD 预编码获取的差异](/03-MIMO与波束管理/ch03-q018-tdd-fdd-reciprocity) — 难度难 · 频率高 · 互易性 / 波束赋形 / FDD
- [天线校准的作用是什么？校准误差会带来哪些影响？](/03-MIMO与波束管理/ch03-q019-antenna-calibration) — 难度中 · 频率中 · 天线校准 / 互易性 / 波束赋形
- [垂直维赋形 FD-MIMO 与立体覆盖](/03-MIMO与波束管理/ch03-q020-fd-mimo-vertical-beamforming) — 难度易 · 频率高 · FD-MIMO / 波束赋形 / 覆盖
- [广播波束与业务波束的权值差异](/03-MIMO与波束管理/ch03-q021-broadcast-traffic-beam-weights) — 难度中 · 频率高 · 广播波束 / 业务波束 / 波束赋形
- [天线权值规划（方位角/下倾/波束宽度）对覆盖的影响](/03-MIMO与波束管理/ch03-q022-antenna-weight-planning) — 难度中 · 频率中 · 网优 / 权值规划 / 覆盖
- [交叉极化 ±45° 天线与极化分集增益](/03-MIMO与波束管理/ch03-q023-cross-polarized-antenna) — 难度中 · 频率中 · 极化 / 分集 / 天线
- [相位噪声对 FR2 高阶调制的影响与 PTRS 配合](/03-MIMO与波束管理/ch03-q024-ptrs-phase-noise-fr2) — 难度难 · 频率中 · PTRS / 相位噪声 / FR2
- [1024QAM 对信道质量、设备与部署的要求](/03-MIMO与波束管理/ch03-q025-1024qam-requirements) — 难度中 · 频率中 · 1024QAM / 调制 / 热点容量
- [波束对应关系 beam correspondence 与接收波束训练](/03-MIMO与波束管理/ch03-q026-beam-correspondence) — 难度难 · 频率高 · 波束对应 / 波束管理 / QCL
- [多面板终端 multi-panel 的发送/接收选择](/03-MIMO与波束管理/ch03-q027-multi-panel-ue) — 难度难 · 频率低 · 多面板 / FR2 / 波束管理
- [模拟波束切换时延及其对调度的影响](/03-MIMO与波束管理/ch03-q028-analog-beam-switching-latency) — 难度中 · 频率低 · 模拟波束 / 波束切换 / 调度
- [空分复用速率计算（多流峰值速率手算题）](/03-MIMO与波束管理/ch03-q029-spatial-mux-rate-calc) — 难度难 · 频率高 · 空分复用 / 峰值速率 / 手算
- [多天线容量增益估算（对比 2T2R/4T4R/64T64R）](/03-MIMO与波束管理/ch03-q030-mimo-capacity-gain) — 难度中 · 频率高 · 容量增益 / Massive MIMO / 手算
- [AI 波束管理（R18 方向）与波束预测思想](/03-MIMO与波束管理/ch03-q031-ai-beam-management) — 难度难 · 频率低 · AI / 波束管理 / R18
- [RIS 智能超表面的概念与应用前景](/03-MIMO与波束管理/ch03-q032-ris-concept) — 难度中 · 频率低 · RIS / 新技术 / 覆盖增强
- [CSI-RS 波束与 SSB 波束的对应关系](/03-MIMO与波束管理/ch03-q033-csirs-ssb-beam-mapping) — 难度中 · 频率中 · CSI-RS / SSB / 波束管理
- [时变信道下的信道老化与预编码更新](/03-MIMO与波束管理/ch03-q034-channel-aging-precode-update) — 难度难 · 频率中 · 信道老化 / 预编码 / 时变信道
- [MIMO 相关常见手算/画图题的答题模板](/03-MIMO与波束管理/ch03-q035-mimo-calc-templates) — 难度中 · 频率中 · 手算模板 / 答题技巧 / 面试
<!-- QUESTIONS-TOC:END -->
