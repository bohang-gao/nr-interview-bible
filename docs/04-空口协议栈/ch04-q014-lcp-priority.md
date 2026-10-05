---
title: 逻辑信道优先级 LCP 与资源分配顺序
chapter: 4
difficulty: 中
frequency: 高
tags: [MAC, LCP, 调度, 优先级]
---

## 一句话答案

LCP（Logical Channel Prioritization，逻辑信道优先级）是 MAC 层把调度到的上行/下行资源分配给多个逻辑信道（多路复用）的规则：严格按优先级从高到低依次满足，高优先级信道可以"抢占"资源甚至能令低优先级无法发送（受每个信道配置的 PBR 与 BSD 约束做令牌桶保底）。NR 相对 LTE 增加了复用限制（如 SRB0/SRB1 优先、复制信道隔离等规则），保证关键信令与特殊承载不被数据业务饿死。

## 详细展开

**每条逻辑信道的三个配置参数**（RRC 配置，面试必记）：

- **priority**：优先级，数值越小优先级越高；
- **prioritisedBitRate（PBR，优先化比特率）**：每信道承诺的最低速率（kbit/s），infinity 表示无限；
- **bucketSizeDuration（BSD，桶时长）**：令牌桶深度 = PBR × BSD，决定"欠账"上限。

**标准 LCP 执行两阶段**：

1. **第一阶段（保底：满足 PBR）**：按 priority 从高到低，为每条信道分配资源直至其令牌桶（Bj，初始为 PBR×BSD，每 TTI 增长 PBR×TTI）耗尽——保证每条信道至少有 PBR 的速率保障；
2. **第二阶段（剩余资源分配）**：若资源仍有剩余，再按 priority 从高到低分给所有还有数据的信道，直到资源用完或数据发完。

**NR 新增的复用限制（restrictions）**：

- SRB0 数据、来自 SRB1（或开启 SRB1 时的 SRB3）的数据优先于其它信道——信令保命线；
- 来自 SRB1 的信令不能与其它信道的数据放在同一 MAC PDU（避免信令被复用逻辑拖累）；
- PDCP duplication 的复制信道与原信道不得复用同一 TB（保证路径分集）；
- 配置了特定复用限制的信道（如某些 URLLC 承载）只能与允许列表内的信道共 TB。

**举例（口播模板）**：设 SRB1 priority=1、URLLC DRB priority=3（PBR 100 kbit/s）、普通 DRB priority=7。上行 grant 到来：先给 SRB1 全部所需；再按令牌桶给 URLLC 保底 100 kbit/s 份额；剩余资源 SRB1 无数据、URLLC 还有数据则继续吃满，最后才是普通 DRB——体现"信令绝对优先、GBR/URLLC 保底、尽力而为垫底"。

**与调度器的关系**：UE 侧 LCP 决定"grant 怎么分给自己的逻辑信道"；gNB 侧调度器决定"grant 给谁、给多大"——两者都基于优先级思想，但作用对象不同（小区内多用户 vs 单用户多信道），面试时要分清层次。

## 关联考点

- [MAC 层主要功能与逻辑信道复用](ch04-q013-mac-functions-mux.md)
- [调度请求 SR 的配置、触发与禁止机制](ch04-q015-sr-config-trigger.md)
- [BSR 缓存状态报告的类型与触发条件](ch04-q016-bsr-types-trigger.md)
- [SDAP 层的引入与 QoS flow 到 DRB 的映射](ch04-q003-sdap-qos-flow-drb.md)

## 面试追问

- **令牌桶 Bj 是怎么工作的？** —— 每 TTI 按信道 PBR 递增，上限为 PBR×BSD；发送数据扣减 Bj；只有 Bj>0 的信道在第一阶段获得保底资源——这就是"最低速率保障 + 突发欠账上限"的实现。
- **为什么 SRB1 不能和其他数据同 TB？** —— 保证 RRC 信令（尤其是切换命令、安全激活类关键消息）不被数据承载的分段/复用拖慢或干扰，单 TB 独享使信令一次 HARQ 送达，降低失败概率。
- **PBR 设成 infinity 会怎样？** —— 该信道任何数据都按最高优先顺序无限满足，等效于无保底限制；用于信令类或绝对高优业务，普通业务慎配（会饿死低优先级信道）。
