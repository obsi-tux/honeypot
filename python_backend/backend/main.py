import os
from datetime import datetime, timezone
from typing import Annotated

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.db import FindingRow, ScanRow, SessionLocal, init_db
from backend.enrichment import classify_finding
from shared.models import Finding

app = FastAPI(title="Secret Leak Detector API", version="1.0.0")


@app.on_event("startup")
def startup() -> None:
    init_db()


def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_api_key(x_api_key: Annotated[str | None, Header()] = None) -> None:
    expected = os.getenv("SECRETSCAN_API_KEY")
    if expected and x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")


class ResolveResponse(BaseModel):
    id: int
    resolved: bool


def _serialize(row: FindingRow) -> dict:
    return {column.name: getattr(row, column.name) for column in FindingRow.__table__.columns}


def _enrich_and_save(finding_id: int, masked_value: str, context: str) -> None:
    db = SessionLocal()
    try:
        row = db.get(FindingRow, finding_id)
        if row and row.confidence != "HIGH":
            row.llm_confidence = classify_finding(masked_value, context)
            db.commit()
    finally:
        db.close()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "secret-leak-detector"}


@app.post("/findings", dependencies=[Depends(require_api_key)])
def create_findings(
    payload: Finding | list[Finding],
    background_tasks: BackgroundTasks,
    db: Session = Depends(db_session),
) -> dict:
    findings = payload if isinstance(payload, list) else [payload]
    created: list[FindingRow] = []
    for finding in findings:
        row = FindingRow(**finding.model_dump())
        db.add(row)
        created.append(row)
    if findings:
        db.add(ScanRow(repo_name=findings[0].repo_name, files_scanned=len({f.file_path for f in findings}), findings_count=len(findings)))
    db.commit()
    for row, finding in zip(created, findings):
        db.refresh(row)
        if finding.confidence != "HIGH":
            background_tasks.add_task(_enrich_and_save, row.id, finding.masked_value, f"{finding.file_path}:{finding.line_number}")
    return {"accepted": len(created), "ids": [row.id for row in created]}


@app.get("/findings")
def list_findings(
    repo: str | None = None,
    confidence: str | None = Query(default=None, pattern="^(HIGH|MEDIUM)$"),
    resolved: bool | None = None,
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(db_session),
) -> dict:
    query = select(FindingRow).order_by(FindingRow.detected_at.desc()).limit(limit).offset(offset)
    if repo:
        query = query.where(FindingRow.repo_name == repo)
    if confidence:
        query = query.where(FindingRow.confidence == confidence)
    if resolved is not None:
        query = query.where(FindingRow.resolved == resolved)
    rows = db.scalars(query).all()
    return {"items": [_serialize(row) for row in rows], "limit": limit, "offset": offset}


@app.patch("/findings/{finding_id}/resolve", response_model=ResolveResponse)
def resolve_finding(finding_id: int, db: Session = Depends(db_session)) -> ResolveResponse:
    row = db.get(FindingRow, finding_id)
    if not row:
        raise HTTPException(status_code=404, detail="Finding not found")
    row.resolved = True
    db.commit()
    return ResolveResponse(id=row.id, resolved=True)


@app.get("/stats")
def stats(db: Session = Depends(db_session)) -> dict:
    total_scans = db.scalar(select(func.count(ScanRow.id))) or 0
    total_findings = db.scalar(select(func.count(FindingRow.id))) or 0
    total_blocked = db.scalar(select(func.count(FindingRow.id)).where(FindingRow.commit_blocked.is_(True))) or 0
    unresolved = db.scalar(select(func.count(FindingRow.id)).where(FindingRow.resolved.is_(False))) or 0
    types = db.execute(select(FindingRow.secret_type, func.count(FindingRow.id)).group_by(FindingRow.secret_type)).all()
    confidence = db.execute(select(FindingRow.confidence, func.count(FindingRow.id)).group_by(FindingRow.confidence)).all()
    score = round(((total_findings - unresolved) / total_findings) * 100, 2) if total_findings else 100.0
    return {
        "total_scans": total_scans,
        "total_findings": total_findings,
        "total_blocked_commits": total_blocked,
        "findings_by_type": dict(types),
        "findings_by_confidence": dict(confidence),
        "unresolved_count": unresolved,
        "compliance_score": score,
    }
