"""Read-only access to the data collector's SQLite database."""
import sqlite3
from collections.abc import Iterator

from fastapi import HTTPException, status

from . import config


def get_db() -> Iterator[sqlite3.Connection]:
    """FastAPI dependency yielding a read-only connection for one request."""
    if not config.DB_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No listings database yet. Run the data collector first.",
        )
    # FastAPI may run the dependency and the endpoint on different worker threads.
    conn = sqlite3.connect(f"file:{config.DB_PATH}?mode=ro", uri=True, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
