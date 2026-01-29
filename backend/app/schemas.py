from pydantic import BaseModel
from typing import Optional

class ApplicationCreate(BaseModel):
    company: str
    role: str
    status: str = "Applied"
    location: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None

class ApplicationOut(ApplicationCreate):
    id: int

    class Config:
        from_attributes = True
