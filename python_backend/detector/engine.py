import math
import os
from collections import Counter
from pathlib import Path

from shared.models import Finding
from detector.regex import ASSIGNMENT_VALUE, matches

ALLOWED_EXTENSIONS = {".py", ".js", ".ts", ".java", ".env", ".yml", ".yaml", ".json", ".xml", ".conf"}
SKIP_PARTS = {".git", "node_modules", "venv", ".venv", "__pycache__", "dist", "build", "vendor", "dependencies"}


def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    counts = Counter(s)
    length = len(s)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())


def mask_secret(value: str) -> str:
    if len(value) <= 8:
        return "*" * len(value)
    return value[:4] + "*" * (len(value) - 8) + value[-4:]


def _is_skipped(filepath: Path) -> bool:
    return any(part in SKIP_PARTS for part in filepath.parts)


def scan_file(filepath: str, repo_name: str = "local") -> list[Finding]:
    path = Path(filepath)
    if path.suffix.lower() not in ALLOWED_EXTENSIONS or _is_skipped(path):
        return []
    try:
        raw = path.read_bytes()
    except (OSError, PermissionError):
        return []
    if b"\x00" in raw[:8192]:
        return []
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        return []

    findings: list[Finding] = []
    for line_number, line in enumerate(text.splitlines(), start=1):
        regex_hits = matches(line)
        assignment = ASSIGNMENT_VALUE.search(line)
        entropy_score = shannon_entropy(assignment.group(1)) if assignment else 0.0
        entropy_signal = bool(assignment and len(assignment.group(1)) >= 16 and entropy_score > 4.0)
        known_format_signal = bool(regex_hits)
        signal_count = len(regex_hits) + int(entropy_signal) + int(known_format_signal and any(p.name != "Possible API credential" for p, _ in regex_hits))
        if signal_count < 1:
            continue
        confidence = "HIGH" if signal_count >= 2 else "MEDIUM"
        pattern, value = regex_hits[0] if regex_hits else (None, assignment.group(1))
        secret_type = pattern.name if pattern else "High-entropy credential"
        findings.append(
            Finding(
                file_path=os.fspath(path),
                line_number=line_number,
                secret_type=secret_type,
                masked_value=mask_secret(value),
                confidence=confidence,
                regex_matched=bool(regex_hits),
                entropy_score=round(entropy_score, 4),
                repo_name=repo_name,
                commit_blocked=True,
            )
        )
    return findings


def scan_paths(paths: list[str], repo_name: str = "local") -> list[Finding]:
    findings: list[Finding] = []
    for root in paths:
        path = Path(root)
        if path.is_file():
            findings.extend(scan_file(os.fspath(path), repo_name))
        elif path.is_dir():
            for candidate in path.rglob("*"):
                if candidate.is_file():
                    findings.extend(scan_file(os.fspath(candidate), repo_name))
    return findings
