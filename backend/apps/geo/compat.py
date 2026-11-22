"""
Spatial compatibility layer for AIRiac.
Provides native PostGIS spatial fields when GDAL/GEOS C-libraries are present (e.g. in Docker),
and graceful JSONField fallbacks for local Windows environments without native GDAL.
"""
import logging

logger = logging.getLogger(__name__)

HAS_GDAL = False

try:
    from django.contrib.gis.gdal import HAS_GDAL as _HAS_GDAL
    HAS_GDAL = bool(_HAS_GDAL)
except Exception:
    HAS_GDAL = False

if HAS_GDAL:
    from django.contrib.gis.db import models as geomodels
    PointField = geomodels.PointField
    PolygonField = geomodels.PolygonField
    LineStringField = geomodels.LineStringField
else:
    from django.db import models

    class FallbackSpatialField(models.JSONField):
        """Fallback spatial field representing GeoJSON or coordinate geometries as JSON."""
        def __init__(self, *args, srid=4326, spatial_index=True, **kwargs):
            self.srid = srid
            self.spatial_index = spatial_index
            kwargs.setdefault('null', True)
            kwargs.setdefault('blank', True)
            super().__init__(*args, **kwargs)

        def deconstruct(self):
            name, path, args, kwargs = super().deconstruct()
            if self.srid != 4326:
                kwargs['srid'] = self.srid
            return name, path, args, kwargs

    PointField = FallbackSpatialField
    PolygonField = FallbackSpatialField
    LineStringField = FallbackSpatialField
