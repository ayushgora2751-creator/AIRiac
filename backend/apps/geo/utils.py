"""
Geospatial utility functions for Chandigarh bounding box checks and distance computations.
"""
import math
from typing import Tuple
from apps.geo.constants import CHANDIGARH_BBOX, STATION_COORDINATES


def is_within_chandigarh(lat: float, lng: float) -> bool:
    """Check if a coordinate falls inside the Chandigarh Tricity bounding box."""
    return (
        CHANDIGARH_BBOX['min_lat'] <= lat <= CHANDIGARH_BBOX['max_lat']
        and CHANDIGARH_BBOX['min_lng'] <= lng <= CHANDIGARH_BBOX['max_lng']
    )


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth in kilometers."""
    radius = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return radius * c


def get_nearest_station_code(lat: float, lng: float) -> Tuple[str, float]:
    """Find the nearest CAAQMS station code and its distance in kilometers."""
    nearest_code = 'CH-SEC22-CAAQMS'
    min_dist = float('inf')

    for code, coords in STATION_COORDINATES.items():
        dist = haversine_distance_km(lat, lng, coords['lat'], coords['lng'])
        if dist < min_dist:
            min_dist = dist
            nearest_code = code

    return nearest_code, min_dist
