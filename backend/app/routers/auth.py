from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..auth import create_access_token, verify_admin

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str


# If credentials are correct then return token otherwise return 401 error
@router.post("/login")
def login(payload: LoginRequest):
    if not verify_admin(payload.email, payload.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": payload.email, "role": "admin"})
    return {"access_token": token, "token_type": "bearer"}
