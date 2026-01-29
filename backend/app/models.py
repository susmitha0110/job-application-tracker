
from sqlalchemy import Column, Integer, String, Text
from .db import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    company = Column(String(120), nullable=False)
    role = Column(String(160), nullable=False)

    status = Column(String(40), nullable=False, server_default="Applied")

    location = Column(String(120), nullable=True)         # e.g., Birmingham, AL / Remote
    job_url = Column(String(300), nullable=True)

    notes = Column(Text, nullable=True)
