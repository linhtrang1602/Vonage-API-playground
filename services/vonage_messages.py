import logging
import httpx
from config import settings

logger = logging.getLogger(__name__)


async def send_message(to: str, channel: str, text: str) -> dict:
    """Send a message via Vonage Messages API (sandbox or prod).

    Uses Basic Auth with API key and secret.
    Channel can be 'whatsapp' or 'sms'.
    """
    url = f"{settings.VONAGE_MESSAGES_BASE_URL}/v1/messages"
    clean_to = to.replace("+", "").replace(" ", "")

    payload = {
        "message_type": "text",
        "text": text,
        "to": clean_to,
        "from": settings.VONAGE_FROM_NUMBER,
        "channel": channel,
    }

    logger.info(f"[Messages] Sending {channel} message to {to}")
    logger.info(f"[Messages] POST {url}")
    logger.info(f"[Messages] Payload: {payload}")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json=payload,
            auth=(settings.VONAGE_API_KEY, settings.VONAGE_API_SECRET),
            headers={"Content-Type": "application/json", "Accept": "application/json"},
        )
        result = response.json()

    logger.info(f"[Messages] Response status: {response.status_code}")
    logger.info(f"[Messages] Response body: {result}")
    return result
