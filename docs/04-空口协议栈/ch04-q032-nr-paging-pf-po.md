---
title: NR 寻呼机制与 PF/PO 的计算
chapter: 4
difficulty: 难
frequency: 中
tags: [寻呼, DRX, PF, PO]
---

## 一句话答案

寻呼让 IDLE/INACTIVE 的 UE 在不持续监听的情况下不错过下行业务：网络按 UE 标识算出寻呼帧（PF, Paging Frame）与寻呼时机（PO, Paging Occasion），UE 只需在自己的 PF/PO 上按 PDCCH 监听醒来收 P-RNTI 加扰的 DCI，被叫时再发随机接入响应业务。PF 是一个无线帧，PO 是其中的一个 SS/PBCH 块对应监测时机，计算由 SIB1 广播参数与 UE ID 共同决定。

## 详细展开

**基本参数**（均来自 SIB1/servingCellConfigCommon 类广播或专用配置）：

- `defaultPagingCycle`（或专用 `pagingCycle`）：寻呼 DRX 周期 T，单位无线帧，取值 320/640/1280/2560 帧。
- `nAndPagingFrameOffset`（PF 偏移 PF_offset 与 N 参数）：决定 PF 的分布密度，如 halfT/T/quarterT/eighthT 对应 N = 1/2/1/4/8。
- `ns`：一个 PF 内的 PO 数量（取值 4/8/16/32），每个 PO 对应一个 SSB。
- `pagingGroupNumber`：按 SSB 的 PO 分组粒度（后续版本引入，简化计算用 pg 与 i_s 关联）。

**计算方法（38 系列通识版）**：

```
PF = (T div N) × UE_ID mod N + offset × N
PO = 按 PF 内 SSB 索引映射：UE 用 UE_ID mod ns（或 mod pg）选出自己监听的 SSB/PO
```

- UE_ID 用 5G-S-TMSI 中的 32 位部分（ mod 1024 参与帧号计算）。
- PF 给出 SFN，PO 给出该帧内第几个 SSB 对应的 PDCCH 监测时机。
- i_s 与（PF 内 SSB 数、UE_ID、ns）相关，规范按表映射——具体表号不背诵，面试说出"由 SSB 索引与 UE_ID 取模映射"即可。

**UE 侧行为**：每个 DRX 周期只在对应 PO 醒来，解码 P-RNTI 加扰的 DCI 1_0；有寻呼则按 PDSCH 指示读取寻呼消息，消息里匹配自己的 full-I-RNTI/S-TMSI 才响应；INACTIVE 的 RAN 寻呼计算方式相同，只是发起方是 gNB、覆盖 RNA。

**与 LTE 的主要差异**：NR 的 PO 以 SSB 为锚（波束扫描下每个 PO 天然对应一个发送波束方向），LTE 按子帧；NR 引入 paging early indication（PEI，DCI 2_7/PS-RS）提前告知本 PO 是否有寻呼，进一步省电。

## 关联考点

- [eDRX 扩展寻呼周期与功耗优化](ch04-q033-edrx-extended-paging.md)
- [RRC INACTIVE 与 LTE IDLE 的区别及 RNA 概念](ch04-q022-rrc-inactive-vs-lte-idle.md)
- [数据到达触发的连接建立全链路（service request 视角）](ch04-q037-service-request-mob-data.md)

## 面试追问

- **为什么寻呼要用 S-TMSI 取模而不是固定位置？** —— 把海量 UE 均匀打散到不同 PF/PO，避免所有 UE 在同一时刻醒来造成寻呼信道拥塞与信令风暴；取模使分配伪随机且可复现（网络与 UE 各算一致）。
- **PEI 的作用是什么？** —— 寻呼提前指示让 UE 在真正醒来前先收一条极短指示：本 PO 无寻呼就直接回去睡，减少不必要的 PDCCH 盲检与射频开启时长，是 R17 省电特性之一。
- **T 取大取小各有什么代价？** —— T 小→被叫时延小、但 UE 醒得频繁耗电高、寻呼资源开销大；T 大→省电但呼叫建立时延增加；网络按业务特征（语音终端偏小周期，IoT 偏大周期）权衡配置。
