#defines the API structure-what a valid request/response looks like

from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

#describes what data is required when someone creates a new application.
class ApplicationCreate(BaseModel):
    company: str
    role: str
    status: str = "Applied"
    date_applied: Optional[date] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None

#describes what gets sent back to the user
class ApplicationResponse(BaseModel):
    id: int
    company: str
    role: str
    status: str
    date_applied: Optional[date] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        
class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    date_applied: Optional[date] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None