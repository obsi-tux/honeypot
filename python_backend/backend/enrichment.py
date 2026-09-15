import logging
import os

logger = logging.getLogger(__name__)


def classify_finding(masked_value: str, context: str = "") -> str | None:
    """Return HIGH/MEDIUM/LOW, or None when optional enrichment is unavailable."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    try:
        from anthropic import Anthropic

        client = Anthropic(api_key=api_key, timeout=5.0)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=20,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Classify whether this is a real credential or a placeholder/test fixture. "
                        "Reply with exactly HIGH, MEDIUM, or LOW. Never infer or reconstruct raw secrets.\n"
                        f"Masked value: {masked_value}\nContext: {context[:500]}"
                    ),
                }
            ],
        )
        value = response.content[0].text.strip().upper()
        return value if value in {"HIGH", "MEDIUM", "LOW"} else None
    except Exception:
        logger.exception("Optional secret enrichment failed")
        return None
