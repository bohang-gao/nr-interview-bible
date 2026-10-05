---
title: NTN 公共 TA（ta-Common）与 UE 位置参考的作用
chapter: 9
difficulty: 中
frequency: 高
tags: [NTN, 定时, TA]
---

## 一句话答案

公共 TA（Common TA）是网络按波束内"参考点"算出的定时提前公共部分，覆盖"服务链路 + 馈电链路"中与 UE 位置无关的传播时延，通过 SIB19 的 ta-Common 广播；UE 侧再叠加基于自身位置算出的差分部分（UE 自主 TA），两者相加得到完整上行定时。ta-Common 由 ts 38.213 的公式 TACommon·… + ta-CommonDrift 等随时间外推，把小区内千差万别的 UE 定时简化为"公共量广播 + 差分量自算"。

## 详细展开

**为什么需要拆成两段**：NTN 中小区覆盖数百到上千公里，波束边缘与参考点的路径差可达数毫秒，基站闭环下发 TA 命令无法逐 UE 覆盖初始同步（且初始接入前根本没有 RRC 连接）。R17 的解法：

1. **公共段（网络算）**：网络知道卫星位置（星历）与波束参考点，把"参考点→卫星→网关"这段与 UE 无关的时延广播为 ta-Common（另有 ta-CommonDrift、ta-CommonDriftVariant 描述随时间的变化率，38.213 中 TACommon、TACommonDrift、TACommonDriftVariant 分别对应这三个字段，配合纪元时间 t_epoch 外推）。
2. **差分段（UE 算）**：UE 用 GNSS 得到自身位置，结合星历算出"UE→卫星"与服务链路参考点到卫星的传播时延差，再叠加卫星→网关馈电链路段的公共处理，得到 UE 自主 TA（autonomous TA）。38.306 的能力 IE 描述 UE 支持"UE autonomous TA estimation and common TA estimation"两条开环控制路径。
3. **闭环段（兜底）**：接入后网络仍可用常规 TA 命令做微调，修正预补偿残差。

**UE 位置参考的作用**贯穿全程：定时差分项、多普勒预补偿、基于星历的邻区测量与 RACH-less 切换（38.821：UE 依据星历与自身位置可估算目标 gNB 所需 TA）、位置上报（38.331 支持携带 locationTimestamp/locationCoordinate/velocityEstimate）。可以说"GNSS 定位 + 星历"是 NTN UE 的两大输入，缺一则开环机制全部失效。

初始接入前 UE 尚无专信令，因此 SIB19 中广播的公共 TA 参数（含 drift 项）正是为了让 UE 在发 PRACH 之前就能把上行定时预补到位，保证长时延下 PRACH 能落在基站接收窗内。

**规范依据**：TS 38.213 §4.2（NTN 定时调整与 TACommon）；TS 38.331 NTN-Config（ta-Common 系列）；TS 38.306（UE autonomous TA 能力）

## 关联考点

- 上行定时预补偿完整流程：[定时预补偿](./ch09-q009-uplink-timing-precompensation.md)
- K-offset 与调度时序：[K-offset](./ch09-q008-k-offset-definition.md)
- 星历与纪元时间：[卫星星历](./ch09-q006-satellite-ephemeris.md)
- 随机接入的 NTN 增强：[随机接入](./ch09-q011-random-access-ntn.md)

## 面试追问

- **公共 TA 和地面网的 TA 概念有何本质不同？** —— 要点：地面网 TA 完全由基站闭环控制（初始 TA=基于 PRACH 的测量值）；NTN 的初始 TA 变成"广播公共量 + UE 自算差分量"，闭环只兜残差——控制权从网络侧部分转移到 UE 侧。
- **ta-CommonDrift 是干什么的？** —— 要点：LEO 卫星运动导致公共传播时延随时间漂移（非静止轨道下参考点距离变化），drift 项给出线性漂移率、variant 给出漂移率的变化，让 UE 在两次广播之间也能外推，避免频繁重读 SIB。
- **UE 没有 GNSS 能用 NTN 吗？** —— 要点：R17 NTN 的定时与频偏预补偿强依赖 UE 自知位置，标准要求 NTN 终端具备 GNSS 能力（38.306 的 NTN 能力 IE 与 GNSS 支持绑定）；无定位的终端只能靠网络侧粗补偿，性能受限。
