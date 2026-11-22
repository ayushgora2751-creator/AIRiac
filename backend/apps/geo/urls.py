from django.urls import path
from apps.geo.views import BBoxView, GeoBoundaryListView, IPLocateView

urlpatterns = [
    path('bbox/', BBoxView.as_view(), name='geo_bbox'),
    path('boundaries/', GeoBoundaryListView.as_view(), name='geo_boundaries'),
    path('locate/', IPLocateView.as_view(), name='geo_ip_locate'),
]
