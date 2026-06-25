import logging
from fastapi import APIRouter, Request
from ws.manager import manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/inbound")
async def webhook_inbound(request: Request):
    """Handle inbound messages from Vonage.

    Parses the payload, logs it, and broadcasts to all WebSocket clients.
    Always returns HTTP 200 as required by Vonage.
    """
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    logger.info(f"[Webhook/inbound] Payload: {payload}")

    # Safely extract sender
    sender = payload.get("from", "")
    if isinstance(sender, dict):
        sender = sender.get("number", sender.get("id", str(sender)))

    # Safely extract text
    text = payload.get("text", "")
    if not text:
        msg_obj = payload.get("message", {})
        if isinstance(msg_obj, dict):
            text = msg_obj.get("content", {}).get("text", "")

    # Broadcast with type field so frontend can distinguish event types
    await manager.broadcast({
        "type": "inbound",
        "from": sender,
        "text": text,
        "timestamp": payload.get("timestamp", ""),
        "raw": payload,
    })

    return {"status": "ok"}


@router.post("/status")
async def webhook_status(request: Request):
    """Handle message status updates from Vonage.

    Parses the payload, logs it, and broadcasts to all WebSocket clients.
    Always returns HTTP 200 as required by Vonage.
    """
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    logger.info(f"[Webhook/status] Payload: {payload}")

    # Broadcast with type field so frontend can distinguish event types
    await manager.broadcast({
        "type": "status",
        "message_uuid": payload.get("message_uuid", ""),
        "status": payload.get("status", ""),
        "timestamp": payload.get("timestamp", ""),
        "raw": payload,
    })

    return {"status": "ok"}
