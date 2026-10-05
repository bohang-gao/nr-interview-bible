---
title: PDCP 丢包处理与 SDU 丢弃定时器
chapter: 4
difficulty: 中
frequency: 中
tags: [PDCP, discardTimer, 丢包]
---

## 一句话答案

PDCP 的 SDU 丢弃定时器（discardTimer）为每个新到的 SDU 启动：超时仍没成功发出的包直接丢弃不再重传，这是"宁可丢包不发垃圾"的时延保障机制；配合 UM 承载的"过期即丢"与 AM 承载的受控重传，PDCP 把业务时延控制在 QoS 预算内。丢包在 PDCP 的处理还包括重排序窗口外的旧包释放、重建时的已发未确认包按配置丢弃或前转。

## 详细展开

**discardTimer 机制**：

1. **启动点**：SDU（含关联的 PDCP 头/加密处理前数据）从上层到达 PDCP 传输实体时，启动其专属 discardTimer。
2. **到期动作**：定时器到期且该 SDU 未完全发出（未收到对 AM 的成功确认/未完成对 UM 的传输）→ 丢弃该 SDU 及其关联重传缓存；AM 模式下还会向 RLC 指示放弃对应重传。
3. **取值**：从几十毫秒到秒级可选（按 5QI/业务配置）；语音类取短（保证播放节拍），文件传输类取长（尽量成功）。

**与其他丢包场景的衔接**：

| 场景 | 处理 |
|---|---|
| 丢弃定时器超时 | 主动丢弃，不计为无线层失败，而是"业务过期" |
| PDCP 重建/切换 | 已成功发出的包正常处理；重建时未确认数据按配置执行"重建即释放重排序并递交"或经前转/SCG 机制转移；UM DRB 重建通常丢未收全的包 |
| 重排序窗口超时（t-Reordering） | 窗口外旧 SN 包视为丢失，触发按序递交把后续包放行，避免队头阻塞 |
| RLC AM 达最大重传 | 上抛触发 RLF/重建，属"链路级失败"而非 PDCP 自主丢包 |

**设计意义**：

1. **时延有界**：任何包的空口停留时间被 discardTimer 硬性封顶，超时即出队，防止积压雪崩拖垮整条承载——对 URLLC/语音是生命线。
2. **资源保护**：过期数据不值得占用调度资源，丢弃后 MAC 侧 BSR 缓存相应减少，避免调度器为"废包"分配资源。
3. **与 5QI 联动**：discardTimer 是 5QI 参数（如 PDB，Packet Delay Budget）落到空口的执行抓手——PDB 大致对应"discardTimer + 处理余量"的设计。

**面试记忆**：PDCP 层"丢包三兄弟"——discardTimer 主动丢、t-Reordering 窗口外放行（等效丢旧包）、重建/切换按规则弃或转；链路真死了是 RLC/RLF 的管辖范围。

## 关联考点

- [PDCP 重排序与按序递交（含重建/切换场景）](ch04-q006-pdcp-reordering.md)
- [RLC UM 与 VoNR 语音承载的适配](ch04-q036-rlc-um-vonr.md)
- [PDCP 层主要功能与 PDCP SN 长度选择](ch04-q005-pdcp-functions-sn.md)
- [RLC AM 的重传与状态 PDU（注意 NR 无重分段）](ch04-q011-rlc-am-retransmission.md)

## 面试追问

- **discardTimer 超时的包在 AM 模式下还会重传吗？** —— 不会：到期即从 PDCP 与 RLC 的缓存中放弃，即使 RLC 层还在重传对应数据也会被指示丢弃；AM 的可靠性让位于业务的时效性。
- **discardTimer 与 5QI 的 PDB 什么关系？** —— PDB 是端到端时延预算（如语音 100 ms），discardTimer 是空口段内"单包最长存活时间"的执行参数，网络按 PDB 减去传输/处理开销配置 discardTimer，两者联动。
- **重建时 PDCP 缓存里的数据怎么处理？** —— 已完成加密未发出的按目标节点是否前转决定：切换中通常经数据前转保持连续性；UM DRB 或无前转条件时直接释放，表现为可感知的少量丢包，这也是切换质量评估的关注点。
