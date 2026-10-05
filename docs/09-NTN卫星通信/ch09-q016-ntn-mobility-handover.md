---
title: NTN 的移动性管理：无距离依赖切换与卫星间切换
chapter: 9
difficulty: 难
frequency: 中
tags: [NTN, 移动性, 切换]
---

## 一句话答案

NTN 的移动性有三层：UE 移动（可忽略或缓慢）、卫星移动（主导，LEO 过顶数分钟即换星）、覆盖移动（波束扫过地面）；R17 通过"基于星历的条件/预测式切换"和"取消距离相关触发、改用时频位置辅助测量"适配，38.821 指出基于星历+UE 位置可估算目标 gNB 的 TA 从而支持 RACH-less 切换，并研究无测量报告的条件切换；卫星间切换（inter-satellite HO）按 earth-fixed/earth-moving 小区设计分别表现为"gNB 内波束接力"或"gNB-DU 间切换"。

## 详细展开

**为什么地面切换机制在 NTN 失灵**：

1. **距离阈值失效**：地面网"UE 远离基站→信号衰减"的几何在卫星下反转——UE 静止也会因卫星过顶经历"仰角从低到高再降低"的信号起伏，距离/位置触发的切换逻辑不再可靠；
2. **信号变化平缓**：大波束重叠区大（38.821 §7.3.2.1.3 "Cell overlap and reduced signal strength variation"），传统 A3 事件的差值曲线平缓，迟滞与触发时间需重新设计；
3. **切换时延容忍**：长 RTT 让测量报告→切换命令的往返占数毫秒到数百毫秒，普通切换在快速过顶场景可能来不及。

**R17 的机制组合**：

1. **星历辅助测量**：SIB19/NTN-NeighCellConfig 广播邻区（邻卫星）星历与公共 TA，UE 在 IDLE/INACTIVE/CONNECTED 都可基于时间+位置预判邻小区可用窗口，配置测量时附带"测量有效性"约束（38.821 §7.3.2.1.2 Measurement Validity：按星历确定测量窗口）。
2. **条件切换类增强（CHO/无测量触发）**：38.821 §7.3.2.2 讨论条件触发与免测量报告的切换，让 UE 提前拿到目标小区配置，到达触发条件（时间/位置/事件）即执行，规避 RTT 拖延。
3. **RACH-less 切换**：38.821 明确"Based on satellite ephemeris and UE location, the UE can estimate the required TA value of the target gNB enabling the UE to perform RACH-less handover"——UE 算好目标小区定时直接发 PUSCH，省去随机接入往返，对长时延场景收益显著。
4. **TA/注册区设计**：23.501 对 moving cells 要求 TA 地面静止（earth-stationary TA），注册区管理不随卫星移动抖动；N2/NG 侧复用既有移动性框架。

**卫星间切换的两条路径**：

- **earth-fixed 小区**：固定小区由前后卫星接力服务，UE 感知"小区不变"，波束交割对 UE 透明（gNB 内配置更新）；
- **earth-moving 小区**：UE 依次经历不同卫星的小区，是真实 inter-satellite HO，走 Xn（同 CU 或跨 CU）或 NG 切换；再生星座下还可以是星间 Xn over ISL（38.821 §8.4.3.2）。

**规范依据**：TR 38.821 §7.3（移动性增强）、§8.4.3（Inter-Satellite Xn）；TS 23.501（卫星接入 TA 设计）

## 关联考点

- 小区类型决定切换行为：[小区设计](./ch09-q013-earth-fixed-vs-moving-cells.md)
- 随机接入与星历辅助：[随机接入](./ch09-q011-random-access-ntn.md)
- 馈电切换（另一维度的连续性）：[馈电切换](./ch09-q012-feeder-link-switchover.md)
- 星历与邻区准备：[卫星星历](./ch09-q006-satellite-ephemeris.md)

## 面试追问

- **什么叫"无距离依赖"？** —— 要点：切换触发不再依赖 UE 与网络点的距离/信号单调关系，改由星历几何（时间/位置/仰角窗口）驱动；信号测量仍保留但仅作辅助与确认。
- **为什么 NTN 偏好 RACH-less 切换？** —— 要点：常规切换要在目标小区做随机接入（多一轮长 RTT 往返），星历+位置让 UE 自算目标 TA，直接同步上行业务，省时延也省 PRACH 资源。
- **测量报告还有用吗？** —— 要点：有用但角色变化——从"发现邻居"退到"验证链路质量/触发确认"；邻居发现由星历广播完成，测量有效性按卫星几何窗口限定。
