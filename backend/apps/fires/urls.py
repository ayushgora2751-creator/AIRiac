from django.urls import path
from apps.fires.views import ActiveFiresView, FireSummaryView

urlpatterns = [
    path('active/', ActiveFiresView.as_view(), name='fires_active'),
    path('summary/', FireSummaryView.as_view(), name='fires_summary'),
]
