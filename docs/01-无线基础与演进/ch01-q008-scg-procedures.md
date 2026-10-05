---
title: SCG 添加、修改、变更与失败的典型流程
chapter: 1
difficulty: 难
frequency: 高
tags: [EN-DC, SCG, 信令流程]
---

## 一句话答案

SCG（Secondary Cell Group，辅小区组）流程是 NSA 日常维护 NR 链路的核心信令：添加（SgNB Addition）让终端用上 NR，修改（SgNB Modification）调整 NR 资源配置，变更（SgNB Change）应对终端移出原 NR 覆盖，失败（SCG Failure）是 NR 侧链路异常后的恢复机制。四类流程都经由 MeNB 的 X2 控制面与 LTE RRC 载荷执行。

## 详细展开

**1. SgNB 添加（最常考）**

前提：终端在 LTE 上处于 RRC_CONNECTED 且安全已激活。

```
UE          MeNB                SgNB
 |  B1 测量报告 → |                 |
 |           测量结果转发/新增请求 →  |
 |            ←准入决策+NR配置容器—— |
 |  ← RRCConnectionReconfiguration|
 |     （含 NR 无线承载配置容器）    |
 |  ——随机接入 NR（无竞争 RACH）———→ |
 |            ←SgNB Reconfiguration Complete———— |
 |            ——SgNB Reconfiguration Complete→    |
```

要点：MeNB 向候选 SgNB 发 SgNB Addition Request（携带终端能力、测量结果、SCG 承载配置建议）；SgNB 准入后在应答的容器中返回 NR RRC 重配内容；MeNB 用 LTE RRC 重配消息（内嵌容器）下发给终端；终端对 NR 做无竞争随机接入并回 SgNB Reconfiguration Complete。数据面同步建立 S1-U/X2-U 隧道。

**2. SgNB 修改**

不改变 SgNB 节点本身，仅调整配置：如增加/修改 SCG 承载、变更 split 比例参数、调整 NR 测量配置。由 MeNB 或 SgNB 发起，同样经"请求—应答容器—LTE RRC 重配—完成确认"四步；若 SgNB 发起，MeNB 保留拒绝权（需 MeNB 确认）。

**3. SgNB 变更**

终端移出原 SgNB 覆盖、或原 SgNB 负载/干扰恶化时触发：

- **同 MeNB 下 SN 变更**：MeNB 向新 SgNB 发起添加（携带原 SN 上下文），成功后释放旧 SgNB；期间可通过数据前传保证无损。
- **跨 MeNB 的 SN 变更**：与 LTE 切换叠加，先完成 MeNB 切换，新 MeNB 再向目标 SgNB 发起添加，原 SgNB 与旧 MeNB 资源随后释放。

**4. SCG 失败**

NR 侧异常（SCG 无线链路失败、SCG 重配失败、SgNB 侧随机接入问题、NR 同频测量失败等）触发：

1. 终端挂起 SCG 侧行为，通过 LTE 上报 SCGFailureInformation 给 MeNB（NR 侧数据不停发——split/MCG 承载继续走 LTE）。
2. MeNB 决策：发起 SgNB 释放，或择机重新添加（可能换一个 SgNB）。
3. 若承载为 SCG bearer，失败期间该承载业务受影响；split bearer 靠 LTE 侧兜底。

**记忆框架**：四类流程共享"经 MeNB 中转 + 容器式 NR RRC"的模式；区别只在触发条件与是否换节点。

## 关联考点

- MCG/SCG/split bearer 区别：[承载类型](./ch01-q007-bearer-types.md)
- EN-DC 中控制面与用户面走向：[控制面与用户面](./ch01-q006-en-dc-cp-up.md)
- NSA 终端驻留 LTE 并测量 NR（B1/B3 事件）：[NSA 测量](./ch01-q014-nsa-measurement-b1-b3.md)
- EN-DC 双连接基本概念：[EN-DC](./ch01-q005-en-dc-architecture.md)

## 面试追问

- **SgNB 添加流程中终端为什么不走竞争随机接入？** —— 要点：MeNB 已把专用前导码（rach-ConfigDedicated）随 NR 配置下发，SgNB 预留了接入资源，属于无竞争接入，时延短且不冲突。
- **SN 变更与 MeNB 切换的先后关系？** —— 要点：跨 MeNB 场景下先做 LTE 侧切换（安全重激活、路径转换），再由新 MeNB 发起 SgNB 添加；不采用同时并发，避免两个过程的状态耦合。
- **SCG 失败与 LTE 侧 RLF 的处理有何不同？** —— 要点：SCG 失败不触发 RRC 重建——终端保持 RRC 连接（MCG 仍有效），仅上报失败信息由 MeNB 决策恢复；LTE RLF 则意味着主链路失效，必须走重建或重建立流程。
