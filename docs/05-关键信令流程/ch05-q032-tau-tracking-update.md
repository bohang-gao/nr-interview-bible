---
title: TAU 跟踪区更新与周期性 TAU
chapter: 5
difficulty: 中
frequency: 中
tags: [TAU, 跟踪区, 注册更新]
---

## 一句话答案

TAU（Tracking Area Update，跟踪区更新）是 UE 在空闲态检测到所在跟踪区（TA）变化或周期性定时器到期时，向网络发起的位置更新流程，5GC 中体现为 Mobility Registration Update。作用有二：让 AMF 维持准确的寻呼范围（注册区域），以及通过周期性 TAU 让网络确认 UE 仍可达（否则标记为不可达，停止寻呼）。NR/5GC 中 TAU 与重选联动：UE 重选到不属于注册区域的新小区后触发更新。

## 详细展开

**1. 触发条件**

| 类型 | 触发时机 | 目的 |
|---|---|---|
| 移动性更新 | 重选进入注册区域外的新小区（TA 不在 TAI list 内） | 更新 AMF 的寻呼区域记录 |
| 周期性更新 | T3512（周期性注册定时器）到期 | 网络确认 UE 可达；超时未更新则 AMF 标记 UE 不可达 |
| 其他 | 接入禁止解除、需要更新能力/DRX 参数等 | 维持上下文一致性 |

**2. 流程要点**

1. UE 在新小区完成同步与系统消息读取，判断 TAI 是否在注册区域列表内；
2. 不在则经 RRC 建立（原因 registration update）发 **Registration Request**（mobility registration update 类型）；
3. 网络侧：AMF（可能变化）完成上下文获取/转移（跨 AMF 时经旧 AMF），必要时执行鉴权与安全模式；
4. AMF 回 **Registration Accept**（携带新的注册区域 TAI list、周期性注册定时器等），UE 回完成消息；
5. 若网络拒绝（如区域受限），UE 按拒绝原因处理（重试或去注册）。

**3. 周期性 TAU 的价值与参数权衡**

- **价值**：网络侧 UE 上下文与可达性标记的保鲜机制；UE 关机/没电未通知网络时，靠周期性超时发现不可达，避免无效寻呼；
- **参数权衡**：定时器短→网络记录更准、寻呼命中率高，但 UE 耗电与信令负荷上升；定时器长→省电但寻呼浪费增多；现网常按业务类型分级（物联网终端配长周期，甚至配合 eDRX）。

**4. 与 4G 的对应关系**

- LTE 的 TAU（Tracking Area Update，EPC/EMM 层）与 NR 的 Mobility Registration Update 概念同构；
- NR 引入 RNA（RAN 通知区域，RAN 侧更新）分担了一部分高频小范围更新，减少 CN 侧信令——RAN Paging/更新在 RRC INACTIVE 态完成，不必每次都到 AMF。

**5. 寻呼的关联**

- 注册区域更新后，AMF 寻呼按 TAI list 发起；寻呼不到（UE 不可达或超出覆盖）时，结合周期性定时器状态决定是否标记不可达。

## 关联考点

- 注册全流程：[NAS 注册流程要点（鉴权/安全模式/注册区域更新）](ch05-q013-nas-registration-flow.md)
- RNA 更新：[RNA 更新的两种方式](ch05-q018-rna-update.md)
- 寻呼机制：[NR 寻呼完整流程（核心网寻呼/RAN 寻呼）](ch05-q035-nr-paging-flow.md)

## 面试追问

- **TAU 和 RNA Update 有什么区别？** —— 要点：TAU 是 NAS 层动作（UE↔AMF），更新核心网注册区域，触发重选后的小区跨注册区；RNA Update 是 AS 层动作（UE↔RAN，RRC INACTIVE 态），更新 RAN 侧通知区域，不惊动 AMF；两者分层负责，NR 用 RNA 吸收了大部分高频移动性更新。
- **周期性 TAU 超时后网络会怎么处理？** —— 要点：AMF 将 UE 标记为不可达（PMM-IDLE 不可达状态），下行数据到达时不再寻呼（或按运营商策略延迟处理），等 UE 下次出现（主动发起或移动性更新）再恢复；这是省信令与省电的必要机制。
- **注册区域（TAI list）为什么是一个列表而不是单个 TA？** —— 要点：给网络分配灵活性——把相邻几个 TA 打包给 UE，减少边缘小区乒乓重选引发的更新频率；列表长度与寻呼范围之间做权衡，列表越长寻呼开销越大。
