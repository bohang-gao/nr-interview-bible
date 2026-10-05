---
title: 动态 PCC 与 PCF 策略下发
chapter: 6
difficulty: 难
frequency: 中
tags: [PCF, PCC, 策略控制]
---

## 一句话答案

PCC（Policy and Charging Control）框架由 PCF 生成策略规则、SMF 负责执行与转发安装：静态规则来自签约，动态规则由 PCF 按业务事件（AF 请求、用量门限、位置变化）实时下发。SMF 把 PCC 规则翻译成 PDR/FAR/QER 装到 UPF，同时把 QoS 参数映射成 QoS flow 并经 N2/RRC 落到空口，实现"业务感知—策略决策—全栈执行"的闭环。

## 详细展开

**1. PCC 链路**

```
AF（应用功能，如 IMS/视频平台）
   ⇅ N5（Rx 类服务，业务信息：媒体带宽、流描述）
PCF  ⇄ N7 策略下发 ⇄ SMF
   ↑ N7                        ⇅ N4 规则安装
UDM（签约策略）                 UPF（执行门控/计费/QoS）
                                ⇅ N2/RRC
                                gNB/UE（空口执行）
```

- **静态策略**：签约里预置（默认 5QI、会话-AMBR），建立会话时 SMF 直接套用。
- **动态策略**：AF 经 N5 请求（如 IMS 为主叫语音申请 GBR flow），PCF 结合签约与运营商策略生成/修改 PCC 规则下发 SMF。

**2. PCC 规则的执行分解**

| 执行点 | SMF 转化结果 | 作用 |
|---|---|---|
| UPF（N4） | PDR（包检测）+ FAR（转发）+ QER（QoS 执行）+ URR（用量上报） | 按流描述匹配、限速、标记 QFI、计量 |
| 会话（NAS） | QoS flow 增删改（NAS PDU Session Modification） | 核心网侧 QoS 粒度调整 |
| 空口（AS） | gNB 经 RRC 重配建立/修改 DRB、调度权重 | 空口资源兑现 QoS |

**3. 触发动态下发的典型事件**

- AF 请求：VoNR 建立专用语音 flow、视频会议申请带宽、应用告知业务开始/结束。
- 策略计数器/用量：用户流量接近套餐门限 → 降速或提醒（PCF 主动改规则）。
- 位置/接入变化：用户漫游出区域、从 5G 切 WiFi（非 3GPP 接入）→ 策略调整。
- 签约变更：UDM 通知 PCF → PCF 重算并推送。

**4. 要点**

- SMF 是"策略中枢执行者"：向下翻译到 UPF 与空口，向上代理会话事件给 PCF。
- 动态 GBR flow 的建立/释放走 NAS 会话修改流程，体现"策略—信令—资源"联动。

## 关联考点

- 5QI 语义：[5QI 标准化取值与 GBR/非 GBR 分类](ch06-q012-5qi-gbr-non-gbr.md)
- 会话修改流程：[PDU 会话建立流程涉及的功能与接口](ch06-q008-pdu-session-establishment.md)
- 反射式 QoS（无策略下发路径）：[反射 QoS（RQA）的工作机制](../04-空口协议栈/ch04-q004-reflective-qos.md)

## 面试追问

- **静态策略和动态策略怎么共存？冲突时谁赢？** —— 要点：PCC 规则有优先级，动态规则（预定义或动态分配优先级）通常覆盖默认签约行为；SMF 合并安装时按优先级匹配，命中的规则生效；删除动态规则后回落到静态默认。
- **VoNR 从拨号到通话，PCC 链路发生了什么？** —— 要点：UE 发起 IMS 信令（5QI=5 flow）→ IMS 的 AF（P-CSCF 角色）经 N5 请求媒体授权 → PCF 下发专用 GBR 规则（5QI=1）→ SMF 建 GBR flow 并通知 gNB 建立 DRB → 通话结束 AF 通知，PCF 撤销规则释放 GBR flow。全程体现"信令 flow 与媒体 flow 分离、按需保障"。
- **PCF 挂了会怎样？** —— 要点：已有会话按已安装策略继续运行（策略驻留在 SMF/UPF）；新建会话退化为按签约静态策略执行（若无 PCF 对接能力则按默认 5QI），动态保障类业务（如 GBR 申请）不可用。生产部署 PCF 需高可用池化。

---

*难度提示：难 | 相关规范方向：23.503（PCC 框架）、29.512（Nsmf 策略交互）*
