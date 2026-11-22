from django.urls import path
from apps.advice.views import CurrentAdvisoryView, AdvisoryCategoriesView

urlpatterns = [
    path('current/', CurrentAdvisoryView.as_view(), name='advice_current'),
    path('categories/', AdvisoryCategoriesView.as_view(), name='advice_categories'),
]
