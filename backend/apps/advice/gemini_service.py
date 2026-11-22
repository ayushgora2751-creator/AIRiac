"""
Google Gemini AI Integration for AIRiac.
Powers the AI Air Quality Assistant with conversational context awareness,
strict CPCB NAQI medical guideline grounding, and explainability provenance.
"""
import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class GeminiAssistantService:
    """
    Communicates with Google Generative AI API to provide intelligent,
    safety-verified answers regarding outdoor safety, exercise, masks,
    and indoor microclimate ventilation.
    """

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
    PREFERRED_MODELS = [
        "models/gemma-4-26b-a4b-it",
        "models/gemini-flash-latest",
        "models/gemini-pro-latest",
    ]

    def __init__(self, api_key: Optional[str] = None):
        if api_key is not None:
            raw_key = api_key
        else:
            raw_key = os.environ.get('GEMINI_API_KEY')
        self.api_key = raw_key.strip() if (raw_key and raw_key.strip()) else None

    def ask(
        self,
        question: str,
        city: str = 'Chandigarh',
        aqi: int = 150,
        category: str = 'Moderate',
        prominent_pollutant: str = 'PM2.5',
    ) -> Dict[str, Any]:
        """
        Sends user question and environmental context to Gemini API.
        Returns conversational response with explainability metadata.
        """
        if not self.api_key:
            return self._generate_rule_fallback(question, city, aqi, category)

        # Formulate system prompt adhering strictly to CPCB and WHO exposure standards
        system_context = (
            f"You are AIRiac, a compassionate and knowledgeable environmental health AI assistant for Indian cities.\n"
            f"Current City: {city}\n"
            f"Current Ambient AQI: {aqi} ({category})\n"
            f"Dominant Pollutant: {prominent_pollutant}\n\n"
            f"Guidelines to follow:\n"
            f"1. Base all outdoor, exercise, and mask recommendations on Indian CPCB NAQI bands.\n"
            f"   - 0-50 Good: Outdoor activities encouraged.\n"
            f"   - 51-100 Satisfactory: Minor discomfort to sensitive persons.\n"
            f"   - 101-200 Moderate: Breathing discomfort to people with asthma/heart disease.\n"
            f"   - 201-300 Poor: Breathing discomfort to most people on prolonged exposure. N95 recommended.\n"
            f"   - 301-400 Very Poor: Respiratory illness on prolonged exposure. Avoid strenuous outdoor activity.\n"
            f"   - 401-500 Severe: Affects healthy people and seriously impacts those with existing diseases.\n"
            f"2. Keep the answer clear, helpful, and concise (2-4 sentences max).\n"
            f"3. Always mention the current AQI ({aqi}) in your answer.\n"
        )

        user_prompt = f"User asks: {question}"

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_context}\n\n{user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 350,
            }
        }

        # Attempt call using available models
        for model in self.PREFERRED_MODELS:
            try:
                url = f"{self.BASE_URL}/{model}:generateContent"
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/json',
                        'x-goog-api-key': self.api_key,
                        'User-Agent': 'AIRiac-GeminiAssistant/1.0',
                    },
                    method='POST'
                )

                with urllib.request.urlopen(req, timeout=12) as response:
                    if response.status == 200:
                        res_data = json.loads(response.read().decode('utf-8'))
                        candidates = res_data.get('candidates', [])
                        if candidates and 'content' in candidates[0]:
                            text = candidates[0]['content']['parts'][0]['text'].strip()
                            return {
                                "reply": text,
                                "model": model,
                                "is_llm": True,
                                "city": city,
                                "aqi": aqi,
                                "category": category,
                                "sources": [
                                    "Google Gemini API",
                                    "CPCB National Ambient Air Quality Standards (NAQI)",
                                    "Indian Meteorological Guidelines",
                                ],
                            }
            except Exception as exc:
                logger.warning("Gemini model %s call failed (%s); trying next model or fallback", model, exc)

        # Fallback to pure rule-based response
        return self._generate_rule_fallback(question, city, aqi, category)

    def _generate_rule_fallback(self, question: str, city: str, aqi: int, category: str) -> Dict[str, Any]:
        """Deterministic safety fallback when LLM is unreachable or quota exhausted."""
        q = question.lower()
        if "outside" in q or "go out" in q or "safe" in q:
            if aqi <= 100:
                reply = f"Yes, it is currently safe to go outdoors in {city}! The ambient AQI is {aqi} ({category}), which presents minimal health risk."
            elif aqi <= 200:
                reply = f"It is moderately acceptable to go outside in {city} (AQI {aqi}, {category}). However, sensitive individuals and young children should avoid prolonged exertion."
            else:
                reply = f"Going outside is NOT recommended in {city} right now. The ambient AQI is {aqi} ({category}). Please stay indoors with windows shut."
            rule_id = "RULE-OUTDOOR-SAFETY"
        elif "exercise" in q or "jog" in q or "run" in q:
            if aqi <= 100:
                reply = f"You can safely exercise outdoors today in {city}. Current AQI is {aqi} ({category})."
            else:
                reply = f"Outdoor cardiovascular exercise should be avoided in {city} right now because the AQI is {aqi} ({category}). Exercise indoors in a filtered room instead."
            rule_id = "RULE-EXERCISE-RESTRICTION"
        elif "mask" in q or "n95" in q:
            if aqi > 150:
                reply = f"Yes, wearing an N95 or FFP2 respirator mask is strongly advised in {city} right now. The AQI is {aqi} ({category}). Regular cloth masks will not filter fine PM2.5."
            else:
                reply = f"A mask is not strictly mandatory for healthy adults at AQI {aqi} ({category}), though sensitive individuals may choose to wear one in heavy traffic."
            rule_id = "RULE-MASK-GUIDELINE"
        else:
            reply = f"In {city}, the current AQI is {aqi} ({category}). For sensitive groups, reduce prolonged heavy outdoor exertion. Keep indoor spaces purified when possible."
            rule_id = "RULE-GENERAL-EXPOSURE"

        return {
            "reply": reply,
            "model": "cpcb-rule-engine-fallback",
            "is_llm": False,
            "city": city,
            "aqi": aqi,
            "category": category,
            "rule_id": rule_id,
            "sources": [
                "CPCB National Ambient Air Quality Standards (NAQI)",
                "MoEFCC India Guidelines",
            ],
        }
