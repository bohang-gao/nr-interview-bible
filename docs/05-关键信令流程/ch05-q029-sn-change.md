---
title: SN change 辅节点变更的触发与流程
chapter: 5
difficulty: 难
frequency: 中
tags: [SN change, 辅节点变更, EN-DC]
---

## 一句话答案

SN change（辅节点变更）指 UE 的辅节点从旧 SN 切换到新 SN，本质是"旧 SN 释放 + 新 SN 添加"的组合流程，由 MN 全程协调。典型触发是 NR 侧移动性测量显示另一 gNB 的小区更优、旧 SN 负载调整或故障；流程含 Xn/X2 上的 SgNB Addition Request（对新 SN）与 SgNB Release（对旧 SN），空口一次 RRC 重配置同时下发新 SCG 配置并删除旧 SCG，关键点在于数据前转与承载路径（GTP-U 端点）向新 SN 重锚，保证业务连续。

## 详细展开

**1. 触发场景**

- **NR 侧移动性**：UE 在 NR 覆盖内移动，SgNB 间测量（NR 内事件如 A3/A5 对 SN 小区）显示新 gNB 更优——最常见；
- **负载/策略**：旧 SN 过载或运营商策略要求迁移；
- **异常兜底**：旧 SN 故障、SCG 失败后的恢复性变更。

**2. 完整流程（EN-DC，MN 协调）**

1. **测量与判决**：SN（或 MN）收集 NR 测量结果，MN 决定变更目标 SN；
2. **新 SN 准备**：MN → 新 SN 发 **SgNB Addition Request**（携带 UE 能力、密钥衍生输入、测量结果、承载信息），新 SN 接纳并回 ACK（含新 SCG 配置容器与数据前转地址）；
3. **旧 SN 释放准备**：MN → 旧 SN 发 **SgNB Change Required**（或组合的 Change Request），旧 SN 回应前转参数（Xn/X2 地址、SN Status Transfer 要求）；
4. **空口重配置**：MN 经一条 RRCConnectionReconfiguration 下发新 SCG 配置（含新 PSCell 专用随机接入配置），同时指示删除旧 SCG；
5. **UE 接入新 SN**：UE 脱离旧 PSCell，在新 PSCell 上发起 CFRA 随机接入，回重配置完成消息；
6. **路径重锚**：数据前转（旧 SN → 新 SN，必要时经 MN 中转）+ SN Status Transfer（PDCP 序列号状态）；
7. **清理**：MN 通知旧 SN 释放完成，旧 SN 释放上下文；用户面下行路径按承载类型切换到新 SN（SCG bearer）或维持 MN（split bearer 数据面在 MN 分发）。

**3. 与锚点更换的区别**

| 维度 | SN change | 锚点（MN）更换 |
|---|---|---|
| 变更对象 | 辅节点（NR 侧） | 主节点（LTE eNB，EN-DC 下） |
| 用户面影响 | NR 承载路径重锚，MCG 承载不动 | 全部承载经新锚点重建路径 |
| NAS 影响 | 无 | 无（但信令面路径全换） |
| 触发频率 | 高（NR 内移动常态） | 低（跨 eNB 移动才触发） |

**4. 业务连续性保障**

- 前转 + 序列号状态转移保证 SCG 承载数据不丢不乱；
- MCG/split 承载的 MN 侧部分全程不受影响；
- 对 NAS 层完全透明，UE 不感知节点变化。

## 关联考点

- 锚点更换：[SgNB 变更与锚点更换的触发场景](../01-无线基础与演进/ch01-q019-sgnb-change-mnb-change.md)
- SN 添加：[SN Addition 辅节点添加流程与信令](ch05-q027-sn-addition.md)
- PDCP 顺序保障：[PDCP 重排序与按序递交（含重建/切换场景）](../04-空口协议栈/ch04-q006-pdcp-reordering.md)

## 面试追问

- **SN change 期间 split bearer 的 MN 侧数据会不会中断？** —— 要点：不会。split bearer 的 MN 分支全程保持，变更只影响 SCG 分支；PDCP 在 MN 侧（EN-DC 的 split bearer PDCP 位于 MN），MN 控制两分支的数据分发与重定向，前转从旧 SN 的缓存补齐即可。
- **SN change 和 NR 内 Xn 切换在信令上最像的地方是什么？** —— 要点：都遵循"准备（资源+容器）→ 执行（空口重配置+随机接入）→ 完成（前转+路径更新）"三段式；区别仅在于 SN change 由 MN 居中协调且嵌在双连接信令体系（SgNB Addition/Release）内，而 Xn 切换是 gNB 间直接协商。
- **为什么 SN change 对 NAS 透明？** —— 要点：NAS 连接终结在 UE 与 AMF 之间，SN 只承载 AS 层数据面/部分控制面；MN 作为 NAS 终结点（EN-DC 下 NAS 走 LTE），SN 变更不触及 NAS 层任何实体，UE 无需重新注册。
