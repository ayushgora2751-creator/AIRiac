"""
Geographic constants and bounding box coordinates for Chandigarh Capital Region (Tricity).
"""

CHANDIGARH_BBOX = {
    'min_lat': 30.6500,
    'max_lat': 30.8200,
    'min_lng': 76.6800,
    'max_lng': 76.8800,
    'center_lat': 30.7333,
    'center_lng': 76.7794,
    'srid': 4326,
}

# Key CAAQMS Station Coordinates in Chandigarh
STATION_COORDINATES = {
    'CH-SEC22-CAAQMS': {'lat': 30.7259, 'lng': 76.7744, 'name': 'Sector 22 CAAQMS'},
    'CH-PU-SEC25': {'lat': 30.7510, 'lng': 76.7620, 'name': 'Panjab University, Sector 25'},
    'CH-SEC53-CAAQMS': {'lat': 30.7180, 'lng': 76.7320, 'name': 'Sector 53 (Mohali Border)'},
    'CH-SEC17-CAAQMS': {'lat': 30.7410, 'lng': 76.7850, 'name': 'Sector 17 City Centre'},
    'CH-IND-PH1': {'lat': 30.7050, 'lng': 76.8010, 'name': 'Industrial Area Phase 1'},
    'CH-SUKHNA': {'lat': 30.7420, 'lng': 76.8180, 'name': 'Sukhna Lake Ecological Station'},
}
