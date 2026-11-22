from django.urls import path
from apps.geo.views import BBoxView, GeoBoundaryListView

urlpatterns = [
    path('bbox/', BBoxView.as_view(), name='geo_bbox'),
    path('boundaries/', GeoBoundaryListView.as_view(), name='geo_boundaries'),
]
