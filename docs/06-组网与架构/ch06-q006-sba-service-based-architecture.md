---
title: SBA 服务化架构与网络功能接口
chapter: 6
difficulty: 中
frequency: 中
tags: [SBA, 服务化, 5GC]
---

## 一句话答案

SBA（Service Based Architecture，服务化架构）是 5GC 控制面的组织方式：每个网络功能（NF）把自己的能力封装成若干"网络服务"通过服务化接口（SBI）对外暴露，其他 NF 直接调用，不需要为每对 NF 定义专有接口。接口统一基于 HTTP/2 + JSON，NRF 充当服务的注册与发现中心。

## 详细展开

**1. 从点对点到服务化**

- 4G EPC：MME↔HSS、MME↔SGW……每对 NF 之间是**专有点对点接口**（S1-MME、S11、S6a 等），每加一种 NF 或能力都要定义新接口，网状耦合。
- 5GC：控制面 NF 两两之间不再定义专有接口，而是都连到同一个"总线"——服务化接口。NF 提供服务（如 AMF 提供 Namf_Communication），消费者 NF 经 NRF 查询后直接调用。

**2. 服务化接口约定**

| 要素 | 约定 |
|---|---|
| 协议 | HTTP/2（TLS 加密） |
| 消息体 | JSON |
| 服务注册 | NF 启动后向 NRF 注册（Nnrf_NFManagement） |
| 服务发现 | 消费者向 NRF 查询目标 NF 实例（Nnrf_NFDiscovery） |
| 服务命名 | N**nf**_**服务名**，如 Namf_Communication、Nsmf_PDUSession |
| 通信方式 | 请求-响应为主，也支持订阅-通知（如 PCF 订阅 UDM 签约变更） |

**3. 参考点与服务化接口并存**

图中 NF 之间的连线有两类：NF↔NF 的服务化接口（总线式），以及少量**非服务化参考点**——如 N1（UE↔AMF 的 NAS）、N2（AN↔AMF）、N3（AN↔UPF）、N4（SMF↔UPF）。这些接口一端是传统网元（基站/UPF），不走 HTTP，仍用 NGAP/PFCP/GTP-U 等专有协议。

**4. 好处与代价**

- **好处**：NF 即插即用、按需组合（编排），支持网络切片按需实例化；接口标准化程度高，利于多厂商解耦与云化部署。
- **代价**：HTTP/2 信令效率低于二进制专有协议，需靠 NF 集群化与缓存发现结果弥补性能；对运维与安全（全 TLS、边缘防护）提出更高要求。

## 关联考点

- NF 职责：[5GC 网络功能总览](ch06-q003-5gc-nf-overview.md)
- 非服务化接口：[N2/N3/Xn 接口的作用与协议栈](ch06-q007-ng-n3-xn-interfaces.md)
- 切片选择依赖 NRF/NSSF：[切片选择流程（NSSF 与 AMF 的分工）](ch06-q010-slice-selection-nssf.md)

## 面试追问

- **SBI 为什么选 HTTP/2 而不是 Diameter 或自定义二进制？** —— 要点：HTTP/2 生态成熟、天然支持多路复用与流控、易与 Web/云原生体系（负载均衡、API 网关、微服务治理）集成；JSON 可读性好、扩展方便。Diameter 是点对点时代产物，扩展性差；自定义二进制不利于多厂商互通。
- **订阅-通知机制举例？** —— 要点：PCF 向 UDM 订阅签约数据变更（Nudm_SDM_Subscribe），签约变化时 UDM 主动通知 PCF 更新策略；AMF 也可向 SMF 订阅会话状态变化。这是 SBA 中除请求-响应外的另一类交互模式。
- **SBA 架构下用户面也走 HTTP 吗？** —— 要点：不。SBA 只用于控制面 NF 之间；N3/N4/N6/N9 等涉及用户面数据的接口仍用 GTP-U/PFCP 等高效二进制协议，保证转发性能。

---

*难度提示：中 | 相关规范方向：23.501（SBA 总览）、29.500/29.501（SBI 框架）*
