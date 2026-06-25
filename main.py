import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from config import settings
from routes.verify import router as verify_router
from routes.messages import router as messages_router
from routes.webhooks import router as webhooks_router
from ws.manager import manager

# ── Logging config ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── FastAPI app ───────────────────────────────────────────────────
app = FastAPI(
    title="Vonage API Playground",
    description="Demo Vonage Verify & Messages APIs with real-time webhooks",
    version="1.0.0",
)

# ── Include routers ──────────────────────────────────────────────
app.include_router(verify_router)
app.include_router(messages_router)
app.include_router(webhooks_router)


# ── WebSocket endpoint ───────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; we only broadcast server → client
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Serve frontend ───────────────────────────────────────────────
# Mount static files AFTER API routes so /api/* and /webhooks/* take priority
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def serve_index():
    """Serve the main frontend page."""
    return FileResponse("static/index.html")


# ── Startup event ────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("="*60)
    logger.info("🔷 Vonage API Playground starting up")
    logger.info(f"   BASE_URL           = {settings.BASE_URL}")
    logger.info(f"   MESSAGES_BASE_URL  = {settings.VONAGE_MESSAGES_BASE_URL}")
    logger.info(f"   FROM_NUMBER        = {settings.VONAGE_FROM_NUMBER}")
    logger.info(f"   Webhook inbound    = {settings.BASE_URL}/webhooks/inbound")
    logger.info(f"   Webhook status     = {settings.BASE_URL}/webhooks/status")
    logger.info("="*60)
