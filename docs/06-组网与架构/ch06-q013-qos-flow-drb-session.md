---
title: QoS flow、DRB、PDU session 的层级关系
chapter: 6
difficulty: 中
frequency: 高
tags: [QoS flow, DRB, PDU会话, SDAP]
---

## 一句话答案

PDU 会话是 UE 与数据网络之间的端到端连接（一个会话一个 UE IP）；会话内按 QoS flow 划分服务质量粒度（每条 flow 一个 5QI/ARP）；空口侧再由 SDAP 把若干 QoS flow 映射到 DRB 上传输。即：session ⊇ QoS flow →（映射）→ DRB，核心网按 flow 控制 QoS，空口按 DRB 传数据。

## 详细展开

**1. 三层结构**

```
UE ←—— PDU Session（端到端，绑 S-NSSAI/DNN，1 个 UE IP）——→ DN
        │
        ├── QoS flow 1（5QI=1, GBR, VoNR）      ← 核心网/空口统一 QoS 粒度
        ├── QoS flow 2（5QI=9, 非 GBR, 上网）
        └── QoS flow 3（5QI=7, 非 GBR, 视频）
                    │ SDAP 映射（RRC 配置）
        ├── DRB 1（承载 flow 1）
        └── DRB 2（聚合承载 flow 2 + flow 3）
```

| 层级 | 定义域 | 标识 | 数量关系 |
|---|---|---|---|
| PDU session | UE↔DN 端到端 | PSI（PDU Session Identity） | 每 UE 可多个（不同 DNN/切片） |
| QoS flow | 会话内 | QFI（8 bit） | 每会话可多条（GBR 有限制，非 GBR 较多） |
| DRB | UE↔gNB 空口 | DRB ID | 每会话/每小区可多条；1 条 DRB 可承载多条 flow |

**2. 映射规则要点**

- **flow → DRB**：由 RRC 配置映射关系，双向（上行/下行）；多条同 QoS 特性的 flow 可合用一条 DRB，GBR flow 一般独立 DRB 以便调度保保障。
- **DTCH 与逻辑信道**：DRB 对应空口 DTCH 逻辑信道，MAC 层按 DRB（逻辑信道优先级）调度——**空口调度粒度是 DRB，不是 flow**；flow 级差异通过"分到不同 DRB"或"同 DRB 内靠 5QI 近似"来体现。
- **N3 隧道**：gNB↔UPF 按 PDU 会话建 GTP-U 隧道，QFI 在 GTP-U 扩展头携带，UPF 据此区分 flow 做计费/策略。
- **与 LTE 的差异**：LTE 的 EPS bearer 是 QoS 粒度=传输承载合一（TFT 绑定）；NR 把两者拆开（flow 管策略、DRB 管传输），才有了 SDAP 与反射 QoS。

**3. 一个记忆口径**

- 核心网视角：只有 PDU session 与 QoS flow（NAS 层概念）。
- 空口视角：只有 DRB 与逻辑信道（AS 层概念）。
- SDAP 是桥：负责 flow↔DRB 映射并打/读 QFI 标记。

## 关联考点

- SDAP 细节：[SDAP 层的引入与 QoS flow 到 DRB 的映射](../04-空口协议栈/ch04-q003-sdap-qos-flow-drb.md)
- 承载类型（双连接视角）：[MCG bearer、SCG bearer 与 split bearer 的区别及选择](../01-无线基础与演进/ch01-q007-bearer-types.md)
- 5QI 分类：[5QI 标准化取值与 GBR/非 GBR 分类](ch06-q012-5qi-gbr-non-gbr.md)

## 面试追问

- **为什么 NR 要把 EPS bearer 拆成 flow 与 DRB 两级？** —— 要点：灵活性与扩展性——LTE 的 bearer 粒度绑死 QoS 与传输，新建一条 QoS 就要新建承载、信令重；NR 中 flow 可动态增删而 DRB 复用，支持反射 QoS（UE 从下行包学映射，无需信令），适配多样化业务与双连接分流。
- **两条 5QI 不同的 flow 能映射到同一条 DRB 吗？** —— 要点：可以但没有意义且通常不这样配——DRB 是调度单位，混放会让 5QI 差异（时延/优先级）在空口失效；实际配置原则是"相同或相近 QoS 特性的 flow 合 DRB，差异大的分 DRB"。
- **UE 怎么知道上行数据该走哪条 DRB？** —— 要点：显式方式是 RRC 下发映射规则；反射方式是 SDAP 读取下行包的 QFI，UE 把"该 flow→该 DRB"记下来并对上行生效（这是 RQA 反射 QoS 的机制）。两条路径最终都落到 UE 本地的映射表。

---

*难度提示：中 | 相关规范方向：23.501（QoS 框架）、37.324（SDAP）*
