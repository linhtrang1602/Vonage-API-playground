import logging
from fastapi import APIRouter
from pydantic import BaseModel
from services.vonage_messages import send_message

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/messages", tags=["messages"])


class SendRequest(BaseModel):
    to: str
    channel: str = "whatsapp"
    text: str


@router.post("/send")
async def api_messages_send(body: SendRequest):
    """Send a message via WhatsApp or SMS."""
    try:
        data = await send_message(body.to, body.channel, body.text)
        message_uuid = data.get("message_uuid", "")
        return {
            "success": bool(message_uuid),
            "message_id": message_uuid,
            "error": None if message_uuid else data.get("title", "Unknown error"),
        }
    except Exception as e:
        logger.error(f"[Messages] send error: {e}")
        return {"success": False, "message_id": None, "error": str(e)}
