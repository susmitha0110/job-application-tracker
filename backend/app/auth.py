import os
from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


from fastapi import Depends, HTTPException, status

from jose import jwt, JWTError
from passlib.context import CryptContext

bearer_scheme = HTTPBearer()

# Read config from environment
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev_secret_change_me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "120"))

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@portfolio.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@12345")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# creates JWT
def create_access_token(data: dict, expires_minutes: int = JWT_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_admin(email: str, password: str) -> bool:
    # For now we compare directly (simple learning version)
    # Later we can store hashed password in env.
    return email == ADMIN_EMAIL and password == ADMIN_PASSWORD

# checks JWT before a protected endpoint runs 
# oauth2_scheme extracts token from authorization header
def require_admin(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        role = payload.get("role")
        email = payload.get("sub")
        if role != "admin" or email != ADMIN_EMAIL:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authorized")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
