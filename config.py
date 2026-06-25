import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class Settings:
    """Application settings loaded from environment variables."""

    def __init__(self):
        self.VONAGE_API_KEY: str = os.getenv("VONAGE_API_KEY", "")
        self.VONAGE_API_SECRET: str = os.getenv("VONAGE_API_SECRET", "")
        self.BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")
        self.VONAGE_MESSAGES_BASE_URL: str = os.getenv(
            "VONAGE_MESSAGES_BASE_URL", "https://messages-sandbox.nexmo.com"
        )
        self.VONAGE_FROM_NUMBER: str = os.getenv("VONAGE_FROM_NUMBER", "14157386102")

        self._validate()

    def _validate(self):
        """Raise clear errors if required environment variables are missing."""
        required = {
            "VONAGE_API_KEY": self.VONAGE_API_KEY,
            "VONAGE_API_SECRET": self.VONAGE_API_SECRET,
        }
        missing = [name for name, value in required.items() if not value]
        if missing:
            for name in missing:
                logger.error(f"Missing {name} in .env")
            raise ValueError(
                "Missing required environment variables: "
                + ", ".join(f"{name} in .env" for name in missing)
            )
        logger.info("Settings loaded successfully")
        logger.info(f"BASE_URL = {self.BASE_URL}")
        logger.info(
            f"VONAGE_MESSAGES_BASE_URL = {self.VONAGE_MESSAGES_BASE_URL}"
        )


settings = Settings()
