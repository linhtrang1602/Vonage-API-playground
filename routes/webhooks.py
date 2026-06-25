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

    # Broadcast with type field so frontend can distinguish event types
    await manager.broadcast({
        "type": "inbound",
        "from": payload.get("from", {}).get("number", ""),
        "text": payload.get("message", {}).get("content", {}).get("text", ""),
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
