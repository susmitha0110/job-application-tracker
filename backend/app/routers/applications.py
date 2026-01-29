from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..db import get_db
from .. import models, schemas
from ..auth import require_admin

router = APIRouter()

@router.get("/", response_model=List[schemas.ApplicationOut])
def list_applications(
    status: Optional[str] = None,
    company: Optional[str] = None,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    q = db.query(models.Application)
    if status:
        q = q.filter(models.Application.status == status)
    if company:
        q = q.filter(models.Application.company.ilike(f"%{company}%"))
    return q.order_by(models.Application.id.desc()).all()

@router.post("/", response_model=schemas.ApplicationOut)
def create_application(
    payload: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    app = models.Application(**payload.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app

@router.patch("/{app_id}", response_model=schemas.ApplicationOut)
def update_application(
    app_id: int,
    payload: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    app = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(app, k, v)

    db.commit()
    db.refresh(app)
    return app

@router.delete("/{app_id}")
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    app = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app)
    db.commit()
    return {"deleted": True}
