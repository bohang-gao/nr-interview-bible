---
title: NAS 注册流程要点（鉴权/安全模式/注册区域更新）
chapter: 5
difficulty: 中
frequency: 高
tags: [NAS, 注册, 5GC]
---

## 一句话答案

5G 注册由 UE 通过 AN 消息携带 Registration Request 发起，网络依次完成：AMF 选择与上下文获取、主鉴权与一致性校验（AUSF/UDM）、NAS 安全模式命令（激活完整性保护与加密）、注册接受（分配 5G-GUTI、TAI list、注册区域）。周期性注册与移动性注册通过重新发 Registration Request（type 为 mobility/periodic updating）完成，无需重新建 RRC。

## 详细展开

**1. 完整注册流程（初始注册）**

```
UE → (RAN) → AMF : Registration Request（type=initial registration）
AMF → UE        : Authentication Request   ← 5G-AKA 鉴权
UE → AMF        : Authentication Response
AMF → UE        : Security Mode Command    ← NAS 安全激活
UE → AMF        : Security Mode Complete
AMF ⇄ UDM       : 注册、签约/接入移动性数据获取
AMF → UE        : Registration Accept（5G-GUTI、TAI List、允许 NSSAI）
UE → AMF        : Registration Complete
```

- RRC 层承载：RRCSetupComplete 携带 NAS Registration Request（初始注册走 SRB1），后续 NAS 消息走 SRB2/DRB 建立前的 SRB1。
- AMF 侧流程：初始 AMF 可能先做重定向（RAN 触发 RRC 重配到目标 AMF）。

**2. 三大要点**

1. **鉴权与一致性**：主鉴权（5G-AKA 或 EAP-AKA'）在安全激活之前完成；网络侧还有一致性校验（对 AKA 失败场景做进一步确认），防伪卡/伪网。
2. **NAS 安全模式**：Security Mode Command 指定完整性算法与加密算法（NR 从 NIA1/NIA2/NIA3 与 NEA0~NEA3 中选），从此 NAS 消息完整性必选、加密可选（NEA0 为不加密）。
3. **注册区域与 5G-GUTI**：AMF 分配 TAI list（注册区域），UE 在区域内移动不用更新；5G-GUTI 作为临时标识替代 IMSI 上行，保护隐私。周期性注册定时器（T3512）到期或移出注册区域时，UE 发起类型为 mobility/periodic updating 的注册更新。

**3. 注册类型**

| 类型 | 触发 |
|---|---|
| initial registration | 开机/从 LTE 互通初始接入 |
| mobility registration updating | 移出注册区域、TAI list 失效、能力/参数变更 |
| periodic registration updating | T3512 定时器到期（保活） |
| emergency registration | 紧急注册（无卡/受限） |

## 关联考点

- 鉴权细节：[5G-AKA 鉴权流程概览](ch05-q014-5g-aka.md)
- NAS 安全：[NAS 安全模式命令与激活流程](ch05-q015-nas-security-mode.md)
- RRC 建立：[RRC 建立流程与建立原因值](ch05-q012-rrc-establishment.md)

## 面试追问

- **注册区域（TAI list）与跟踪区是什么关系？** —— 要点：TA 是寻呼的基本单位，AMF 给 UE 分配一组 TA 构成注册区域，UE 在区域内移动无需注册更新，出区域才发 mobility updating；TAI list 的粒度是寻呼开销与更新信令的折中。
- **鉴权为什么必须在安全激活之前？** —— 要点：安全激活所需密钥（K_amf 衍生）正是鉴权向量/-anchor key 协商的产物；先鉴权拿到锚密钥，才能推导 NAS 与 AS 层密钥并开启完整性/加密。
- **周期性注册的作用是什么？** —— 要点：让网络确认 UE 仍在覆盖且可达，超时未注册则网络把 UE 标记为不可达并可能去功能化（隐式去附着），同时清理过期用户上下文。
