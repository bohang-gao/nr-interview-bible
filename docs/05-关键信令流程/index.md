# 关键信令流程

本章覆盖随机接入、寻呼、测量与切换、RRC 重配等 NR 关键空口信令流程，是排查现网问题的理论基础。

<!-- QUESTIONS-TOC:BEGIN -->
- [NR 小区搜索完整流程：从 SSB 检测到读取 SIB1](/05-关键信令流程/ch05-q001-cell-search-full-procedure) — 难度中 · 频率高 · 小区搜索 / SSB / SIB1
- [小区选择 S 准则的判决条件与计算](/05-关键信令流程/ch05-q002-cell-selection-s-criteria) — 难度中 · 频率高 · 小区选择 / S 准则 / RSRP
- [小区重选 R 准则与同频/异频/异系统重选](/05-关键信令流程/ch05-q003-cell-reselection-r-criteria) — 难度难 · 频率中 · 小区重选 / R 准则 / 优先级
- [重选频率优先级与重选参数的配置来源](/05-关键信令流程/ch05-q004-reselection-priority-params) — 难度易 · 频率中 · 小区重选 / 优先级 / 系统信息
- [系统信息的获取流程与有效性判断](/05-关键信令流程/ch05-q005-si-acquisition-validity) — 难度中 · 频率中 · 系统信息 / SIB1 / 有效性
- [随机接入的触发场景枚举](/05-关键信令流程/ch05-q006-ra-trigger-scenarios) — 难度易 · 频率高 · 随机接入 / RACH / 触发场景
- [CBRA 竞争随机接入四步流程（msg1–msg4 细节）](/05-关键信令流程/ch05-q007-cbra-four-step) — 难度中 · 频率高 · 随机接入 / CBRA / RAR
- [CFRA 免竞争随机接入与使用场景（切换/波束恢复）](/05-关键信令流程/ch05-q008-cfra-scenarios) — 难度中 · 频率中 · 随机接入 / CFRA / 切换
- [随机接入响应 RAR 的内容与 UL grant](/05-关键信令流程/ch05-q009-rar-content-ul-grant) — 难度中 · 频率中 · 随机接入 / RAR / UL grant
- [竞争解决失败的表现与定位](/05-关键信令流程/ch05-q010-contention-resolution-failure) — 难度难 · 频率中 · 随机接入 / 竞争解决 / 故障排查
- [两步随机接入（2-step RA）与四步流程对比](/05-关键信令流程/ch05-q011-two-step-ra) — 难度难 · 频率中 · 随机接入 / 2-step RA / MsgA
- [RRC 建立流程与建立原因值](/05-关键信令流程/ch05-q012-rrc-establishment) — 难度易 · 频率高 · RRC / RRC 建立 / 建立原因
- [NAS 注册流程要点（鉴权/安全模式/注册区域更新）](/05-关键信令流程/ch05-q013-nas-registration-flow) — 难度中 · 频率高 · NAS / 注册 / 5GC
- [5G-AKA 鉴权流程概览](/05-关键信令流程/ch05-q014-5g-aka) — 难度中 · 频率中 · 鉴权 / 5G-AKA / 安全
- [NAS 安全模式命令与激活流程](/05-关键信令流程/ch05-q015-nas-security-mode) — 难度中 · 频率中 · NAS 安全 / 安全模式 / 加密
- [Service Request 流程（寻呼响应/上行数据触发）](/05-关键信令流程/ch05-q016-service-request) — 难度中 · 频率中 · Service Request / 寻呼 / 状态迁移
- [RRC Release with suspend 与进入 INACTIVE](/05-关键信令流程/ch05-q017-rrc-release-suspend) — 难度中 · 频率中 · RRC_INACTIVE / suspend / RNA
- [RNA 更新的两种方式](/05-关键信令流程/ch05-q018-rna-update) — 难度中 · 频率低 · RNA / RRC_INACTIVE / RNA 更新
- [测量配置三要素（测量对象/报告配置/测量标识）与 GAP](/05-关键信令流程/ch05-q019-meas-config-gap) — 难度中 · 频率高 · 测量配置 / measObject / reportConfig / 测量 GAP
- [事件 A1–A6 的含义与典型使用场景](/05-关键信令流程/ch05-q020-events-a1-a6) — 难度易 · 频率高 · 测量事件 / A3 / A5 / 切换
- [事件 B1/B2 的含义与异系统测量流程](/05-关键信令流程/ch05-q021-b1-b2-events) — 难度易 · 频率高 · 测量事件 / 异系统 / B1 / B2
- [测量上报的方式（周期/事件触发）与上报内容](/05-关键信令流程/ch05-q022-meas-report-types) — 难度中 · 频率中 · 测量上报 / reportConfig / RSRP
- [Xn 接口切换的完整流程（含数据前转与路径切换）](/05-关键信令流程/ch05-q023-xn-handover-procedure) — 难度难 · 频率高 · Xn切换 / 数据前转 / 路径切换
- [NG 接口切换与 Xn 切换的差异](/05-关键信令流程/ch05-q024-ng-vs-xn-handover) — 难度中 · 频率中 · NG切换 / Xn切换 / 切换
- [条件切换 CHO 的机制与价值](/05-关键信令流程/ch05-q025-conditional-handover) — 难度难 · 频率中 · CHO / 条件切换 / 切换
- [切换失败与 RLF 的关联处理（重建/回退源小区）](/05-关键信令流程/ch05-q026-ho-failure-rlf) — 难度难 · 频率高 · 切换失败 / RLF / 重建立
- [SN Addition 辅节点添加流程与信令](/05-关键信令流程/ch05-q027-sn-addition) — 难度中 · 频率高 · SN Addition / EN-DC / SCG
- [PSCell 修改与辅节点释放流程](/05-关键信令流程/ch05-q028-pscell-modify-sn-release) — 难度中 · 频率中 · PSCell / SN Release / SCG
- [SN change 辅节点变更的触发与流程](/05-关键信令流程/ch05-q029-sn-change) — 难度难 · 频率中 · SN change / 辅节点变更 / EN-DC
- [RRC 重建立流程详解](/05-关键信令流程/ch05-q030-rrc-reestablishment) — 难度中 · 频率高 · 重建立 / RLF / SRB1
- [连接去激活流程与两侧状态保持](/05-关键信令流程/ch05-q031-connection-deactivation) — 难度中 · 频率低 · 去激活 / RRC Release / 状态保持
- [TAU 跟踪区更新与周期性 TAU](/05-关键信令流程/ch05-q032-tau-tracking-update) — 难度中 · 频率中 · TAU / 跟踪区 / 注册更新
- [波束失败恢复 BFR 的信令流程](/05-关键信令流程/ch05-q033-bfr-signaling) — 难度难 · 频率中 · BFR / 波束失败 / 恢复
- [SCG failure 流程与失败信息上报](/05-关键信令流程/ch05-q034-scg-failure-report) — 难度中 · 频率中 · SCG failure / 双连接 / 失败上报
- [NR 寻呼完整流程（核心网寻呼与 RAN 寻呼）](/05-关键信令流程/ch05-q035-nr-paging-flow) — 难度中 · 频率高 · 寻呼 / CN Paging / RAN Paging
- [EN-DC 下 NR 的测量与 B1/B2 事件使用](/05-关键信令流程/ch05-q036-endc-nr-measurement) — 难度中 · 频率高 · EN-DC / 测量 / B1 / B2
- [上行失步的判定与恢复流程](/05-关键信令流程/ch05-q037-ul-out-of-sync) — 难度中 · 频率中 · 上行失步 / 定时提前 / 重建立
- [RRC 重配置流程与失败后的回退行为](/05-关键信令流程/ch05-q038-rrc-reconfig-fallback) — 难度中 · 频率高 · RRC重配置 / 失败回退 / SRB1
- [随机接入失败的综合定位思路（案例向）](/05-关键信令流程/ch05-q039-ra-failure-troubleshooting) — 难度难 · 频率中 · 随机接入失败 / 案例分析 / 定位
- [完整呼通流程串讲（开机到建立业务）](/05-关键信令流程/ch05-q040-full-call-flow) — 难度中 · 频率高 · 呼通流程 / 注册 / 业务建立
<!-- QUESTIONS-TOC:END -->
