---
title: 随机接入响应 RAR 的内容与 UL grant
chapter: 5
difficulty: 中
frequency: 中
tags: [随机接入, RAR, UL grant]
---

## 一句话答案

随机接入响应（RAR, Random Access Response）是 MAC 层在 msg2 发给 UE 的响应块，核心三要素是定时提前命令（TA Command）、上行授权（UL grant）和临时 C-RNTI（TC-RNTI），另含回退指示（BI）；UL grant 指明了 msg3 的时频资源、MCS、功率控制与 HARQ 信息，UE 据此直接发送首个上行数据。

## 详细展开

**1. RAR 的承载位置**

- gNB 在 ra-ResponseWindow 内以 RA-RNTI 加扰 PDCCH（DCI 1_0）调度 PDSCH，PDSCH 中携带 MAC RAR 或回退 RAR。
- 一个 PDSCH 可承载多个 RAR（子头 + 载荷结构），子头中的 RAPID 标明该 RAR 对应哪个 preamble。

**2. MAC RAR 字段（每个 RAR）**

| 字段 | 作用 |
|---|---|
| TA Command（12 bit） | 定时提前量，单位 16Ts 或按扩展粒度；UE 据此调整上行发送时刻 |
| UL grant（27 bit） | msg3 的调度信息，见下 |
| TC-RNTI（16 bit） | 临时标识，用于 msg3/msg4 的 PDCCH 加扰 |

**3. UL grant（27 bit）的组成**

| 字段 | 说明 |
|---|---|
| 频域资源分配 | msg3 的 PRB 位置 |
| 时域资源分配 | 相对 msg2 的时隙偏移与起止符号 |
| MCS（4 bit） | 调制编码方式，msg3 常用低码率保证可靠性 |
| TPC 命令（3 bit） | PUSCH 功控调整 |
| CSI 请求（1 bit） | msg3 一般不用 |
| 载波/信道指示等 | 部分场景用于指示 NUL/SUL 与 PUSCH 信道 |

**4. 回退 RAR（Backoff Indicator）**

- 若 gNB 未能处理某个 preamble，回退 RAR 子头带 BI（4 bit，指示 0~20 ms 左右的回退档位），UE 延时后重发 msg1，避免冲击。
- 响应窗超时仍未收到匹配 RAPID 的 RAR：UE 按 preambleTransMax 判断重发或放弃。

## 关联考点

- 四步流程：[CBRA 竞争随机接入四步流程](ch05-q007-cbra-four-step.md)
- msg3 内容：[CBRA 竞争随机接入四步流程](ch05-q007-cbra-four-step.md)
- 两步接入的 MsgA：[两步随机接入（2-step RA）与四步流程对比](ch05-q011-two-step-ra.md)

## 面试追问

- **TA Command 为什么必须有？** —— 要点：UE 初次接入时上行定时未知，gNB 通过测量 preamble 到达时刻计算 TA，UE 据此提前发送才能让信号在基站侧对齐；后续周期性 TA 命令通过 MAC CE 维护。
- **msg3 的 MCS 为什么偏低？** —— 要点：msg3 常带 RRC 消息（如 RRCSetupRequest）且此时 UE 尚未完成精确同步/功控，低码率、低阶调制换取高可靠性，失败代价（重新接入）远大于一两个 RB 的开销。
- **RA-RNTI 怎么算？** —— 要点：由发起 msg1 的 RO 位置（符号/时隙/频域/载波）按公式唯一确定，UE 与 gNB 各自按同一公式计算，UE 只解码自己 RO 对应的 RAR；因此换 RO 重发时 RA-RNTI 也随之变化。
