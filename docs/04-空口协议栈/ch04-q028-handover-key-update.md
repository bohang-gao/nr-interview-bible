---
title: 切换中的密钥更新（KgNB 刷新与水平/垂直推导）
chapter: 4
difficulty: 难
frequency: 中
tags: [安全, 切换, 密钥, NCC]
---

## 一句话答案

NR 切换时不直接复用旧 KgNB，而是由源 gNB 用 NCC（Next Hop Chaining Counter，下一跳链路计数器）机制更新密钥：同源密钥向目标小区派生称"水平推导"，经 NH（Next Hop，下一跳密钥链）再派生称"垂直推导"。AMF 预先算好 NH 链交给 gNB，切换命令把新 NCC 告知 UE，UE 按同样规则独立推导出一致的新 KgNB，实现"一次一密"。

## 详细展开

**两条推导路径**：

| 类型 | 密钥材料 | 使用场景 | NCC 变化 |
|---|---|---|---|
| 水平推导（horizontal） | 当前 KgNB + 目标小区 PCI/ARFCN | 常规连续切换（X2/Xn 或站内），源 gNB 本地派生即可 | NCC 不变 |
| 垂直推导（vertical） | NH（由 Kamf 与旧材料推导的密钥链）+ 目标小区 PCI/ARFCN | 初次激活后第一次切换；或 NCC 用尽/安全策略要求时 | NCC 加 1 |

**完整流程（以 Xn 切换为例）**：

1. AMF 在初始 AS 安全激活时同时给源 gNB 下发 NH 与 NCC（初始 NCC 通常为 0，此时无 NH，第一次切换只能水平）。
2. 源 gNB 决定切换：若可水平派生（同 NCC 链上），直接用本侧 KgNB 对目标 PCI/频点做 KDF 得目标 KgNB；若需垂直（或源侧无可用 NH），向 AMF/上下文获取新 NH，NCC+1。
3. 源 gNB 把目标 KgNB 对应的 {NH/NCC, 目标 PCI} 上下文经 Xn 传给目标 gNB；目标 gNB 按同样 KDF 本地算出最终密钥。
4. 源 gNB 在 RRCReconfiguration（含 mobilityControlInfo）中带 NCC，UE 收到后依据自身持有的材料推导出相同的目标 KgNB——**UE 不直接接收密钥值，只接收 NCC**。
5. UE 在目标小区发 RRCReconfigurationComplete，该消息已用新密钥保护；目标侧校验通过即完成密钥同步。

**细节要点**：

- **绑定因子**：所有派生都绑定目标 PCI 与 ARFCN，换小区必换密钥；同频段不同 PCI 也一样。
- **NCC 的意义**：计数器同步防推导路径分歧；若 UE 侧 NCC 与网络不一致，gNB 可下发额外信令触发 UE 走 NH 链刷新。
- **与重建/恢复的衔接**：重建与 RRCResume 同样按此规则刷新 KgNB（重建请求用旧密钥完整性保护、成功后用新密钥），保证"每次 AS 安全事件后密钥新鲜"。
- **EN-DC**：SN 变更或 SN 释放/添加也会触发对应 S-KgSN 类辅密钥的推导，机制同源。

## 关联考点

- [NR 安全密钥体系（K 到 KgNB/KAMF 的推导链）](ch04-q026-nr-key-hierarchy.md)
- [AS 安全与 NAS 安全的激活时机与流程](ch04-q027-as-nas-security-activation.md)
- [RRC 重建的条件、流程与 SRB0 的使用](ch04-q031-rrc-reestablishment-srb0.md)

## 面试追问

- **UE 怎么知道该用水平还是垂直推导？** —— 由收到的 NCC 对比：若与当前 NCC 相同，用本侧 KgNB 水平派生；若 NCC 加 1，说明网络走了 NH 链，UE 从自身材料沿 NH 推导；规则由协议固定，双方结果必然一致。
- **Xn 切换时目标 gNB 怎么拿到密钥？** —— 拿不到"明文 Kamf"，源 gNB 传的是为该目标小区派生好的中间密钥上下文（含 NH/NCC），目标 gNB 用它加目标 PCI/频点完成最终 KDF；密钥最小化披露。
- **为什么第一次切换不能垂直推导？** —— AS 安全激活时下发的 NH 是"链上第一个"，其派生恰好作为激活时 KgNB 的来源；切换链上第一个可用 NH 在激活时已消耗，因此首切只能水平，之后每次消耗链上 NH 才 NCC 递增。
