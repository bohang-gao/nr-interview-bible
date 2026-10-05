---
title: "CSI 上报量 CQI/PMI/RI/LI/CRI 的含义与关系"
chapter: 2
difficulty: 中
frequency: 高
tags: [CQI, PMI, CSI]
---

## 一句话答案

CSI 上报是 UE 对下行信道"体检报告"的量化输出，各分量各管一个维度：信道质量指示（CQI, Channel Quality Indicator）回答"能用什么 MCS"，预编码矩阵指示（PMI, Precoding Matrix Indicator）回答"建议基站怎么加权多流"，秩指示（RI, Rank Indicator）回答"信道能并行传几层"，层指示（LI, Layer Indicator）指明 CQI 对应哪一层，CRI（CSI-RS Resource Indicator）在多波束候选中选出最优参考资源。它们不是并列选项，而是有依赖链的联合决策：RI 定秩 → PMI 在该秩下选预编码 → CQI 在选定预编码下测有效 SINR。

## 详细展开

**各分量精确定义**：

| 分量 | 内容 | 比特量级 | 依赖关系 |
|---|---|---|---|
| CRI | 选哪个 CSI-RS 资源（波束）作为上报基准 | log₂(候选数) | 上报的"坐标系" |
| RI | 推荐传输层数（1~最多 4/8 层取决于配置） | 1-3 bit | 上限由端口数与信道秩决定 |
| PMI | 该 RI 下从码本中选的预编码矩阵索引 | 数 bit~数十 bit（Type II 更大） | 依赖 RI |
| LI | CQI/RI 参考的"最优层"编号 | 1-2 bit | 依赖 RI 与 PMI |
| CQI | 在选定的 RI/PMI 下、目标误块率 10% 内可支持的最高 MCS 索引 | 4-5 bit | 最末端的"结论" |

**CQI 的准确理解（常被答错）**：CQI 不是裸的 SINR，而是"若 gNB 采用我推荐的 RI+PMI，我能正确接收的最高调制编码方案等级"（对应 4 bit 15 个等级 + 保留值），内嵌了 10% BLER 目标的映射——CQI 是经过码本假设的"条件结论"，假设变了 CQI 就变。

**三者的因果链（面试标准答法）**：

1. UE 测 CSI-RS → 估计信道矩阵，做特征分解得各层等效 SINR。
2. **RI**：判断可支持的最大独立层数（条件数/特征值决定）。
3. **PMI**：在选定 RI 下遍历码本，找最大化总容量的预编码矩阵。
4. **CQI**：在 RI+PMI 生成的等效信道上，映射到 10% BLER 的最高 MCS 等级。
5. **LI**：多层时各层 SINR 不同，标明 CQI 以哪一层为准（通常最优层）。

**单双天线/波束场景的退化**：仅 1 端口或波束赋形单流上报时 PMI/RI 可省略，只报 CQI；波束管理的 CRI 类上报则只选资源不含 CQI——上报量的组合（reportQuantity）由 RRC 显式配置。

## 关联考点

- [CSI-RS 的资源配置与用途（测量/跟踪/零功率/移动性）](/02-物理层/ch02-q030-csi-rs-config-usage)
- [CSI 反馈 Type I 与 Type II 码本有什么差异？](/03-MIMO与波束管理/ch03-q012-csi-type1-type2)
- [Rank 自适应 RI 与传输层数怎么选？](/03-MIMO与波束管理/ch03-q014-rank-adaptation-ri)
- [CSI 报告的周期/半持续/非周期触发方式](/02-物理层/ch02-q032-csi-report-triggering)

## 面试追问

- **CQI 和 SINR 有什么区别？为什么不能直接报 SINR？** —— CQI 是 SINR 经"码本假设+目标 BLER+MCS 映射"加工后的决策量；直接报 SINR 则 gNB 还得自己假设预编码并换算 MCS，接口不闭环，且不同 UE 码本假设不同，统一成 CQI 表才能跨厂商一致。
- **RI=2 但 gNB 只调 1 层，CQI 还有意义吗？** —— 有，但 gNB 应参考"1 层对应的 CQI"；协议允许 UE 对不同秩分别报 CQI（CQI for RI 与 CQI for RI=1），gNB 按实际调度秩取用。
- **LI 在什么时候有价值？** —— 多流传输中层间 SINR 相差大（如极化角度差、用户位置偏），CQI 若以最差层为准会浪费好层容量，LI 让 gNB 知道报告基于哪层、可做逐层 MCS 优化。
