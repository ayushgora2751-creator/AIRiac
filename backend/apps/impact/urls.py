from django.urls import path
from apps.impact.views import VulnerableGroupListView, HealthImpactAssessmentView

urlpatterns = [
    path('vulnerable-groups/', VulnerableGroupListView.as_view(), name='impact_vulnerable_groups'),
    path('assessment/', HealthImpactAssessmentView.as_view(), name='impact_assessment'),
]
