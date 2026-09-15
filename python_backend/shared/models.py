from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


class Finding(BaseModel):
    file_path: str
    line_number: int = Field(ge=1)
    secret_type: str
    masked_value: str
    confidence: Literal["HIGH", "MEDIUM"]
    regex_matched: bool
    entropy_score: float = Field(ge=0)
    llm_confidence: Literal["HIGH", "MEDIUM", "LOW"] | None = None
    detected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    repo_name: str
    commit_blocked: bool


class FindingCreate(Finding):
    pass
