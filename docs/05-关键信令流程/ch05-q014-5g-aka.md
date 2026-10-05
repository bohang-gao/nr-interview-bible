---
title: 5G-AKA 鉴权流程概览
chapter: 5
difficulty: 中
frequency: 中
tags: [鉴权, 5G-AKA, 安全]
---

## 一句话答案

5G 主鉴权有 5G-AKA 与 EAP-AKA' 两种，默认由 AMF 发起、AUSF/UDM 协作：UDM/ARPF 生成鉴权向量（RAND、AUTN、XRES*、K_AUSF），AMF 向 UE 发 Authentication Request，UE 用 USIM 校验网络（验 AUTN）并算出 RES*，网络比对 RES* 与 XRES*（5G-AKA 的新特性是*锚点算法与归属域绑定）后完成双向鉴权，锚密钥 K_SEAF 逐级派生 NAS/AS 层密钥。

## 详细展开

**1. 5G-AKA 信令流程**

```
AMF(SEAF) → AUSF : Nausf_UEAuthentication（SUPI/SUCI）
AUSF → UDM       : 获取鉴权向量（ARPF 生成）
UDM → AUSF       : RAND, AUTN, XRES*, K_AUSF（5G 鉴权向量）
AUSF → SEAF      : RAND, AUTN, HXRES*（XRES* 摘要）, K_SEAF
SEAF → UE        : Authentication Request（RAND, AUTN）
UE（USIM）        : 验 AUTN（网络合法性）→ 算 RES*、K_AUSF
UE → SEAF        : Authentication Response（RES*）
SEAF             : 校验 HXRES*（本地比对）
SEAF → AUSF      : 上报 RES*，AUSF 与 XRES* 终局比对
AUSF → SEAF      : 确认，SEAF 推导 K_SEAF → 各层密钥
```

- **SUCI（隐藏订阅标识）**：UE 不直接发 IMSI，用归属网络公钥加密的 SUCI 上报，防 IMSI 捕获——这是 5G 相对 4G 的重要安全增强。

**2. 关键密钥层级**

```
K（USIM 根密钥）
 └ K_AUSF      ← 鉴权产出
    └ K_SEAF   ← AMF 侧锚点
       └ K_AMF
          ├ K_NAS_int / K_NAS_enc   （NAS 完整性/加密）
          └ K_gNB / K_NG-RAN *      （AS 层，经水平/垂直密钥推导）
             ├ K_RRC_int / K_RRC_enc
             └ K_UP_int / K_UP_enc
```

**3. 5G-AKA vs EAP-AKA'**

| 维度 | 5G-AKA | EAP-AKA' |
|---|---|---|
| 承载 | NAS 消息（AMF 中转） | EAP 帧（AMF 透传给 AUSF） |
| 校验位置 | SEAF 先比 HXRES*，AUSF 终局比 | AUSF 直接做 EAP 校验 |
| UE 验证网络 | AUTN 校验（归属域确认前不最终信任） | EAP-Success 由归属域签发 |
| 使用倾向 | 默认、信令少 | 部分运营商/漫游场景 |

**4. 鉴权失败处理**

- UE 校验 AUTN 失败回 Authentication Failure（如 MAC 失败/SYNCH 失败），网络可重发或判为伪网。
- 网络比对失败（RES* ≠ XRES*）拒绝接入，防伪卡。

## 关联考点

- 注册流程：[NAS 注册流程要点](ch05-q013-nas-registration-flow.md)
- NAS 安全激活：[NAS 安全模式命令与激活流程](ch05-q015-nas-security-mode.md)
- AS 安全：[NAS 注册流程要点](ch05-q013-nas-registration-flow.md)

## 面试追问

- **SUCI 解决什么问题？** —— 要点：4G 时代 IMSI 明文上行易被伪基站/侦听设备捕获；SUCI 用归属网络公钥加密订阅标识，只有归属 UDM 能解，是 5G 用户身份隐私的核心增强。
- **HXRES* 与 XRES* 为什么要分两处比？** —— 要点：SEAF（拜访地）只拿摘要 HXRES* 做快速校验，完整 XRES* 留在归属 AUSF 终局比对——拜访地无需接触完整凭据，降低泄露面。
- **5G-AKA 与 EAP-AKA' 怎么选？** —— 要点：网络在签约/漫游策略中决定，EAP-AKA' 的 EAP-Success 由归属域颁发、UE 对网络的信任建立更严格，常用于对安全要求高的漫游场景；5G-AKA 信令更少、时延更低，是多数商用网默认。
