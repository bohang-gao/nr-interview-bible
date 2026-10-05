---
title: NAS 安全模式命令与激活流程
chapter: 5
difficulty: 中
frequency: 中
tags: [NAS 安全, 安全模式, 加密]
---

## 一句话答案

鉴权完成后，AMF 向 UE 发 NAS Security Mode Command，指定完整性保护算法（NIA）与加密算法（NEA），UE 校验命令本身已受完整性保护后回 Security Mode Complete，此后 NAS 消息全部启用完整性保护（必选）与加密（可选）；AS 层（RRC/PDCP）安全由后续 AS Security Mode Command 单独激活，密钥从 K_AMF 推导。

## 详细展开

**1. 流程与消息内容**

```
AMF → UE : Security Mode Command
           ├── selectedNASSecurityAlgorithms（NIA/NEA）
           ├── ngKSI（密钥集标识）
           └── ABBA（防降级攻击参数，R15 特有）
UE（校验完整性 OK）
UE → AMF : Security Mode Complete（已加密+完整性保护）
```

- **算法协商**：网络按 UE 能力（注册时上报的 5G-EA/5G-IA 列表）与自身策略从高到低选择；算法集 NIA0（空完整性，仅限紧急呼叫特殊场景）/NIA1（SNOW 3G）/NIA2（AES）/NIA3（ZUC），NEA0（不加密）/NEA1~NEA3 对应同族。
- **ABBA**：5G 特有字段，把"本次协商结果"绑定进完整性校验，防止中间人降级算法。

**2. 安全激活的时序规则**

- 鉴权成功后才发安全模式命令——密钥材料（K_AMF）由鉴权产出。
- Security Mode Command 本身**已用 K_NAS_int 完整性保护**（但未加密），UE 收到先验完整性，通过才回 Complete；这一步"自保护"防伪造命令。
- Security Mode Complete 起双向全保护；此前上行消息仅明文。
- 若 UE 校验失败回 Security Mode Reject，网络可重协商或拒绝接入。

**3. NAS 安全与 AS 安全的分工**

| 层 | 命令 | 保护对象 | 密钥来源 |
|---|---|---|---|
| NAS | Security Mode Command（AMF↔UE） | NAS 信令 | K_NAS_int/enc，由 K_AMF 派生 |
| AS | AS Security Mode Command（gNB↔UE） | RRC 信令 + 用户面数据 | K_gNB，由 K_AMF 派生（水平/垂直推导） |

- 切换/重建时 AS 密钥刷新（K_gNB*），NAS 密钥不变——分层设计让移动性不影响核心网安全上下文。

**4. 实践要点**

- NEA0（不加密）是合法配置，但完整性不可关闭（NIA0 仅紧急呼叫例外）——"必完整、可选密"是 5G 原则。
- 密钥集标识 ngKSI 用于 UE 重连时匹配安全上下文，避免重复鉴权。

## 关联考点

- 鉴权流程：[5G-AKA 鉴权流程概览](ch05-q014-5g-aka.md)
- 注册流程：[NAS 注册流程要点](ch05-q013-nas-registration-flow.md)
- 协议栈安全：[RRC 建立流程与建立原因值](ch05-q012-rrc-establishment.md)

## 面试追问

- **为什么 Security Mode Command 只做完整性不加密？** —— 要点：加密密钥 K_NAS_enc 同样已具备，但命令是安全机制的"起点"，若自身加密则 UE（此时安全上下文尚未激活确认）处理链路复杂且出错难定位；业界做法是"完整性先行，Complete 之后再全加密"。
- **NAS 安全和 AS 安全为什么分两次激活？** —— 要点：两者保护对象与密钥归属不同——NAS 保护 UE 与 AMF 的非接入层信令，AS 保护 UE 与 gNB 的 RRC/用户面；gNB 是不可信程度更高的网元，AS 密钥单独派生，gNB 泄露不影响 NAS 层。
- **完整性保护为什么不能关闭？** —— 要点：完整性是防篡改/重放的最后防线，5G 安全架构强制 NAS 与 RRC 均须完整（NIA0 仅紧急呼叫等特殊场景例外）；加密可协商关闭（保护隐私为主），但信令被篡改的代价不可接受。
