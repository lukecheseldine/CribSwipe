"""Sign-up, sign-in, and the signed-in account: profile, default search, shortlist."""
import re
import sqlite3
from collections.abc import Iterator
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status

from .. import config
from . import repository
from .identifiers import normalize_email, normalize_phone, parse_identifier
from .schemas import (
    AccountResponse,
    AuthRequest,
    FiltersPayload,
    ProfilePayload,
    ShortlistPayload,
    SignupRequest,
)

router = APIRouter(tags=["account"])

COOKIE = "cribswipe_session"
_MAX_PHOTO = 400_000
_NAME = re.compile(r"\S+")


def get_app_db() -> Iterator[sqlite3.Connection]:
    config.APP_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(config.APP_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    repository.prepare(conn)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


AppDb = Annotated[sqlite3.Connection, Depends(get_app_db)]


def current_user(
    conn: AppDb,
    token: Annotated[str | None, Cookie(alias=COOKIE)] = None,
) -> sqlite3.Row:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required.")
    user = repository.user_for_token(conn, token)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required.")
    return user


SignedIn = Annotated[sqlite3.Row, Depends(current_user)]


def _set_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        COOKIE,
        token,
        max_age=60 * 60 * 24 * repository.SESSION_DAYS,
        httponly=True,
        samesite="lax",
        path="/",
    )


def _password_ok(password: str) -> bool:
    return len(password) >= 8 and any(character.isdigit() for character in password)


def _full_name(name: str) -> str:
    cleaned = " ".join(_NAME.findall(name))
    if len(cleaned.split(" ")) < 2:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Enter your first and last name.")
    return cleaned


def _check_filters(filters: FiltersPayload) -> None:
    if any(count < 0 for count in (*filters.bedrooms, *filters.bathrooms)):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Room counts can't be negative.")
    if filters.move_in_date is not None and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", filters.move_in_date):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Move-in date must be YYYY-MM-DD.")


def _contacts(email: str, phone: str) -> tuple[str | None, str | None]:
    normalized_email = normalize_email(email) if email.strip() else None
    normalized_phone = normalize_phone(phone) if phone.strip() else None
    if email.strip() and normalized_email is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Enter a valid email.")
    if phone.strip() and normalized_phone is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Enter a valid mobile number.")
    if normalized_email is None and normalized_phone is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Enter an email or a mobile number.",
        )
    return normalized_email, normalized_phone


def _photo(photo: str | None) -> str | None:
    if photo is None:
        return None
    if not photo.startswith("data:image/") or len(photo) > _MAX_PHOTO:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Choose a smaller photo.")
    return photo


def _open(conn: sqlite3.Connection, response: Response, user_id: str) -> AccountResponse:
    _set_cookie(response, repository.open_session(conn, user_id))
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return AccountResponse.model_validate(repository.account_dict(conn, user))


@router.post("/api/auth/signup", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, conn: AppDb, response: Response) -> AccountResponse:
    name = _full_name(body.name)
    if not _password_ok(body.password):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Use at least 8 characters, including a number.",
        )
    parsed = parse_identifier(body.identifier)
    if parsed is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Enter a valid email or mobile number.",
        )
    kind, value = parsed
    email = value if kind == "email" else None
    phone = value if kind == "phone" else None
    if repository.find_user(conn, email=email, phone=phone) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email or mobile number already exists.",
        )
    user_id = repository.create_user(conn, name=name, email=email, phone=phone, password=body.password)
    return _open(conn, response, user_id)


@router.post("/api/auth/login", response_model=AccountResponse)
def login(body: AuthRequest, conn: AppDb, response: Response) -> AccountResponse:
    parsed = parse_identifier(body.identifier)
    user = None
    if parsed is not None:
        kind, value = parsed
        user = repository.find_user(
            conn,
            email=value if kind == "email" else None,
            phone=value if kind == "phone" else None,
        )
    if not repository.password_matches(user, body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email, mobile number, or password is incorrect.",
        )
    return _open(conn, response, user["id"])


@router.post("/api/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    conn: AppDb,
    response: Response,
    token: Annotated[str | None, Cookie(alias=COOKIE)] = None,
) -> None:
    if token:
        repository.close_session(conn, token)
    response.delete_cookie(COOKIE, path="/")


@router.get("/api/account", response_model=AccountResponse)
def get_account(conn: AppDb, user: SignedIn) -> AccountResponse:
    return AccountResponse.model_validate(repository.account_dict(conn, user))


@router.put("/api/account/profile", response_model=AccountResponse)
def update_profile(body: ProfilePayload, conn: AppDb, user: SignedIn) -> AccountResponse:
    name = _full_name(body.name)
    email, phone = _contacts(body.email, body.phone)
    if email is not None and repository.email_taken(conn, email, user["id"]):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That email is already in use.")
    if phone is not None and repository.phone_taken(conn, phone, user["id"]):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That mobile number is already in use.")
    repository.update_profile(conn, user["id"], name=name, email=email, phone=phone, photo=_photo(body.photo))
    updated = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return AccountResponse.model_validate(repository.account_dict(conn, updated))


@router.put("/api/account/filters", response_model=AccountResponse)
def update_filters(body: FiltersPayload, conn: AppDb, user: SignedIn) -> AccountResponse:
    _check_filters(body)
    repository.save_filters(conn, user["id"], body)
    updated = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return AccountResponse.model_validate(repository.account_dict(conn, updated))


@router.post("/api/account/shortlist", response_model=AccountResponse)
def save_listing(body: ShortlistPayload, conn: AppDb, user: SignedIn) -> AccountResponse:
    listing_id = body.listing.get("id")
    if not isinstance(listing_id, str) or not listing_id.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="A listing id is required.")
    repository.add_shortlist(conn, user["id"], body.listing)
    updated = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return AccountResponse.model_validate(repository.account_dict(conn, updated))


@router.delete("/api/account/shortlist/{listing_id}", response_model=AccountResponse)
def remove_listing(listing_id: str, conn: AppDb, user: SignedIn) -> AccountResponse:
    repository.remove_shortlist(conn, user["id"], listing_id)
    updated = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return AccountResponse.model_validate(repository.account_dict(conn, updated))
