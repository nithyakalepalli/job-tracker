from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
import schemas
from typing import Optional

#"look at every table class that inherits from Base, and create it in the database if it doesn't already exist.
Base.metadata.create_all(bind=engine)

app = FastAPI()

#this creates a fresh database "session"
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello, job tracker!"}

@app.post("/applications", response_model=schemas.ApplicationResponse)
def create_application(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    new_app = models.Application(**application.model_dump())
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@app.get("/applications", response_model=list[schemas.ApplicationResponse])
def get_applications(
    status: Optional[str] = None,
    company: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Application)

    if status:
        query = query.filter(models.Application.status == status)
    if company:
        query = query.filter(models.Application.company.ilike(f"%{company}%"))

    return query.all()

@app.get("/applications/{application_id}", response_model=schemas.ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db)):
    app_obj = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    return app_obj

@app.put("/applications/{application_id}", response_model=schemas.ApplicationResponse)
def update_application(application_id: int, updated: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    app_obj = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    for key, value in updated.model_dump().items():
        setattr(app_obj, key, value)
    db.commit()
    db.refresh(app_obj)
    return app_obj

@app.patch("/applications/{application_id}", response_model=schemas.ApplicationResponse)
def partial_update_application(application_id: int, updated: schemas.ApplicationUpdate, db: Session = Depends(get_db)):
    app_obj = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    
    update_data = updated.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(app_obj, key, value)
    
    db.commit()
    db.refresh(app_obj)
    return app_obj

@app.delete("/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    app_obj = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app_obj)
    db.commit()
    return {"message": "Application deleted"}