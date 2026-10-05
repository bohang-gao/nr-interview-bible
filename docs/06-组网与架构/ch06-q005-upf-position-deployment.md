---
title: UPF 的位置、作用与下沉部署（边缘计算）
chapter: 6
difficulty: 中
frequency: 高
tags: [UPF, 边缘计算, CUPS]
---

## 一句话答案

UPF（User Plane Function）是 5GC 的用户面网关，负责用户数据的路由转发、QoS 执行、计费与流量上报，全部用户面数据都必须经过它。UPF 可按业务需求灵活下沉到地市/园区/基站机房，让数据就近卸载（边缘计算 MEC），降低时延并减少回传占用。

## 详细展开

**1. 核心作用**

- **转发与锚点**：执行 SMF 下发的 PFCP 规则（N4 接口），按规则匹配、转发、封装（GTP-U）用户数据；PDU 会话锚点（UE IP 的终点）就在 UPF。
- **QoS 执行**：按 QoS flow 做门控、速率限制（GBR/MBR）、标记（如 DSCP）。
- **计费与上报**：流量计量、使用量上报（与 CHF 配合）、合法监听。
- **其他**：下行数据缓存与通知（触发网络寻呼）、分流（UL CL/IPv6 多宿主）、与 DN 的 N6 接口对接。

**2. 部署位置与下沉**

| 部署位置 | 场景 | 特点 |
|---|---|---|
| 大区/省中心 | 普通上网业务 | 集中池化、锚点稳定，时延较高 |
| 地市/区域 | 一般本地业务 | 折中 |
| 园区/基站侧 | 工业控制、云游戏、车联网 | 就近卸载，时延最低，但锚点易变 |

下沉带来的问题：UE 移动跨越 UPF 服务区需要改变锚点或插入中间 UPF。5GC 用**上行分类器（UL CL, Uplink Classifier）**或 **IPv6 多宿主（Multi-homing）**在本地插入一个分流 UPF：主锚点不变（保证 IP 连续），本地业务就近分流到本地 DN。

**3. 与 4G 的对比**

4G 时代通过 CUPS（控制面/用户面分离扩展）引入 SGW-U/PGW-U 分离，但 5GC 从设计之初就是 CUPS 架构：SMF 经 N4（PFCP 协议）统一控制多个分布式 UPF，控制面完全不再承载用户数据。

## 关联考点

- 控制它的 NF：[AMF 与 SMF 的职责区分及协作](ch06-q004-amf-smf-responsibilities.md)
- 架构总览：[5GC 网络功能总览](ch06-q003-5gc-nf-overview.md)
- 低时延与空口侧配合：URLLC 场景（第 1 章三类场景）

## 面试追问

- **UL CL 是什么，什么时候用？** —— 要点：Uplink Classifier，一个 IPv4 会话中插入的分流点；SMF 发现 UE 靠近本地数据网络时，在锚点 UPF 前插入 UL CL UPF，按目的地址把本地流量分流到本地 UPF、其余继续到锚点；UE 无感知、IP 不变。IPv6 场景用 Multi-homing（多个 PDU 会话锚点共享前缀）实现同样效果。
- **UPF 下沉后，UE 移动到另一个城市，IP 会变吗？** —— 要点：不一定。若会话锚点 UPF 不变，仅中间 UPF（UL CL）更换，IP 保持；若需要更换锚点（HR 模式不适用时），则触发会话重建，IP 会变。运营商通过"会话与业务连续性模式"（SSC mode）控制这一行为。
- **N4 接口用什么协议？** —— 要点：PFCP（Packet Forwarding Control Protocol），SMF 通过它下发转发规则（PDR/FAR/QER/URR 等规则集），UPF 按规则执行匹配、转发、QoS 与计量上报。

---

*难度提示：中 | 相关规范方向：23.501（UPF 与 SSC）、29.244（PFCP）*
