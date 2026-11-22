"""
Shipday Delivery Integration for AIRiac.
Connects with Shipday REST API for on-demand dispatch of clean-air protective gear
(N95 respirators, portable air quality monitors, HEPA filter replacements).
"""
import os
import json
import logging
import urllib.request
from datetime import datetime, timezone
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class ShipdayService:
    """
    Shipday REST API Client for managing dispatch and delivery of clean-air protective gear.
    """

    BASE_URL = "https://api.shipday.com"

    def __init__(self, api_key: Optional[str] = None):
        raw_key = api_key or os.environ.get('SHIPDAY_API_KEY')
        self.api_key = raw_key.strip() if (raw_key and raw_key.strip()) else None

    def create_order(
        self,
        order_number: str,
        customer_name: str,
        customer_address: str,
        customer_phone: str,
        item_name: str = 'Certified N95 Anti-Pollution Respirator (5-Pack)',
        city: str = 'Chandigarh',
    ) -> Dict[str, Any]:
        """
        Creates an on-demand delivery order in Shipday.
        """
        payload = {
            "orderNumber": order_number,
            "customerName": customer_name,
            "customerAddress": customer_address,
            "customerPhoneNumber": customer_phone,
            "orderItem": [
                {
                    "name": item_name,
                    "unitPrice": 299.0,
                    "quantity": 1,
                }
            ],
            "deliveryInstruction": f"High Pollution Protocol for {city}: Urgent dispatch to sensitive individual.",
            "expectedDeliveryDate": datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        }

        if self.api_key:
            try:
                req = urllib.request.Request(
                    f"{self.BASE_URL}/orders",
                    data=json.dumps(payload).encode('utf-8'),
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f"Basic {self.api_key}",
                        'User-Agent': 'AIRiac-ShipdayClient/1.0',
                    },
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_body = json.loads(response.read().decode('utf-8'))
                    return {
                        "status": "DISPATCHED",
                        "order_id": order_number,
                        "shipday_response": res_body,
                    }
            except Exception as exc:
                logger.warning("Shipday API error (%s); returning simulated order", exc)
        else:
            logger.info("SHIPDAY_API_KEY not configured; using local order simulation.")

        return {
            "status": "ORDER_REGISTERED",
            "order_id": order_number,
            "item": item_name,
            "destination": customer_address,
            "city": city,
            "provider": "shipday",
            "simulated": True,
        }
