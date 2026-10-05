---
title: 定位架构（LMF）与常见定位方法
chapter: 6
difficulty: 中
frequency: 低
tags: [定位, LMF, URLLC, NRPPa]
---

## 一句话答案

5G 定位架构的核心是 LMF（Location Management Function，定位管理功能）：AMF 收到定位请求后选择 LMF，LMF 通过 NRPPa 类协议与 gNB 交互获取测量信息、控制 gNB 发送定位参考信号，对 UE 则经 LPP（LTE Positioning Protocol 类协议）辅助与采集测量，最终计算位置。常见方法按精度从低到高：小区级定位（CELL ID/TA）、GNSS、E-CID 增强小区识别、RTT/ AoA 多站交会、UL-TDOA 多站到达时间差、DL-TDOA 与 PRS 测量等。

## 详细展开

**1. 架构与接口**

- **LMF**：定位计算与流程控制中枢，管理定位方法选择、辅助数据下发、测量采集与位置计算；可接入 E-SMLC/SMLC 体系实现 4G/5G 联合定位。
- **AMF**：定位请求入口（来自网关移动位置中心类功能、AF 经 NEF、或 UE 自身），选择并访问 LMF。
- **gNB/ng-eNB**：提供测量（如 gNB Rx-Tx 时间差、角度）、按 LMF 配置发送/接收定位参考信号。
- **UE**：经 LPP 接收辅助数据、上报测量（如 UE Rx-Tx 时间差、PRS 参考信号时间差 RSTD）。
- 协议要点：LMF↔UE 用 LPP（ NAS 承载/经 AMF 转发），LMF↔gNB 用 NRPPa；定位请求外部来源经 NEF 能力开放。

**2. 常见定位方法与量级**

| 方法 | 原理 | 典型精度 | 依赖 |
|---|---|---|---|
| CELL ID + TA | 服务小区 + 时间提前量估距 | 数百米量级 | 无新增配置，兜底手段 |
| GNSS | 卫星定位，UE 上报 | 米级（室外） | 终端卫星接收，室内失效 |
| E-CID | 小区 ID + TA + 参考/邻区信号质量 | 数十~数百米 | 测量报告增强 |
| Multi-RTT | UE 与多站往返时间测距，多圆交会 | 米级（1~3m 量级，视部署） | 各站对齐时钟或补偿 |
| UL-TDOA | UE 发 SRS，多 gNB 测到达时间差 | 米级 | 网络侧测量，终端无感 |
| DL-TDOA | gNB 发定位参考信号（PRS），UE 测 RSTD | 米级 | UE 支持 PRS 测量 |
| AoA/AoD | 到达角/离开角测向，与测距联合 | 亚米级潜力 | 大规模天线阵（与 mMIMO 天然契合） |

**3. 工程要点**

- 精度受时钟同步（站间同步误差直接进 TDOA 误差）、几何布局（GDOP，站点相对 UE 的几何分布）、NLOS（非视距）影响显著。
- 定位参考信号（PRS, Positioning Reference Signal）在 NR 中专列配置，支持波束赋形（FR2 定位也靠它）；SRS 用于上行定位测量。
- 商用落地：UAV 监管、资产追踪、E911 类应急呼叫、工厂 AGV 调度（配合 URLLC）。

## 关联考点

- SRS 资源：[SRS 的用途与天线切换](../02-物理层/ch02-q033-srs-usage-antenna-switching.md)
- 时间提前：[TA 定时提前原理](../02-物理层/ch02-q045-timing-advance.md)
- MIMO 天线阵列：[massive MIMO 定义与阵列增益](../03-MIMO与波束管理/ch03-q001-massive-mimo-definition.md)
- 核心网 NF：[5GC 网络功能总览](ch06-q003-5gc-nf-overview.md)

## 面试追问

- **为什么 5G 把定位做成独立 NF（LMF）？** —— 要点：定位是能力型服务，算法与参考信号管理复杂度高，独立成 NF 后可独立扩容/演进（引入 AI 定位算法不动其他网元）、可多供应商混布、可经 NEF 能力开放给第三方应用——这是 SBA 思想的典型体现，也统一了 3GPP/non-3GPP 接入下的定位框架。
- **UL-TDOA 和 DL-TDOA 怎么选？** —— 要点：看终端与业务——UL-TDOA 终端无感（只需发 SRS），适合海量资产追踪/低复杂度终端，但对网络站间同步与接收处理要求高；DL-TDOA 由 UE 测 PRS，省网络侧算力、支持终端侧自定位（离线场景），但要求终端芯片支持。网络定位平台通常按终端能力协商选择，两者也可混合（Multi-RTT 兼具上下行）。
- **室内为什么定位难？怎么补？** —— 要点：室内 NLOS 与多径严重，卫星信号衰减，站点几何布局受限导致 GDOP 差。补法：加密部署（室分站/皮站提供更好几何）、利用多径指纹（AI/指纹库定位）、融合 Bluetooth/UWB/地磁等非蜂窝手段做混合定位；5G 则靠 PRS 波束赋形与高密度部署提升室内可达精度。

---

*难度提示：中 | 相关规范方向：38.305（定位架构与用例方向）、36.355/37.355（LPP 协议族）*
