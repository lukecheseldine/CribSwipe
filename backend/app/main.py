from fastapi import FastAPI

from .accounts.routes import router as accounts_router
from .listings.routes import router as listings_router

app = FastAPI(title="CribSwipe API")
app.include_router(accounts_router)
app.include_router(listings_router)
