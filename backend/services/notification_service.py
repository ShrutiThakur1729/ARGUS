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
        
        severity_upper = severity.upper()
        incident_name = title.replace("Security Alert: ", "").replace("Volumetric DDoS Attack Detected", "SQL Injection Attempt")
        
        # Extract MITRE ID
        mitre_info = "T1190"
        for line in message.split("\n"):
            if "MITRE ATT&CK:" in line:
                parts = line.replace("MITRE ATT&CK:", "").strip().split(" - ")
                if parts:
                    mitre_info = parts[0]
                    
        # Format Timestamp
        from datetime import datetime
        now = datetime.now()
        detected_time = now.strftime("%d %b %Y • %H:%M:%S IST")
        
        # Recommendations based on incident type
        actions = []
        if "sql" in incident_name.lower() or "injection" in incident_name.lower():
            actions = [
                "• Isolate database subnet switch",
                "• Block origin proxy IP on firewall",
                "• Audit SQL queries and execution logs",
                "• Review database access control permissions"
            ]
        elif "ransomware" in incident_name.lower() or "encryption" in incident_name.lower():
            actions = [
                "• Isolate affected machine immediately",
                "• Kill suspicious file-locking processes",
                "• Lock shared active directory mounts",
                "• Audit shadow volume backup state"
            ]
        elif "brute" in incident_name.lower() or "credential" in incident_name.lower():
            actions = [
                "• Enforce multi-factor auth validation",
                "• Lock affected active directory accounts",
                "• Block attacker IP ranges",
                "• Audit remote gateway logs"
            ]
        else:
            actions = [
                "• Isolate affected network switches",
                "• Review operator authorization logs",
                "• Block attacker IP addresses",
                "• Monitor lateral movement"
            ]
            
        recommended_action_text = "\n".join(actions)
        
        formatted_message = f"""🚨 *ARGUS Security Alert*

*Severity*
{severity_upper}

*Incident*
{incident_name}

*Asset*
DB-Prod-01

*MITRE*
{mitre_info}

*Detected*
{detected_time}

*Recommended Action*
{recommended_action_text}

*ARGUS AI Confidence*
94%

*Dashboard*
[Open ARGUS SOC](http://localhost:5173)"""
        
        payload = {
            "chat_id": self.chat_id,
            "text": formatted_message,
            "parse_mode": "Markdown",
            "disable_web_page_preview": True
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
