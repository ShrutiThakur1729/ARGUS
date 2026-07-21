from abc import ABC, abstractmethod
import logging
import requests
from backend.config import settings

logger = logging.getLogger("argus.notifications")

class BaseNotificationChannel(ABC):
    @abstractmethod
    def send(self, title: str, message: str, severity: str) -> bool:
        """Send notification to the channel."""
        pass

class TelegramNotificationChannel(BaseNotificationChannel):
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    def send(self, title: str, message: str, severity: str) -> bool:
        if not self.bot_token or not self.chat_id:
            logger.warning("Telegram configuration missing. Skipping telegram notification.")
            return False
        
        emoji_map = {
            "low": "ℹ️",
            "medium": "⚠️",
            "high": "🚨",
            "critical": "🔥"
        }
        emoji = emoji_map.get(severity.lower(), "📢")
        formatted_message = f"{emoji} *{title}* (Severity: {severity.upper()})\n\n{message}"
        
        payload = {
            "chat_id": self.chat_id,
            "text": formatted_message,
            "parse_mode": "Markdown"
        }
        try:
            response = requests.post(self.api_url, json=payload, timeout=10)
            if response.status_code != 200:
                logger.error(f"Failed to send Telegram alert: {response.text}")
                return False
            return True
        except Exception as e:
            logger.error(f"Error sending Telegram notification: {str(e)}")
            return False

class InAppNotificationChannel(BaseNotificationChannel):
    """Placeholder channel for in-app alert streaming/saving."""
    def send(self, title: str, message: str, severity: str) -> bool:
        logger.info(f"[In-App Alert] {title} - {severity.upper()} - {message}")
        return True

class NotificationService:
    def __init__(self):
        self.channels = []
        # Register Telegram Channel if credentials are provided
        if settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID:
            self.channels.append(
                TelegramNotificationChannel(
                    bot_token=settings.TELEGRAM_BOT_TOKEN,
                    chat_id=settings.TELEGRAM_CHAT_ID
                )
            )
        # Register In-App Channel
        self.channels.append(InAppNotificationChannel())

    def dispatch(self, title: str, message: str, severity: str) -> None:
        for channel in self.channels:
            try:
                channel.send(title, message, severity)
            except Exception as e:
                logger.error(f"Error dispatching to channel {channel.__class__.__name__}: {str(e)}")

notification_service = NotificationService()
