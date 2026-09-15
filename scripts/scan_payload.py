import json
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "python_backend"))

from detector.engine import scan_file


def main() -> None:
    payload = json.loads(sys.stdin.read() or "{}")
    source = str(payload.get("source", ""))
    filename = str(payload.get("filename", "workspace.env"))
    repo_name = str(payload.get("repoName", "local-workspace"))
    temp_dir = Path("/tmp/secret-leak-detector")
    temp_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(filename).name or "workspace.env"
    target = temp_dir / safe_name
    target.write_text(source, encoding="utf-8")
    findings = scan_file(str(target), repo_name=repo_name)
    result = []
    for finding in findings:
        item = finding.model_dump(mode="json")
        item["file_path"] = filename
        item["detected_at"] = datetime.now(timezone.utc).isoformat()
        result.append(item)
    print(json.dumps({"findings": result, "files_scanned": 1}, separators=(",", ":")))


if __name__ == "__main__":
    main()
