from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, applications

import os
from .db import Base, engine

app = FastAPI(title="Portfolio API", version="1.0")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
