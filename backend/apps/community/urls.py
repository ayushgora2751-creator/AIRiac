from django.urls import path
from apps.community.views import CitizenReportListView, CitizenReportUpvoteView

urlpatterns = [
    path('reports/', CitizenReportListView.as_view(), name='community_reports'),
    path('reports/<int:pk>/upvote/', CitizenReportUpvoteView.as_view(), name='community_report_upvote'),
]
