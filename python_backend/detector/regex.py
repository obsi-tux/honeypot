import re
from dataclasses import dataclass


@dataclass(frozen=True)
class Pattern:
    name: str
    expression: re.Pattern[str]


PATTERNS = (
    Pattern("AWS Access Key", re.compile(r"AKIA[0-9A-Z]{16}")),
    Pattern(
        "Possible API credential",
        re.compile(r"(?i)(api_key|apikey|secret|password|passwd|token)\s*[:=]\s*[\"']?([A-Za-z0-9\-_+/=]{8,})[\"']?"),
    ),
    Pattern("GitHub Personal Access Token", re.compile(r"gh[pousr]_[A-Za-z0-9]{36,}")),
    Pattern(
        "Private key",
        re.compile(r"-----BEGIN (RSA|OPENSSH|EC|DSA|PGP) PRIVATE KEY-----"),
    ),
    Pattern("Slack token", re.compile(r"xox[baprs]-[0-9A-Za-z-]{10,}")),
)

ASSIGNMENT_VALUE = re.compile(
    r"(?i)(?:api_key|apikey|secret|password|passwd|token)\s*[:=]\s*[\"']?([A-Za-z0-9\-_+/=]{16,})"
)


def matches(line: str) -> list[tuple[Pattern, str]]:
    found: list[tuple[Pattern, str]] = []
    for pattern in PATTERNS:
        match = pattern.expression.search(line)
        if match:
            value = match.group(2) if pattern.name == "Possible API credential" and match.lastindex and match.lastindex >= 2 else match.group(0)
            found.append((pattern, value))
    return found
