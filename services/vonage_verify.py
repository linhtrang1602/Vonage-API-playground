import logging
import httpx
from config import settings

logger = logging.getLogger(__name__)

VERIFY_BASE_URL = "https://api.nexmo.com/verify"


async def start_verify(phone: str, brand: str = "VonageDemo") -> dict:
    """Send OTP to a phone number via Vonage Verify API.

    Uses application/x-www-form-urlencoded (data=), NOT JSON.
    """
    url = f"{VERIFY_BASE_URL}/json"
    # Vonage Verify API requires E.164 format without the '+' sign
    clean_phone = phone.replace("+", "").replace(" ", "")

    data = {
        "api_key": settings.VONAGE_API_KEY,
        "api_secret": settings.VONAGE_API_SECRET,
        "number": clean_phone,
        "brand": brand,
    }
    logger.info(f"[Verify] Sending OTP to {phone} with brand '{brand}'")
    logger.info(f"[Verify] POST {url}")

    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data)
        result = response.json()

    logger.info(f"[Verify] Response status: {response.status_code}")
    logger.info(f"[Verify] Response body: {result}")
    return result


async def check_verify(request_id: str, code: str) -> dict:
    """Check OTP code against a verify request.

    Uses application/x-www-form-urlencoded (data=), NOT JSON.
    """
    url = f"{VERIFY_BASE_URL}/check/json"
    data = {
        "api_key": settings.VONAGE_API_KEY,
        "api_secret": settings.VONAGE_API_SECRET,
        "request_id": request_id,
        "code": code,
    }
    logger.info(f"[Verify] Checking OTP for request {request_id}")
    logger.info(f"[Verify] POST {url}")

    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data)
        result = response.json()

    logger.info(f"[Verify] Response status: {response.status_code}")
    logger.info(f"[Verify] Response body: {result}")
    return result


async def cancel_verify(request_id: str) -> dict:
    """Cancel an in-progress verify request.

    Uses application/x-www-form-urlencoded (data=), NOT JSON.
    """
    url = f"{VERIFY_BASE_URL}/control/json"
    data = {
        "api_key": settings.VONAGE_API_KEY,
        "api_secret": settings.VONAGE_API_SECRET,
        "request_id": request_id,
        "cmd": "cancel",
    }
    logger.info(f"[Verify] Cancelling request {request_id}")
    logger.info(f"[Verify] POST {url}")

    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data)
        result = response.json()

    logger.info(f"[Verify] Response status: {response.status_code}")
    logger.info(f"[Verify] Response body: {result}")
    return result
