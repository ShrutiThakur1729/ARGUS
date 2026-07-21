from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.config import settings

router = APIRouter()

@router.get("/")
def health_check(db: Session = Depends(get_db)):
    db_status = "error"
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "unhealthy", "database": db_status}
        )

    telegram_configured = bool(settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID)

    return {
        "status": "healthy",
        "database": db_status,
        "telegram_configured": telegram_configured,
    }
