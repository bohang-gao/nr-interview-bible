---
title: 系统信息的获取流程与有效性判断
chapter: 5
difficulty: 中
frequency: 中
tags: [系统信息, SIB1, 有效性]
---

## 一句话答案

MIB、SIB1 走周期性广播（SIB1 由 SI-RNTI 加扰的 PDCCH 调度），其余 SIB 按需可配置成广播或 on-demand（终端发 RRCSystemInfoRequest 请求）；有效性判断靠三要素：区域标签 systemInformationAreaID、SI 的生效标签 areaScope、以及 validityTimer——定时器超时或进入的区域/标签不匹配就视为过期，需重新获取。

## 详细展开

**1. 系统信息分三层**

| 层次 | 内容 | 发送方式 |
|---|---|---|
| MIB | SSB 资源、CORESET 0/SIB1 调度、小区禁止 | PBCH 固定周期广播 |
| RMSI（SIB1） | 初始接入所需最小信息：BWP、RACH 配置、其余 SI 调度/请求信息 | 周期广播，UE 必读 |
| SI（SIB2~SIB8 等） | 移动性、接入控制、 disaster/定位等 | 可广播，可 on-demand（SIB1 中指明） |

- 相同调度周期的 SIB 可打包成一个 SI 消息，在 SI 窗口内用 SI-RNTI PDCCH 调度发送；窗口按 si-SchedulingInfo 的顺序首尾相接。

**2. on-demand 获取流程**

1. 读 SIB1 中的 si-RequestConfig（确定请求消息与资源）。
2. 若配置为竞争方式：在指定 PRACH 资源发 preamble（msgA 或 msg1，取决于配置），网络收到即把对应 SI 置为广播一段时间。
3. 若配置专用方式：先完成 RRC 建立，在 UL CCCH 上发 RRCSystemInfoRequest（携带 requestedSI 列表），网络回 RRCSystemInfoResponse 后在 SI 窗口收广播。
4. 其他 SI 正常广播时终端也可直接收，不必请求。

**3. 有效性判断**

- **systemInformationAreaID + areaScope**：每个 SIB/小区带区域标签，进入不同区域标签的 POI（小区）即认为相关 SI 失效。
- **validityTimer**：on-demand 获取的 SI 启动定时器，超时未用即失效。
- 此外小区改变（含重选、切换后驻留变化）、回到覆盖、EAB/接入类参数变更（SIB 变更指示）都会触发重新确认。
- 变更通知靠寻呼（systemInfoModification）与 DCI（SIB1 中 schedulingInfoList 变更），修改周期边界生效。

## 关联考点

- SIB1 与初始接入：[初始 BWP 与 SIB1 中 BWP 配置的关系](../02-物理层/ch02-q009-initial-bwp-sib1.md)
- SI 窗口机制：[系统信息 SI window 与 on-demand SI 机制](../02-物理层/ch02-q016-si-window-on-demand.md)
- 小区搜索衔接：[NR 小区搜索完整流程](ch05-q001-cell-search-full-procedure.md)

## 面试追问

- **SIB1 和其他 SIB 的获取方式为什么不同？** —— 要点：SIB1 是"钥匙"，包含其余 SI 的调度与请求配置，必须周期广播保证任意时刻可获取；其他 SIB 用得多才广播，可省空口资源。
- **终端怎么知道 SI 变更了？** —— 要点：修改周期边界前，网络在寻呼里带 systemInfoModification 指示，终端在下一个修改周期边界重新读取；SIB1 内容变化也走该机制。
- **validityTimer 与区域标签各自管什么？** —— 要点：validityTimer 管"时间维度"（on-demand SI 只保一时），区域标签管"空间维度"（跨区域即失效），两者合起来避免用过期参数接入或移动。
