---
title: RRC Release with suspend 与进入 INACTIVE
chapter: 5
difficulty: 中
frequency: 中
tags: [RRC_INACTIVE, suspend, RNA]
---

## 一句话答案

网络用带 suspendConfig 的 RRCRelease 把 UE 从 RRC_CONNECTED 释放到 RRC_INACTIVE：UE 保存完整 AS 上下文（安全密钥、配置、I-RNTI），保持 CM-CONNECTED 与 NG 连接，寻呼由 RAN 侧负责；相比释放到 IDLE，恢复时只需 RRCResume 三步即可收发数据，时延与信令开销显著降低。

## 详细展开

**1. 三个 RRC 状态对比**

| 维度 | RRC_IDLE | RRC_INACTIVE | RRC_CONNECTED |
|---|---|---|---|
| AS 上下文 | 不保存 | UE 与 gNB 保存 | 双方保存 |
| 标识 | 5G-GUTI | I-RNTI（非激活 RNTI） | C-RNTI |
| 寻呼 | 核心网寻呼（5GC 发起） | RAN 寻呼（RNA 内 gNB 发起）+ 核心网寻呼兜底 | 专用调度 |
| 移动性 | 小区重选（UE 自主） | 小区重选 + RNA 更新 | 测量切换（网络控制） |
| NG/N3 连接 | 释放 | 保持（AMF/UPF 侧上下文在） | 保持 |

**2. 释放流程**

```
gNB → UE : RRCRelease（含 suspendConfig）
           ├── rnac-Info：RNA 标识、RNA 更新相关定时器（T380）
           ├── 专用优先级（可选）
           └── 与 SIB 配置的 RACH 资源关联（恢复用）
UE       : 存上下文 → 进 INACTIVE → 按重选机制驻留
```

- suspendConfig 可由专用 RRCRelease 下发（也可在网络配置下由 UE 侧触发恢复失败后回到 IDLE）。
- gNB 侧保留 UE 上下文并把 I-RNTI 与 anchor gNB 信息登记到 RNA 内相邻 gNB（通过 Xn/X2 传递），这是 RAN 寻呼能找到 UE 的前提。

**3. 恢复流程（RRCResume）**

```
UE → gNB : RRCResumeRequest（I-RNTI + resumeMAC-I 短校验）
gNB      : 用 I-RNTI 找回上下文（本站命中或 Xn 取回）
gNB → UE : RRCResume（恢复 SRB1/安全，必要时重配）
UE → gNB : RRCResumeComplete
```

- 恢复失败（gNB 无上下文/I-RNTI 校验失败）时 gNB 回 RRCSetup 走 fallback，UE 降级为四步建立。
- 恢复可携带原因（如被寻呼、上行数据、RNA 更新）。

**4. 价值与代价**

- 价值：省去初始接入+上下文建立（对比 IDLE→CONNECTED 的完整 NAS SR 流程），小包业务时延明显降低；NG/N3 不拆，网络侧状态轻量保持。
- 代价：gNB 要长期保存上下文与 I-RNTI 映射，UE 省电效果介于 IDLE 与 CONNECTED 之间（需周期性 RNA 更新与 RAN 寻呼监听）。

## 关联考点

- RNA 更新：[RNA 更新的两种方式](ch05-q018-rna-update.md)
- Service Request：[Service Request 流程](ch05-q016-service-request.md)
- 状态机：[RRC 建立流程与建立原因值](ch05-q012-rrc-establishment.md)

## 面试追问

- **INACTIVE 与 IDLE 最本质的区别是什么？** —— 要点：网络侧是否保留连接上下文——INACTIVE 保持 CM-CONNECTED 与 NG/N3 关联，恢复走 AS 层 RRCResume；IDLE 一切从零开始，恢复需完整 NAS Service Request 流程。
- **RAN 寻呼为什么只发在 RNA 内？** —— 要点：UE 在 RNA 内移动不通知网络，网络只知道"UE 在这个 RNA 的某个小区"；RNA 内所有 gNB 同时发 RAN 寻呼（在各自的寻呼时机上），区域外则靠 RNA 更新保证 UE 位置新鲜度，兜底仍有 5GC 寻呼。
- **RRCResume 失败会怎样？** —— 要点：gNB 无该 UE 上下文（上下文老化、跨 RNA 丢失）时回 RRCSetup 走回退建立；I-RNTI 校验失败同样回退——设计上保证恢复失败不导致 UE 卡死，代价是多走一次完整建立。
