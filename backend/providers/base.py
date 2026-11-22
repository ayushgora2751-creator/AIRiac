"""
Abstract base class definition for all AIRiac data providers.
Guarantees consistent method signatures across real and mock external data providers.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List


class BaseDataProvider(ABC):
    """Abstract interface defining the contract for environmental and weather data providers."""

    @abstractmethod
    def fetch_current(self, station_code: str) -> Dict[str, Any]:
        """Fetch latest pollutant observations for a specific CAAQMS station."""
        pass

    @abstractmethod
    def fetch_historical(self, station_code: str, days: int = 7) -> List[Dict[str, Any]]:
        """Fetch historical time-series pollutant observations."""
        pass

    @abstractmethod
    def health_check(self) -> bool:
        """Verify provider operational status (e.g. reachable API or valid mock state)."""
        pass
