#!/usr/bin/env python3
"""Generate a content batch prompt file from content-template.md + chapters.json.

Usage: python gen-batch.py c02-b
Writes .batches/c02-b.md
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: gen-batch.py <cNN-x> [template]")
    batch_id = sys.argv[1]
    template_name = sys.argv[2] if len(sys.argv) > 2 else "content-template.md"
    ch_num, letter = int(batch_id[1:3]), batch_id[4]
    ch_num = int(ch_num)

    chapters = json.loads((HERE / "chapters.json").read_text(encoding="utf-8"))["chapters"]
    ch = next(c for c in chapters if c["num"] == ch_num)
    b_idx = ord(letter) - ord("a")
    start, end = ch["batches"][b_idx]

    topics = ch["topics"][start - 1 : end]
    if len(topics) != end - start + 1:
        sys.exit(f"topic count mismatch for {batch_id}")
    topics_block = "\n".join(f"{i}. {t}" for i, t in enumerate(topics, start=start))

    template = (HERE / template_name).read_text(encoding="utf-8")
    prompt = (
        template.replace("{{CH_NUM2}}", f"{ch_num:02d}")
        .replace("{{CH_NUM}}", str(ch_num))
        .replace("{{CH_NAME}}", ch["name"])
        .replace("{{CH_DIR}}", ch["dir"])
        .replace("{{START3}}", f"{start:03d}")
        .replace("{{END3}}", f"{end:03d}")
        .replace("{{START}}", str(start))
        .replace("{{END}}", str(end))
        .replace("{{COUNT}}", str(end - start + 1))
        .replace("{{TOPICS}}", topics_block)
    )
    out = HERE / f"{batch_id}.md"
    out.write_text(prompt, encoding="utf-8")
    print(f"written {out} ({len(topics)} questions, q{start:03d}-q{end:03d})")


if __name__ == "__main__":
    main()
