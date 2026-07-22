import logging
import requests
from typing import Optional
from backend.config import settings

logger = logging.getLogger("argus.ai")

class AIService:
    @staticmethod
    def generate_response(prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Generates text using LLM providers with automatic fallback.
        Priority:
        1. Gemini (direct API via HTTPS)
        2. OpenRouter (API via HTTPS)
        """
        if not settings.AI_ENABLED:
            logger.warning("AI features are currently disabled (missing credentials).")
            return "AI service is currently disabled. Please configure GEMINI_API_KEY or OPENROUTER_API_KEY."

        # 1. Attempt Gemini direct API if configured
        if settings.GEMINI_API_KEY:
            try:
                logger.info("Attempting AI generation via Gemini API...")
                url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                
                # Format payload
                contents = [{"parts": [{"text": prompt}]}]
                payload = {
                    "contents": contents
                }
                if system_instruction:
                    payload["systemInstruction"] = {
                        "parts": [{"text": system_instruction}]
                    }
                
                response = requests.post(url, json=payload, timeout=12)
                if response.status_code == 200:
                    resp_data = response.json()
                    text = resp_data["candidates"][0]["content"]["parts"][0]["text"]
                    logger.info("Gemini API call succeeded.")
                    return text.strip()
                else:
                    logger.warning(
                        f"Gemini API returned status code {response.status_code}: {response.text}. Falling back to OpenRouter..."
                    )
            except Exception as e:
                logger.error(f"Gemini API call failed with exception: {e}. Falling back to OpenRouter...")

        # 2. Attempt OpenRouter fallback if configured
        if settings.OPENROUTER_API_KEY:
            try:
                logger.info("Attempting AI generation via OpenRouter fallback...")
                url = "https://openrouter.ai/api/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                messages = []
                if system_instruction:
                    messages.append({"role": "system", "content": system_instruction})
                messages.append({"role": "user", "content": prompt})
                
                payload = {
                    "model": "google/gemini-2.5-flash",
                    "messages": messages,
                    "max_tokens": 1000
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=12)
                if response.status_code == 200:
                    resp_data = response.json()
                    text = resp_data["choices"][0]["message"]["content"]
                    logger.info("OpenRouter API call succeeded.")
                    return text.strip()
                else:
                    logger.error(f"OpenRouter API returned status code {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"OpenRouter API call failed with exception: {e}")

        # If we reach here, both failed or only one was configured and it failed
        return "AI response unavailable. All configured LLM providers failed to respond."

ai_service = AIService()
