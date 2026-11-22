"""
Mock NASA FIRMS Stubble Burning / Agricultural Fire Provider.
Supplies deterministic thermal anomalies and Fire Radiative Power (FRP) data
for Punjab and Haryana border districts affecting Chandigarh.
"""
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional
from providers.base import BaseDataProvider

FIRE_FIXTURE_PATH = Path(__file__).resolve().parent / 'fixtures' / 'stubble_fire_samples.json'


class MockFIRMSProvider(BaseDataProvider):
    """
    Deterministic mock provider simulating NASA FIRMS active fire hotspots.
    """

    def __init__(self, fixture_path: Optional[Path] = None):
        path = fixture_path or FIRE_FIXTURE_PATH
        with open(path, 'r', encoding='utf-8') as f:
            self.sample_fires = json.load(f)

    def fetch_current(self, station_code: str = 'CHANDIGARH_REGION') -> Dict[str, Any]:
        """Fetch active stubble fire anomalies within regional transport range."""
        now = datetime.now(timezone.utc)
        fires = []
        total_frp = 0.0

        for idx, sample in enumerate(self.sample_fires):
            fire_entry = dict(sample)
            fire_entry['detected_at'] = (now - timedelta(hours=idx * 2)).strftime('%Y-%m-%dT%H:%M:%SZ')
            fires.append(fire_entry)
            total_frp += fire_entry.get('frp', 0.0)

        return {
            'region': 'Chandigarh Hinterland (Punjab/Haryana Border)',
            'timestamp': now.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'active_fire_count': len(fires),
            'total_frp_mw': round(total_frp, 1),
            'incidents': fires,
        }

    def fetch_historical(self, station_code: str = 'CHANDIGARH_REGION', days: int = 7) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        history = []
        for day in range(days):
            dt = now - timedelta(days=day)
            history.append({
                'date': dt.strftime('%Y-%m-%d'),
                'incident_count': len(self.sample_fires) + (day % 3),
                'total_frp_mw': round(180.0 - (day * 15.0), 1),
            })
        return history

    def health_check(self) -> bool:
        return len(self.sample_fires) > 0
