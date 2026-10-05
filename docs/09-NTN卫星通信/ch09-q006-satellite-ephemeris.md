---
title: 卫星星历（ephemeris）与星历有效期的概念
chapter: 9
difficulty: 中
frequency: 高
tags: [NTN, 卫星, 星历]
---

## 一句话答案

星历（ephemeris）是描述卫星轨道位置随时间变化的一组参数，UE 用它结合自身位置推算定时提前、多普勒频移和可见性；R17 在 SIB19 的 NTN-Config 中广播星历（EphemerisInfo 支持 TLE 或状态向量两种格式），并配套纪元时间（epochTime）与上行同步有效期（ntn-UlSyncValidityDuration）——超过有效期 UE 必须重新获取星历才能继续上行发送。

## 详细展开

**为什么 NTN 需要给 UE 发星历**：LEO 卫星以约 7.5 km/s 移动，UE 的定时与频偏是"卫星几何"的函数；闭环命令（TA command、频偏修正）在长 RTT 下来不及跟随，唯一可行的思路是把卫星轨道信息交给 UE，让 UE 用 GNSS 定位自己后开环预计算。这就是"网络广播星历 + UE 自助计算"的设计。

**R17 的两种星历格式**（TS 38.331 EphemerisInfo）：

1. **TLE（Two-Line Element，两行轨道根数）**：经典航天格式，含偏心率、倾角、升交点赤经、平近点角等轨道根数（如 Mean anomaly M at epoch time、Step of 2.341×10⁻⁸ rad 等字段），UE 端用 SGP4 类算法外推轨道。
2. **状态向量（state vector）**：直接给某纪元时刻的位置与速度（PV），UE 用简化的轨道力学外推，实现更直接。

**三个配套参数**：

- **epochTime（纪元时间）**：星历/公共 TA 参数的参考时间点，星历参数都是"以该时刻为基准"的有效描述；TS 38.331 规定其参考点是上行时间同步参考点。
- **ntn-UlSyncValidityDuration（上行同步有效期）**：网络为星历+公共 TA 辅助信息配置的最大可用时长，超时后 UE 视上行同步失效，不能再发送上行——这是 R17 特有的"辅助信息保鲜"机制，防止外推误差累积。
- **星历邻区配置（NTN-NeighCellConfig）**：为邻卫星/邻小区提供星历与公共 TA 参数，支撑基于星历的邻区测量与切换准备。

38.821 §8.4.1.4 还指明星历可用来**预测馈电切换与移动性事件**（idle 及 connected 态），即星历不仅是物理层参数，也是移动性预测的输入。

**规范依据**：TS 38.331 NTN-Config/EphemerisInfo IE（SIB19）；TR 38.821 §8.4.1.4（Ephemeris）

## 关联考点

- 公共 TA 与 UE 位置参考：[公共 TA](./ch09-q007-common-ta-ue-location.md)
- 上行定时预补偿流程：[定时预补偿](./ch09-q009-uplink-timing-precompensation.md)
- 馈电切换预测：[馈电切换](./ch09-q012-feeder-link-switchover.md)
- R17 UE 能力新增项：[UE 能力](./ch09-q017-ntn-ue-capabilities.md)

## 面试追问

- **UE 自己能从 GNSS 信号得到卫星位置，为什么还要网络广播星历？** —— 要点：GNSS 星座（如 GPS）与 NTN 通信卫星不是同一星座，UE 的 GNSS 定位只解决"我在哪"，通信卫星"在哪"必须由 NTN 网络广播其星历（或 UE 属于能自行跟踪该卫星的专有终端，5G 场景取前者）。
- **TLE 和状态向量各有什么优缺点？** —— 要点：TLE 精度高、可长期外推但需要 SGP4 计算库；状态向量实现简单（一次外推），但外推时间越长误差越大，有效期管理更关键。
- **有效期超时会发生什么？** —— 要点：UE 停止上行发送（视为失步），需重新接收含 NTN-Config 的广播/专信令恢复同步；设计上有效期由网络按星历精度与卫星运动速度权衡设定。
