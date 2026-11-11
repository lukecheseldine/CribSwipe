"""Users, sessions, saved filters, and shortlists in the app database."""
import json
import sqlite3
import uuid
from datetime import UTC, datetime, timedelta

from .passwords import hash_password, verify_password
from .schemas import FiltersPayload

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    photo TEXT,
    filters_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS shortlist (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id TEXT NOT NULL,
    listing_json TEXT NOT NULL,
    saved_at TEXT NOT NULL,
    PRIMARY KEY (user_id, listing_id)
);
"""

SESSION_DAYS = 30
EMPTY_FILTERS = FiltersPayload().model_dump()


def prepare(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA)


def create_user(
    conn: sqlite3.Connection,
    *,
    name: str,
    email: str | None,
    phone: str | None,
    password: str,
) -> str:
    user_id = uuid.uuid4().hex
    conn.execute(
        """INSERT INTO users (id, name, email, phone, password_hash, photo, filters_json, created_at)
           VALUES (?, ?, ?, ?, ?, NULL, ?, ?)""",
        (
            user_id,
            name,
            email,
            phone,
            hash_password(password),
            json.dumps(EMPTY_FILTERS),
            _now(),
        ),
    )
    return user_id


def find_user(conn: sqlite3.Connection, *, email: str | None, phone: str | None) -> sqlite3.Row | None:
    if email is not None:
        return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    return conn.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()


def password_matches(user: sqlite3.Row | None, password: str) -> bool:
    if user is None:
        hash_password(password)
        return False
    return verify_password(password, user["password_hash"])


def open_session(conn: sqlite3.Connection, user_id: str) -> str:
    token = uuid.uuid4().hex
    expires = (datetime.now(UTC) + timedelta(days=SESSION_DAYS)).isoformat()
    conn.execute(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expires),
    )
    return token


def user_for_token(conn: sqlite3.Connection, token: str) -> sqlite3.Row | None:
    row = conn.execute(
        """SELECT users.* FROM sessions
           JOIN users ON users.id = sessions.user_id
           WHERE sessions.token = ? AND sessions.expires_at > ?""",
        (token, _now()),
    ).fetchone()
    return row


def close_session(conn: sqlite3.Connection, token: str) -> None:
    conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


def update_profile(
    conn: sqlite3.Connection,
    user_id: str,
    *,
    name: str,
    email: str | None,
    phone: str | None,
    photo: str | None,
) -> None:
    conn.execute(
        "UPDATE users SET name = ?, email = ?, phone = ?, photo = ? WHERE id = ?",
        (name, email, phone, photo, user_id),
    )


def email_taken(conn: sqlite3.Connection, email: str, user_id: str) -> bool:
    row = conn.execute(
        "SELECT 1 FROM users WHERE email = ? AND id != ?", (email, user_id)
    ).fetchone()
    return row is not None


def phone_taken(conn: sqlite3.Connection, phone: str, user_id: str) -> bool:
    row = conn.execute(
        "SELECT 1 FROM users WHERE phone = ? AND id != ?", (phone, user_id)
    ).fetchone()
    return row is not None


def save_filters(conn: sqlite3.Connection, user_id: str, filters: FiltersPayload) -> None:
    conn.execute(
        "UPDATE users SET filters_json = ? WHERE id = ?",
        (filters.model_dump_json(), user_id),
    )


def list_shortlist(conn: sqlite3.Connection, user_id: str) -> list[dict]:
    rows = conn.execute(
        """SELECT listing_json, saved_at FROM shortlist
           WHERE user_id = ? ORDER BY saved_at DESC""",
        (user_id,),
    ).fetchall()
    return [{"listing": json.loads(row["listing_json"]), "saved_at": row["saved_at"]} for row in rows]


def add_shortlist(conn: sqlite3.Connection, user_id: str, listing: dict) -> None:
    saved_at = _now()
    conn.execute(
        """INSERT INTO shortlist (user_id, listing_id, listing_json, saved_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id, listing_id) DO UPDATE SET
             listing_json = excluded.listing_json""",
        (user_id, str(listing["id"]), json.dumps(listing), saved_at),
    )


def remove_shortlist(conn: sqlite3.Connection, user_id: str, listing_id: str) -> None:
    conn.execute(
        "DELETE FROM shortlist WHERE user_id = ? AND listing_id = ?",
        (user_id, listing_id),
    )


def account_dict(conn: sqlite3.Connection, user: sqlite3.Row) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"] or "",
        "phone": user["phone"] or "",
        "photo": user["photo"],
        "default_filters": json.loads(user["filters_json"]),
        "shortlist": list_shortlist(conn, user["id"]),
    }


def _now() -> str:
    return datetime.now(UTC).isoformat()
