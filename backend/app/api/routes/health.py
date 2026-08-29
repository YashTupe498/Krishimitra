from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter()

@router.get("/")
def health_check():
    return {"status": "ok"}

@router.get("/db")
def db_health_check(db: Session = Depends(get_db)):
    try:
        # Execute a simple query to verify database connectivity
        db.execute(text("SELECT 1"))
        return {"status": "ok", "message": "Database connection successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
