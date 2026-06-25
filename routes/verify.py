import logging
from fastapi import APIRouter
from pydantic import BaseModel
from services.vonage_verify import start_verify, check_verify, cancel_verify

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/verify", tags=["verify"])


class StartRequest(BaseModel):
    phone: str
    brand: str = "VonageDemo"


class CheckRequest(BaseModel):
    request_id: str
    code: str


class CancelRequest(BaseModel):
    request_id: str


@router.post("/start")
async def api_verify_start(body: StartRequest):
    """Send OTP to a phone number."""
    try:
        data = await start_verify(body.phone, body.brand)
        success = data.get("status") == "0"
        return {
            "success": success,
            "data": data,
            "error": None if success else data.get("error_text", "Unknown error"),
        }
    except Exception as e:
        logger.error(f"[Verify] start error: {e}")
        return {"success": False, "data": None, "error": str(e)}


@router.post("/check")
async def api_verify_check(body: CheckRequest):
    """Check OTP code."""
    try:
        data = await check_verify(body.request_id, body.code)
        success = data.get("status") == "0"
        return {
            "success": success,
            "data": data,
            "error": None if success else data.get("error_text", "Unknown error"),
        }
    except Exception as e:
        logger.error(f"[Verify] check error: {e}")
        return {"success": False, "data": None, "error": str(e)}


@router.post("/cancel")
async def api_verify_cancel(body: CancelRequest):
    """Cancel an in-progress verify request."""
    try:
        data = await cancel_verify(body.request_id)
        success = data.get("status") == "0"
        return {
            "success": success,
            "data": data,
            "error": None if success else data.get("error_text", "Unknown error"),
        }
    except Exception as e:
        logger.error(f"[Verify] cancel error: {e}")
        return {"success": False, "data": None, "error": str(e)}
