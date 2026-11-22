from django.urls import path
from apps.reports.views import DailyReportListView, DailyReportDetailView

urlpatterns = [
    path('daily/', DailyReportListView.as_view(), name='reports_daily_list'),
    path('daily/<str:report_date>/', DailyReportDetailView.as_view(), name='reports_daily_detail'),
]
