你在为「NR通信面试宝典」执行技术修正。项目内容在 docs/ 下。逐条执行下面的修正清单（来自审校报告），只允许修改清单中列出的文件，每处修改必须保持题目原有四节结构与 frontmatter 不变，改动最小化（改数字/表述，不重写整题）。

修正清单：

【1】docs/03-MIMO与波束管理/ch03-q029-spatial-mux-rate-calc.md（❌）
- 「一句话答案」改为：「100 MHz 单流理论 ≈744 Mbps（273×12 子载波×30 kHz×8 bit×码率0.93），4 流 ≈3 Gbps；TDD 0.74 折算并扣除开销后工程口径 ≈2.4~2.8 Gbps」
- 正文删除或重写「单流 1.9~2 Gbps」「4 流 7~8 Gbps」两句（那是 200 MHz/1024QAM 场景的口径，与 100 MHz 前提矛盾）

【2】docs/09-NTN卫星通信/ch09-q019-ntn-link-budget-leo.md（❌）
- 表格行2：LEO-600 仰角30° 斜距 712 km → **1075 km**，FSPL 155.5 → **≈159.1 dB**
- 表格行3：LEO-1200 仰角30° → 斜距 **≈2000 km**，FSPL → **≈164.5 dB**
- 总损耗「157~160 dB」→「161~163 dB」
- 面试追问「天顶到 30° 差约 1.5 dB」→「约 5 dB」
- 「覆盖半径约 465 km」与正文 ψ=4.5°→502 km 统一为「约 500 km」

【3】docs/07-射频与网优/ch07-q006-link-budget.md（⚠️）
- 「阴影衰落余量 8-9 dB | 对应 90-95% 边缘覆盖率」→「8~10 dB（σ≈6~8，对应约 90% 边缘覆盖率；面积覆盖率口径下等效余量更低）」

【4】docs/07-射频与网优/ch07-q011-sul-coverage-value.md（⚠️）
- 「路损差约 7-8 dB 量级（按 f² 近似）」→「路损差约 6 dB（20lg(3.5/1.8)≈5.8 dB）」

【5】docs/07-射频与网优/ch07-q037-700mhz-wide-coverage.md（⚠️）
- 「比 3.5 GHz 低 8–12 dB」→「低约 14 dB（仅路损口径，20lg(3500/700)）」；如上下文含穿透增益等综合口径则写「综合链路预算优势约 10~14 dB（视穿透损耗假设）」
- 「2×30 MHz」如指规范带宽上限，改为「n78 每向最大 30 MHz（国内通过载波聚合扩展）」之类准确表述

【6】docs/08-场景与软技能/ch08-q006-link-budget-whiteboard.md（⚠️）
- 阴影衰落余量与【3】同步口径（8~10 dB / σ≈6~8 / 约90%边缘覆盖）

【7】docs/02-物理层/ch02-q043-prach-ro-calculation.md（❌）
- 「864 子载波（对应 72 个 15 kHz 的 RB 量级）」→「864 子载波（1.08 MHz，对应 6 个 15 kHz PRB，即 72 个 15 kHz 子载波）」

【8】docs/02-物理层/ch02-q045-timing-advance.md（❌）
- TA 粒度统一改为「16×64/2^μ×Tc」（30 kHz 下每步 ≈0.26 μs，15 kHz ≈0.52 μs）
- 6 bit 相对 TA 命令改为「偏移二进制，TA=0..63，NTA_new = NTA_old + (TA−31)·16·64/2^μ·Tc，即 −31~+32 步，TA=31 表示不变」；删除「TA=63 重置」说法
- 「单次调整 ±4 μs 量级」→「±16.7 μs（15 kHz）/ ±8.3 μs（30 kHz）」
- 「半径每增 1 km 增大约 13 个 16×Tc 步进」→「13 个 16×64×Tc 步进（15 kHz 下 ≈6.7 μs/km÷0.52 μs）」
- 「RAR TA 覆盖约几百微秒」→「15 kHz 下约 2 ms（TA 最大 3846 步），对应数百公里小区半径」

【9】docs/02-物理层/ch02-q048-rb-re-bandwidth-calc.md（❌）
- 换算表 20 MHz@15 kHz →「106 PRB」（删除"51 PRB/0 MHz 段内"残留）
- 120 kHz 行 →「100 MHz（FR2）→ 66 PRB；264 PRB 对应 200 MHz@60 kHz 或 400 MHz@120 kHz（FR2-2, R17）」
- 表头「20 MHz（48 PRB 量级）」→「20 MHz（106 PRB @15 kHz / 51 PRB @30 kHz）」
- 峰值手算例加一句前提注：「按 FDD 全下行计算；TDD 需乘上下行配比」

【10】docs/02-物理层/ch02-q050-ssb-vs-data-coverage.md（⚠️）
- 「含 1/2 个符号中的 PSS/SSS/PBCH」→「占 4 个 OFDM 符号 × 240 子载波，PSS/SSS/PBCH 分占其中」

【11】docs/02-物理层/ch02-q051-ul-alignment-guard-period.md（⚠️）
- 「可容纳约 10 km 量级 RTT」→「可容纳约 5 km 量级 RTT（35.7 μs ÷ 6.7 μs/km）」

【12】docs/02-物理层/ch02-q054-256qam-mcs-spectral-efficiency.md（⚠️）
- 「64 星座点翻一倍的 256 点」→「64 点的每维点数翻倍得 256 点（总点数 ×4），比特数 6→8」

完成后运行 python scripts/lint-content.py --strict（必须 0 error 0 warning）。stdout 输出：修改文件清单 + lint 结尾。
