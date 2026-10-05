#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""题目内容校验：文件名 / frontmatter 完整性 / chapter 与目录一致 / title 查重 / 必需小节 / 题量核对。

用法：python scripts/lint-content.py [--strict]
- 结构问题为 error，题量不足仅 warning（分批构建中允许）
- 无 error 时 exit 0；--strict 时题量不符也 exit 1
"""
import re
import sys
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "docs"
EXPECTED_COUNTS = {1: 30, 2: 55, 3: 35, 4: 40, 5: 40, 6: 30, 7: 40, 8: 30, 9: 20}
FILENAME_RE = re.compile(r"^ch\d{2}-q\d{3}-[a-z0-9-]+\.md$")
FM_KEYS = ("title", "chapter", "difficulty", "frequency", "tags")
REQUIRED_SECTIONS = ("一句话答案", "详细展开", "关联考点", "面试追问")
DIFFICULTIES = {"易", "中", "难"}
FREQUENCIES = {"高", "中", "低"}

errors = []
warnings = []
strict = False


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def parse_frontmatter(text, rel):
    """轻量解析 frontmatter，返回 dict 或 None（解析失败）。"""
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?", text, re.S)
    if not m:
        return None
    data = {}
    lines = m.group(1).splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        kv = re.match(r"^([A-Za-z_][\w-]*)\s*:\s*(.*)$", line)
        if not kv:
            return None
        key, value = kv.group(1), kv.group(2).strip()
        if value == "[":
            items = []
            i += 1
            while i < len(lines):
                t = lines[i].strip().rstrip(",")
                if t == "]":
                    break
                if t:
                    items.append(t.strip("'\""))
                i += 1
            else:
                return None
            data[key] = items
        elif value.startswith("["):
            if not value.endswith("]"):
                return None
            inner = value[1:-1].strip()
            data[key] = [s.strip("'\"") for s in inner.split(",")] if inner else []
        else:
            data[key] = value.strip("'\"")
        i += 1
    return data


def main():
    global strict
    strict = "--strict" in sys.argv[1:]
    if not DOCS.is_dir():
        err(f"docs 目录不存在：{DOCS}")
        report()
        return

    titles = {}
    chapter_counts = {c: 0 for c in EXPECTED_COUNTS}
    files = sorted(DOCS.glob("[0-9][0-9]-*/ch[0-9][0-9]-q[0-9][0-9][0-9]-*.md"))

    for f in files:
        rel = f.relative_to(DOCS).as_posix()
        dir_num = int(f.parent.name[:2])

        if not FILENAME_RE.match(f.name):
            err(f"文件名不符合规范：{rel}")

        text = f.read_text(encoding="utf-8")
        fm = parse_frontmatter(text, rel)
        if fm is None:
            err(f"frontmatter 缺失或无法解析：{rel}")
            continue

        for key in FM_KEYS:
            if key not in fm or fm[key] in ("", None, []):
                err(f"frontmatter 缺少字段 {key}：{rel}")
        if any(key not in fm for key in FM_KEYS):
            continue

        if fm["difficulty"] not in DIFFICULTIES:
            err(f"difficulty 非法（须为 易|中|难）：{rel} -> {fm['difficulty']}")
        if fm["frequency"] not in FREQUENCIES:
            err(f"frequency 非法（须为 高|中|低）：{rel} -> {fm['frequency']}")

        try:
            chapter = int(fm["chapter"])
        except ValueError:
            err(f"chapter 非数字：{rel} -> {fm['chapter']}")
        else:
            if chapter != dir_num:
                err(f"frontmatter chapter({chapter}) 与目录编号({dir_num}) 不一致：{rel}")
            elif chapter in chapter_counts:
                chapter_counts[chapter] += 1

        title = fm["title"]
        if title in titles:
            err(f"title 重复：「{title}」 -> {rel} 与 {titles[title]}")
        else:
            titles[title] = rel

        for sec in REQUIRED_SECTIONS:
            if not re.search(rf"^##\s*{re.escape(sec)}\s*$", text, re.M):
                err(f"缺少必需小节「{sec}」：{rel}")

    total = sum(chapter_counts.values())
    print(f"共扫描题目 {total} 道，期望 {sum(EXPECTED_COUNTS.values())} 道")
    print()
    print("各章题量（当前/期望）：")
    for c in sorted(EXPECTED_COUNTS):
        cur, exp = chapter_counts[c], EXPECTED_COUNTS[c]
        mark = "✓" if cur == exp else ("…" if cur < exp else "!")
        print(f"  第{c}章  {cur}/{exp}  {mark}")
        if cur < exp:
            warn(f"第{c}章题量不足：{cur}/{exp}（分批构建中允许）")
        elif cur > exp:
            err(f"第{c}章题量超出：{cur}/{exp}")

    report()


def report():
    if warnings:
        print()
        print("警告（warning）：")
        for w in warnings:
            print(f"  - {w}")
    if errors:
        print()
        print("错误（error）：")
        for e in errors:
            print(f"  - {e}")
        print()
        print(f"校验失败：{len(errors)} 个 error，{len(warnings)} 个 warning")
        sys.exit(1)
    if strict and warnings:
        print()
        print(f"--strict 模式：题量不符，退出码 1（{len(warnings)} 个 warning）")
        sys.exit(1)
    print()
    print(f"校验通过：0 error，{len(warnings)} 个 warning")
    sys.exit(0)


if __name__ == "__main__":
    main()
