---
title: NTN 上行定时预补偿流程（ta-Common + 自主 TA + GNSS 位置）
chapter: 9
difficulty: 难
frequency: 高
tags: [NTN, 定时, 上行同步]
---

## 一句话答案

NTN 的上行定时不是"等基站下 TA 命令"，而是 UE 主动预补偿：UE 接收 SIB19 得到星历、纪元时间、ta-Common（及 drift 项）和有效期，用 GNSS 得到自身位置，按公式算出"UE→卫星→网关"总传播时延对应的时间提前量（公共段 + 差分段），再叠加服务链路多普勒预补偿后发送上行；接入后闭环 TA 命令只修正残差，有效期超时或卫星运动导致参数失效时重新同步。

## 详细展开

**流程分解**（R17 基线，对应 38.213 §4.2 与 38.331 NTN-Config）：

1. **信息获取**：UE 解码 SIB19 的 NTN-Config，得到
   - 星历（TLE 或状态向量）+ epochTime；
   - ta-Common、ta-CommonDrift、ta-CommonDriftVariant；
   - ntn-UlSyncValidityDuration（上行同步有效期）；
   - 频偏公共预补偿参数（可选）。
2. **自身定位**：GNSS 得到 UE 位置与时间戳（38.331 要求位置带时间戳，配合星历纪元做几何解算）。
3. **几何计算**：按星历外推发送时刻的卫星位置，计算
   - 服务链路距离 → 差分时延（UE 相对波束参考点）；
   - 馈电链路距离 → 已含在公共 TA 中（网络按参考点算好）。
4. **定时合成**：上行定时 = 公共 TA（含 drift 外推）+ UE 自主差分 TA；TACommon、TACommonDrift、TACommonDriftVariant 按纪元时间差进入公式（38.213："TACommon, TACommonDrift, and TACommonDriftVariant are respectively provided by ta-Common, ta-CommonDrift, and ta-CommonDriftVariant and t_epoch..."）。
5. **发送**：PRACH/ PUSCH/PUCCH 全部按预补偿后的定时发送；频率上同时按几何多普勒做预偏。
6. **维护**：
   - 闭环：TA 命令微调（38.213 常规 TA command 机制仍适用）；
   - UE 自主更新：卫星运动 → 几何变化 → UE 持续用星历刷新自主 TA（38.306 的"open loop：UE autonomous TA estimation"能力描述此行为）；
   - 失效处理：超过 ntn-UlSyncValidityDuration、或小区重选/切换到新卫星（新 NTN-Config）→ 重新执行第 1~4 步。

**设计逻辑**：闭环控制环路的带宽受 RTT 限制（LEO RTT 十几毫秒、GEO 近 300 ms，追不上多普勒变化率与快速定时漂移），所以 NTN 把定时控制从"反馈控制"改为"前馈开环 + 反馈兜底"。TA 精度关注点从"命令量化"变为"星历精度 + GNSS 精度 + 外推时长"。

**规范依据**：TS 38.213 §4.2（定时调整与 NTN）；TS 38.331 NTN-Config/SIB19；TS 38.306（autonomous TA 能力）

## 关联考点

- 公共 TA 的含义与来源：[公共 TA](./ch09-q007-common-ta-ue-location.md)
- 星历与有效期：[卫星星历](./ch09-q006-satellite-ephemeris.md)
- 随机接入如何利用预补偿：[随机接入](./ch09-q011-random-access-ntn.md)
- K_offset 与调度时序：[K-offset](./ch09-q008-k-offset-definition.md)

## 面试追问

- **预补偿后基站侧收到各 UE 信号是对齐的吗？** —— 要点：是——每个 UE 各自把自己"推到"公共参考定时上，基站看到的对齐效果与地面网闭环 TA 一致；这正是"预补偿"命名的含义。
- **TA 命令在 NTN 里还有用吗？** —— 要点：有，用于修正星历/GNSS 误差的残差，以及卫星载荷转发引入的定时偏差；但主控权在开环，闭环只是慢速微调（TR 38.821 的 TA 维护方案讨论了开环+闭环混合）。
- **如果 UE 静止，TA 还会变吗？** —— 要点：会——LEO 卫星持续运动导致几何变化，即使 UE 静止也必须不断外推更新自主 TA；这正是 38.306 把"UE 自主 TA 估计"列为 NTN 必备能力的理由。
