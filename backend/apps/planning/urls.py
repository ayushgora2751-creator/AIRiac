from django.urls import path
from apps.planning.views import CleanRouteView

urlpatterns = [
    path('clean-route/', CleanRouteView.as_view(), name='clean_route'),
]
