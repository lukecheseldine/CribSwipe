"""Runtime configuration, read from environment variables."""
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# The data collector owns this database; the API only reads it.
DB_PATH = Path(os.environ.get("CRIBSWIPE_DB_PATH", REPO_ROOT / "data-collector" / "listings.db"))

# Accounts, sessions, saved filters, and shortlists. Separate from the scraper database.
APP_DB_PATH = Path(
    os.environ.get("CRIBSWIPE_APP_DB_PATH", Path(__file__).resolve().parents[1] / "cribswipe.db")
)
