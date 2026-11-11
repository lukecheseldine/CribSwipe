"""Email addresses and mobile numbers, in the same shape the web forms accept."""
import re

_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def normalize_email(value: str) -> str | None:
    email = value.strip().lower()
    return email if _EMAIL.fullmatch(email) else None


def normalize_phone(value: str) -> str | None:
    trimmed = value.strip()
    if not trimmed or not re.fullmatch(r"[+\d\s().-]+", trimmed):
        return None
    digits = re.sub(r"\D", "", trimmed)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if 10 <= len(digits) <= 15:
        return digits
    return None


def parse_identifier(value: str) -> tuple[str, str] | None:
    """('email', normalized) or ('phone', digits). None when it is neither."""
    if "@" in value:
        email = normalize_email(value)
        return ("email", email) if email else None
    phone = normalize_phone(value)
    return ("phone", phone) if phone else None
