你在为「NR通信面试宝典」执行技术修正（收尾批，前一批已完成大部分）。只允许修改下列 4 个文件，改动最小化，保持四节结构与 frontmatter 不变：

【A】docs/02-物理层/ch02-q050-ssb-vs-data-coverage.md
- 「含 1/2 个符号中的 PSS/SSS/PBCH」类表述 → 「占 4 个 OFDM 符号 × 240 子载波，PSS/SSS/PBCH 分占其中」

【B】docs/02-物理层/ch02-q051-ul-alignment-guard-period.md
- 「可容纳约 10 km 量级 RTT」→「可容纳约 5 km 量级 RTT（35.7 μs ÷ 6.7 μs/km）」

【C】docs/02-物理层/ch02-q054-256qam-mcs-spectral-efficiency.md
- 「64 星座点翻一倍的 256 点」→「64 点的每维点数翻倍得 256 点（总点数 ×4），比特数 6→8」

【D】docs/07-射频与网优/ch07-q037-700mhz-wide-coverage.md
- 「比 3.5 GHz 低 8–12 dB」→ 按「路损低约 14 dB（20lg(3500/700)）；综合链路优势约 10~14 dB（视穿透损耗假设）」修正，融入上下文
- 「2×30 MHz」如指规范上限 → 改为「n78 每向最大 30 MHz（国内经载波聚合扩展至更宽）」

完成后运行 python scripts/lint-content.py --strict 确认 0 error 0 warning。stdout 输出：修改文件清单 + lint 结尾。
