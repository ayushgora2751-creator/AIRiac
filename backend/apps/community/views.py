from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.community.models import CitizenReport
from apps.community.serializers import CitizenReportSerializer


class CitizenReportListView(generics.ListCreateAPIView):
    """List or submit crowdsourced citizen pollution incident reports."""
    queryset = CitizenReport.objects.all()
    serializer_class = CitizenReportSerializer
    permission_classes = [AllowAny]


class CitizenReportUpvoteView(APIView):
    """Upvote an incident report to corroborate its severity."""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            report = CitizenReport.objects.get(pk=pk)
            report.upvotes += 1
            report.save(update_fields=['upvotes'])
            return Response({'id': report.id, 'upvotes': report.upvotes}, status=status.HTTP_200_OK)
        except CitizenReport.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
