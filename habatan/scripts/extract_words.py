"""PDFから単語データを抽出してJSON化するスクリプト。"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import Iterable, List


NUMBER_LINE_PATTERN = re.compile(r"^\s*(\d+)\s")


def run_pdftotext(pdf_path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        check=True,
        capture_output=True,
    )
    return result.stdout.decode("utf-8")


def leading_spaces(line: str) -> int:
    return len(line) - len(line.lstrip(" "))


NOISE_PREFIXES = [
    "「兵庫版",
    "～はばたけ",
    "令和",
    "☆ ・・・",
    "○ ・・・",
    "番号",
    "URL:",
    "QR コード",
    "【兵庫県教育委員会ホームページ】",
    "【クイズレット（無料アプリ）】",
    "sub1-Habatan.html",
    "【ここがポイント！】",
    "【実際の使い方！】",
    "生徒用",
    "兵庫県教育委員会",
]

NOISE_CONTAINS = [
    "教育委員会",
    "「総復習」",
]


def is_number_line(line: str) -> bool:
    return bool(NUMBER_LINE_PATTERN.match(line))


def is_noise(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if stripped.isdigit():
        return True
    if leading_spaces(line) < 10:
        return True
    for prefix in NOISE_PREFIXES:
        if stripped.startswith(prefix):
            return True
    for keyword in NOISE_CONTAINS:
        if keyword in stripped:
            return True
    return False


def split_tokens(line: str) -> List[str]:
    return [token.strip() for token in re.split(r"\s{2,}", line) if token.strip()]


def has_japanese(text: str) -> bool:
    return bool(re.search(r"[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF々〆〤ヶー～]", text))


def dedupe_keep_order(items: Iterable[str]) -> List[str]:
    seen = set()
    ordered: List[str] = []
    for item in items:
        if item not in seen:
            ordered.append(item)
            seen.add(item)
    return ordered


def parse_entry_lines(entry_lines: List[str]) -> dict:
    number_line = next((line for line in entry_lines if is_number_line(line)), None)
    if number_line is None:
        raise ValueError("番号行が見つかりませんでした。")

    tokens = split_tokens(number_line)
    first = tokens.pop(0)
    number_str, word = first.split(" ", 1)
    number = int(number_str)

    elementary = False
    added = False

    def consume_flag(flag: str) -> None:
        nonlocal elementary, added
        if flag == "☆":
            elementary = True
        elif flag == "○":
            added = True

    while tokens and tokens[0] in {"☆", "○"}:
        consume_flag(tokens.pop(0))

    pos = tokens.pop(0) if tokens else ""

    while tokens and tokens[-1] in {"☆", "○"}:
        consume_flag(tokens.pop())

    meaning_candidates: List[str] = []
    example_candidates: List[str] = []

    def add_token(token: str) -> None:
        if token in {"☆", "○"}:
            consume_flag(token)
            return
        if token.startswith("※") or token.startswith("【") or has_japanese(token):
            meaning_candidates.append(token)
        else:
            example_candidates.append(token)

    for token in tokens:
        add_token(token)

    for line in entry_lines:
        if line is number_line:
            continue
        for token in split_tokens(line):
            add_token(token)

    meanings = dedupe_keep_order(meaning_candidates)
    examples = dedupe_keep_order(example_candidates)

    return {
        "number": number,
        "word": word,
        "pos": pos,
        "meanings": meanings,
        "examples": examples,
        "elementary": elementary,
        "added": added,
    }


def extract_entries_from_text(layout_text: str) -> List[dict]:
    lines = layout_text.splitlines()
    entries: List[List[str]] = []
    pre_lines: List[str] = []
    index = 0
    while index < len(lines):
        line = lines[index]
        if is_number_line(line):
            entry_lines = pre_lines[:]
            pre_lines.clear()
            entry_lines.append(line)
            index += 1
            while index < len(lines) and not is_number_line(lines[index]):
                candidate = lines[index]
                if not is_noise(candidate):
                    entry_lines.append(candidate)
                index += 1
            entries.append(entry_lines)
        else:
            if not is_noise(line):
                pre_lines.append(line)
            index += 1

    return [parse_entry_lines(entry_lines) for entry_lines in entries]


def main() -> None:
    parser = argparse.ArgumentParser(description="PDFの単語集からJSONを生成します。")
    parser.add_argument("pdf", type=Path, help="入力となるPDFファイルのパス")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/words.json"),
        help="出力するJSONファイルのパス",
    )
    args = parser.parse_args()

    layout_text = run_pdftotext(args.pdf)
    entries = extract_entries_from_text(layout_text)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()

