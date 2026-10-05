---
title: NR 安全密钥体系（K 到 KgNB/KAMF 的推导链）
chapter: 4
difficulty: 难
frequency: 中
tags: [安全, 密钥, 5G-AKA]
---

## 一句话答案

5G 密钥体系是一棵以永久密钥 K 为根的层级树：AUSF/UDM 用 K 与运营商参数（SQN、AK）产出中间密钥 Kausf，SEAF 推出 Kamf 给 AMF，AMF 再推出 KgNB 下发给 gNB，gNB 继续派生各层的 RRC 加密/完整性密钥与 UP 加密密钥。核心思想是"每下沉一层就换一次密钥"，上层密钥泄露不波及下层以外域，且密钥按域隔离（CN 与 AN 各用各的）。

## 详细展开

**推导链（自根向叶）**：

```
K（USIM 与 UDM 共享的永久密钥）
  └─ Kausf（鉴权成功，AUSF 侧推导；SEAF 从 XAK/EXPO 路径获得材料）
      └─ Kamf（AMF，SEAF 推导后交付）
          ├─ Knas-int / Knas-enc（NAS 完整性/加密，AMF 内使用）
          └─ KgNB（gNB 侧根密钥，AMF 推导后经 NGAP 下发）
              ├─ Krrc-int / Krrc-enc（RRC 完整性/加密）
              ├─ Krrc 对应的 Kup-enc（UP 加密）
              └─ Kimse 等再细分到每算法/每承载
```

**关键规则**：

1. **每层隔离**：K 只在 UDM/USIM 域内；Kamf 只在 4G/5G 核心网间区分（5G 与 4G 密钥不混用，Kamf 不回推 Kausf）；KgNB 只在 gNB 使用；空口各层密钥按 FC 值（KDF 的 key derivation function 分支号）区分用途。
2. **绑定量**：KgNB 的派生会绑定 PCI（物理小区 ID）与频点（ARFCN），因此**切换到不同 PCI 的小区必然换密钥**——这是 NR 安全设计对抗 PCI 冲突重放的要点。
3. **刷新触发**：AS 安全激活、切换、Xn 切换中的上下文传递、重建、恢复等事件都会触发 KgNB 重推导；每个 KgNB 生命周期内密钥使用次数受上限约束（防止同一密钥加密过多数据）。
4. **与 LTE 对照**：LTE 是 K → Kasme → KeNB → 各层；5G 把"核心网锚"拆成 Kausf/Kamf 两级并引入归属域 AUSF 校验，提升归属网络对鉴权的控制力。

**记忆抓手**：树的形状是 K → Kausf → Kamf → {KgNB, NAS 密钥} → 空口各算法密钥；每过一道握手（鉴权/注册/激活/切换）就长出新枝，绝不跨域复用。

## 关联考点

- [AS 安全与 NAS 安全的激活时机与流程](ch04-q027-as-nas-security-activation.md)
- [切换中的密钥更新（KgNB 刷新与水平/垂直推导）](ch04-q028-handover-key-update.md)
- [PDCP 加密与完整性保护范围（AS 层哪些加密哪些不加密）](ch04-q007-pdcp-ciphering-integrity.md)
- [NAS 注册流程要点（鉴权/安全模式/注册区域更新）](../05-关键信令流程/ch05-q013-nas-registration-flow.md)

## 面试追问

- **为什么切换必须换 KgNB，而不是沿用旧密钥？** —— 一次一密原则：目标小区 PCI/频点不同，密钥派生绑定目标小区参数，旧密钥在数学上就不适用；同时限制单密钥的使用次数，降低被破解面。
- **Kamf 与 KgNB 谁泄露的危害大？** —— KgNB 只危害当前 gNB 的空口数据；Kamf 波及 NAS 信令且能继续推导新 KgNB，影响更大——所以 5G 把两者放在不同域存储，AMF 不直接把 Kamf 发给 gNB，只给推导好的 KgNB。
- **INACTIVE 挂起再恢复，密钥走什么路径？** —— 挂起时 gNB 保留 KgNB 上下文；恢复时基于该密钥做一次 NCC/nextHop 类的刷新推导出新的 KgNB 用于 Resume 后的连接，避免恢复连接沿用挂起前密钥。
