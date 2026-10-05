---
title: NTN 小区设计：大波束、移动波束与地球固定小区
chapter: 9
difficulty: 中
frequency: 中
tags: [NTN, 卫星, 小区设计]
---

## 一句话答案

NTN 小区设计围绕"波束与地面的相对运动"展开：S 频段手持场景用少数大波束（半径数百公里）保证链路预算与覆盖；波束几何上分两类——移动波束（earth-moving，波束随卫星扫过地面）与地球固定小区（earth-fixed/quasi earth-fixed，通过波束指向控制让小区"贴"在地面固定位置），TS 38.300 明确支持 earth-fixed、earth-moving、quasi-earth-fixed 三种服务链路类型，选择直接影响 TA 管理、重选/切换触发逻辑和 TA 设计。

## 详细展开

**大波束（large beam）是 NTN 的基线形态**：S 频段手持 UE 的 EIRP/灵敏度有限，链路预算要求星上大口径天线集中增益，单波束覆盖直径数百公里（38.811 手持场景通识值），一颗 LEO 卫星形成数十到数百个波束的点波束簇；Ka VSAT 场景波束可以更小。波束越大，单小区用户面容量摊薄，但切换/重选频率大幅下降——这是覆盖与容量的根本权衡。

**三种小区-地面关系**（TS 38.300 service link types）：

1. **earth-fixed（地球固定）**：波束始终覆盖同一地理区域（GEO 天然如此，NGSO 靠相控阵/机械指向补偿卫星运动）。小区 ID、TA 与地面位置绑定，UE 移动才触发切换——行为最接近地面网。
2. **earth-moving（移动波束）**：波束随卫星平台运动扫过地面（固定非可转向天线的 NGSO），小区"路过"UE，切换由卫星运动而非 UE 移动触发；38.300 对应描述为"coverage area slides over the Earth surface"。
3. **quasi-earth-fixed（准地球固定）**：波束对地面固定点在一段时间内保持，随后快速跳到下一个位置；UE 可基于时间/位置做邻区测量预判（38.300："In the quasi earth fixed cell scenario, UE can perform time-based and location-based measurements on neighbour cells in RRC_IDLE/RRC_INACTIVE"）。

**设计影响逐项看**：

- **TA/公共参数**：earth-fixed 小区广播的星历+ta-Common 与固定区域绑定，参数稳定；earth-moving 小区的公共参数随时间快速变化，依赖 drift 项外推与较短的有效期。
- **移动性触发**：earth-fixed 下事件触发与地面一致（RSRP 事件）；earth-moving 下"切换频率"由星座几何决定，需要基于星历的预测式重选/切换，38.821 §7.3 的"cell overlap and reduced signal strength variation"指出卫星小区边界信号变化平缓，传统滞后参数需调整。
- **TA 设计**：移动波束下小区扫过地面，23.501 要求"TA 地面静止"（地球静止 TA）以兼容注册区域管理——即小区在动、TA 边界不动。

**规范依据**：TS 38.300（service link 类型与准地球固定小区测量）；TR 38.821 §7.3（移动性场景）；TS 23.501（moving cells 下的 TA 设计）

## 关联考点

- 轨道与波束运动的关系：[GEO/MEO/LEO 轨道](./ch09-q003-geo-meo-leo-orbits.md)
- 移动性与切换设计：[NTN 移动性](./ch09-q016-ntn-mobility-handover.md)
- 馈电切换（网络侧的"波束交接"）：[馈电切换](./ch09-q012-feeder-link-switchover.md)
- 参考场景 C1/C2、D1/D2 变体：[参考场景](./ch09-q005-38821-reference-scenarios.md)

## 面试追问

- **为什么 R17 要标准化三种小区类型而不是只留一种？** —— 要点：卫星载荷能力差异大——固定天线只能 earth-moving，相控阵可 earth-fixed；标准不限定硬件，让运营商按载荷与业务（广播 vs 宽带）选择，移动性机制覆盖三种行为。
- **earth-fixed 小区下 UE 静止就不切换了吗？** —— 要点：服务波束不变但卫星在换——同一固定小区由接力卫星先后服务（波束 handover 隐藏在小区内），UE 级切换仅在跨小区/跨 TA 时发生；这正是 earth-fixed 设计降低切换信令的原理。
- **小区边界信号变化平缓对切换参数有什么影响？** —— 要点：卫星大波束的重叠区大、路径损耗随仰角缓变，RSRP 差值曲线不如地面陡峭，固定迟滞/触发时间的地面经验值需重新标定，否则乒乓或晚切。
