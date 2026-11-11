from fastapi import FastAPI

from .listings.routes import router as listings_router

app = FastAPI(title="CribSwipe API")
app.include_router(listings_router)
