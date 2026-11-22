from rest_framework import generics
from rest_framework.permissions import AllowAny
from apps.reports.models import DailyReport
from apps.reports.serializers import DailyReportSerializer


class DailyReportListView(generics.ListAPIView):
    """List daily air quality compliance reports for Chandigarh."""
    queryset = DailyReport.objects.all()
    serializer_class = DailyReportSerializer
    permission_classes = [AllowAny]


class DailyReportDetailView(generics.RetrieveAPIView):
    """Retrieve detailed daily report for a specific date (YYYY-MM-DD)."""
    queryset = DailyReport.objects.all()
    serializer_class = DailyReportSerializer
    lookup_field = 'report_date'
    permission_classes = [AllowAny]
