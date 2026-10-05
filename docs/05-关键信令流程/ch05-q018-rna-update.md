---
title: RNA 更新的两种方式
chapter: 5
difficulty: 中
frequency: 低
tags: [RNA, RRC_INACTIVE, RNA 更新]
---

## 一句话答案

RRC_INACTIVE 态的 UE 在移动出 RNA（RAN 通知区域，RAN-based Notification Area）或 RNA 更新定时器（T380）到期时发起 RNA 更新，有两种方式：一是通过 RRCResumeRequest（resumeCause=rna-Update）走恢复流程更新，二是网络在配置周期性 RNAU 时让 UE 用 NAS 层 Registration 更新携带（周期性 TAU 兼做 RNAU）。前者是默认方式，后者仅在网络明确启用时使用。

## 详细展开

**1. 为什么需要 RNA 更新**

- INACTIVE 态 UE 位置对网络只精确到 RNA（一组小区/TA 的集合）；UE 移出 RNA 后若不更新，RAN 寻呼将找不到 UE。
- 即使不动，T380 到期也要周期更新一次，向网络证明"我还活着"，与 IDLE 态的周期性注册（T3512）思想一致，但粒度与触发主体是 RAN。

**2. 两种更新方式**

| 方式 | 载体 | 触发条件 | 特点 |
|---|---|---|---|
| RRC 层 RNAU | RRCResumeRequest（resumeCause=rna-Update）→ gNB 回 RRCRelease（可再带 suspendConfig） | 出 RNA 或 T380 到期 | 默认方式；走 AS 恢复，gNB 可顺带重配/刷新上下文，完成即回 INACTIVE，不进 CONNECTED |
| NAS 层 RNAU | Registration Request（registration type=mobility registration updating，RNAU 指示） | 网络配置 periodicRegistrationUpdate 且 T380 到期 | 复用 NAS 注册更新，信令层级更高，AMF 参与；现网少用 |

**3. RRC 层 RNAU 流程要点**

```
UE → gNB : RRCResumeRequest(I-RNTI, resumeCause=rna-Update)
gNB      : 校验/取回上下文（本站或 Xn）
gNB → UE : RRCResume（激活 SRB1）
UE → gNB : RRCResumeComplete
gNB → UE : RRCRelease（suspendConfig，重置 T380）
```

- 网络可在 Resume 后修改 RNA 范围（重新下发 rnac-Info）。
- UE 重选进入新 RNA 的小区时，在驻留后发起；若此时有数据要发，resumeCause 直接用数据原因，RNA 更新顺带完成。

**4. 与 IDLE 态移动性的对比**

- IDLE：重选后无需通知（位置对网络只到 TA），仅 T3512/移出 TA 触发 NAS 层更新。
- INACTIVE：RNA 更新让网络维持"RNA 粒度"的位置，换取 RAN 寻呼低时延；这是 INACTIVE 比 IDLE 多出的信令开销。

## 关联考点

- 进入 INACTIVE：[RRC Release with suspend 与进入 INACTIVE](ch05-q017-rrc-release-suspend.md)
- 恢复流程：[Service Request 流程](ch05-q016-service-request.md)
- NAS 注册更新：[NAS 注册流程要点](ch05-q013-nas-registration-flow.md)

## 面试追问

- **RNA 的范围怎么定？** —— 要点：由网络配置，可以是单 gNB 内的小区列表、RAN 节点列表或 TA 列表三种粒度；范围大省更新信令但寻呼开销大，范围小则相反，运营按用户移动性与寻呼容量折中。
- **RNAU 时 UE 会进入 CONNECTED 吗？** —— 要点：RRC 层方式下短暂进入（完成 Resume/Release 握手）即回 INACTIVE，不建立 DRB、不涉及用户面；NAS 方式则需要完成注册更新的 NAS 交互。
- **T380 和 T3512 有什么区别？** —— 要点：T380 是 RAN 侧 RNA 更新定时器（INACTIVE 态，gNB 下发），T3512 是核心网周期注册定时器（IDLE 态，AMF 签约配置）；两者独立运行，INACTIVE 态 UE 若 NAS 方式更新也会涉及 T3512 的复位。
