import os
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./secret_scan.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class FindingRow(Base):
    __tablename__ = "findings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    file_path: Mapped[str] = mapped_column(String(1024))
    line_number: Mapped[int] = mapped_column(Integer)
    secret_type: Mapped[str] = mapped_column(String(255))
    masked_value: Mapped[str] = mapped_column(String(1024))
    confidence: Mapped[str] = mapped_column(String(16))
    regex_matched: Mapped[bool] = mapped_column(Boolean)
    entropy_score: Mapped[float] = mapped_column(Float)
    llm_confidence: Mapped[str | None] = mapped_column(String(16), nullable=True)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    repo_name: Mapped[str] = mapped_column(String(512), index=True)
    commit_blocked: Mapped[bool] = mapped_column(Boolean)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)


class ScanRow(Base):
    __tablename__ = "scans"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    repo_name: Mapped[str] = mapped_column(String(512), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    files_scanned: Mapped[int] = mapped_column(Integer, default=0)
    findings_count: Mapped[int] = mapped_column(Integer, default=0)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
