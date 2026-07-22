import logging
import requests
from datetime import datetime
from backend.config import settings

logger = logging.getLogger("argus.email")

class EmailService:
    @staticmethod
    def send_report_email(title: str, file_type: str, recipient: str, content: str = None) -> bool:
        """
        Sends a report email via Resend API.
        """
        if not settings.EMAIL_ENABLED:
            logger.warning("Email delivery is disabled (RESEND_API_KEY not configured).")
            return False

        try:
            logger.info(f"Sending email report '{title}' to {recipient} via Resend...")
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json"
            }
            
            content_html = ""
            if content:
                content_html = f"""
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; font-family: monospace; font-size: 11px; white-space: pre-wrap; margin: 15px 0; color: #111827;">
                    {content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')}
                </div>
                """
            
            payload = {
                "from": settings.EMAIL_FROM,
                "to": [recipient],
                "subject": f"ARGUS Threat Report: {title}",
                "html": f"""
                <div style="font-family: sans-serif; color: #1f2937; padding: 20px; max-width: 700px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #2563eb; margin-top: 0; font-family: sans-serif;">ARGUS SOC Executive Report</h2>
                    <p>Dear Security Analyst,</p>
                    <p>The requested security report has been compiled and generated successfully based on current database threat metrics.</p>
                    
                    {content_html}
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px;">
                        <tr style="border-bottom: 1px solid #f3f4f6;">
                            <td style="padding: 8px 0; color: #6b7280; font-weight: bold; width: 120px;">Report Title:</td>
                            <td style="padding: 8px 0; font-family: monospace;">{title}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f3f4f6;">
                            <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">File Format:</td>
                            <td style="padding: 8px 0; text-transform: uppercase;">{file_type}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f3f4f6;">
                            <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Generated At:</td>
                            <td style="padding: 8px 0;">{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</td>
                        </tr>
                    </table>
                    <p style="font-size: 11px; color: #9ca3af; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                        This is an automated delivery from the ARGUS AI Cyber Decision Intelligence Platform.
                    </p>
                </div>
                """
            }
            response = requests.post(url, json=payload, headers=headers, timeout=12)
            if response.status_code in (200, 201):
                logger.info("Email sent successfully via Resend API.")
                return True
            else:
                logger.error(f"Resend API returned status code {response.status_code}: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Resend API call failed with exception: {e}")
            return False

email_service = EmailService()
