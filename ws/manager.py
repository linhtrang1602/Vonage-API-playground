import logging
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time event broadcasting."""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            f"[WS] Client connected. Total: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        """Remove a disconnected WebSocket client."""
        self.active_connections.remove(websocket)
        logger.info(
            f"[WS] Client disconnected. Total: {len(self.active_connections)}"
        )

    async def broadcast(self, data: dict):
        """Send JSON data to all connected WebSocket clients."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)
        logger.info(
            f"[WS] Broadcast to {len(self.active_connections)} clients: "
            f"type={data.get('type', 'unknown')}"
        )


manager = ConnectionManager()
