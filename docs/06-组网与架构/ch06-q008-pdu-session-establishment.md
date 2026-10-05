---
title: PDU 会话建立流程涉及的功能与接口
chapter: 6
difficulty: 难
frequency: 高
tags: [PDU会话, 会话管理, SMF, UPF]
---

## 一句话答案

PDU 会话建立由 UE 发起 NAS 消息（PDU Session Establishment Request），经 gNB/AMF 转交 SMF；SMF 查签约、选 UPF、向 PCF 取策略，通过 N4 在 UPF 建立转发规则，再经 AMF/N2 指示 gNB 建立 DRB 与 N3 隧道，最后 NAS Accept 回到 UE，端到端通路打通。整个过程串联了 AMF（N1/N2 中转）、SMF（会话控制）、UPF（用户面锚点）、PCF（策略）、UDM（签约）。

## 详细展开

**1. 端到端流程**

```
① UE → gNB → AMF : UL NAS TRANSPORT 携带 PDU Session Establishment Request
                    （DNN、S-NSSAI、请求类型、PDU 会话 ID）
② AMF → SMF      : Nsmf_PDUSession_CreateSMContext（N11）
                    AMF 已按 (S-NSSAI, DNN) 选好 SMF（可经 NRF 发现）
③ SMF ⇄ UDM      : N10 取会话签约（默认 QoS、允许的 SSC mode、计费）
④ SMF ⇄ PCF      : N7 获取 PCC 规则（动态策略）
⑤ SMF → UPF      : N4 PFCP Session Establishment（下发 PDR/FAR/QER）
⑥ SMF → AMF      : Nsmf 响应，携带 N2 SM 信息（N3 隧道 UPF 端 TEID、QoS profile）
⑦ AMF → gNB      : NGAP PDU Session Resource Setup Request（N2）
⑧ gNB            : 建立 DRB（RRC 重配），完成与 UPF 的 N3 GTP-U 隧道
⑨ gNB → AMF      : PDU Session Resource Setup Response（gNB 侧隧道信息）
⑩ AMF → SMF      : 更新会话（N11），SMF 完成与 UPF 的 N4 修改
⑪ UE ← AMF ← SMF : NAS PDU Session Establishment Accept（UE IP、QoS 规则、DNN）
⑫ UE             : Registration Complete 类确认（会话级 ACK）
```

**2. 关键决策点**

| 决策 | 执行者 | 依据 |
|---|---|---|
| 选 AMF | gNB/NSSF | 初始注册时按切片与 TA |
| 选 SMF | AMF | (S-NSSAI, DNN)，可问 NRF |
| 选 UPF | SMF | 位置（TAI/Cell）、DNN、时延需求、负载 |
| QoS 策略 | PCF→SMF | 业务签约与运营商策略（PCC） |
| 会话与业务连续性 | SMF | SSC mode 1/2/3 |

**3. 要点提示**

- PDU 会话 ID 由 UE 分配并保持稳定，是移动性流程中会话关联的钥匙。
- 会话建立在**注册完成之后**（异常时允许注册中夹带），NAS 层会话消息与注册消息分属不同过程。
- gNB 只在 ⑦⑧ 才知道会话存在：核心网先选好 UPF 再通知空口，说明**锚点选择与空口资源建立是解耦的**。

## 关联考点

- AMF/SMF 协作：[AMF 与 SMF 的职责区分及协作](ch06-q004-amf-smf-responsibilities.md)
- UPF 选择与下沉：[UPF 的位置、作用与下沉部署](ch06-q005-upf-position-deployment.md)
- QoS 策略来源：[动态 PCC 与 PCF 策略下发](ch06-q014-dynamic-pcc-pcf.md)
- 空口承载映射：[QoS flow、DRB、PDU session 的层级关系](ch06-q013-qos-flow-drb-session.md)

## 面试追问

- **PDU 会话建立请求中的"请求类型"有哪些？** —— 要点：initial（新会话）、existing PDU session（3GPP 与非 3GPP 接入间迁移/切换沿用）、emergency（紧急会话）、session transfer 等；UE 从非 3GPP（如 WiFi）切到 3GPP 时用 existing 类型保持同一会话与 IP。
- **SMF 怎么选 UPF？** —— 要点：综合 UE 当前位置（TAI/小区）、DNN 对应的数据网络、切片、时延/位置约束（如企业本地分流）、UPF 负载与能力（如是否支持 UL CL），从 NRF 或本地配置的 UPF 池中选；跨 TA 移动时可插入中间 UPF 而不换锚点。
- **会话建立失败常见原因有哪些？** —— 要点：签约不允许该 DNN/切片（UDM 签约拒绝）、切片不可用（NSSF/NSSAA 未通过）、UPF 资源不可用（N4 失败）、策略获取失败（PCF 超时）、IP 地址池耗尽；排查时按 N1→N11→N4→N2 各段定位。

---

*难度提示：难 | 相关规范方向：23.502（会话建立过程）、24.501（NAS 会话消息）*
