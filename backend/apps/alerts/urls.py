from django.urls import path
from apps.alerts.views import AlertSubscriptionsView, AlertNotificationsView

urlpatterns = [
    path('subscriptions/', AlertSubscriptionsView.as_view(), name='alert_subscriptions'),
    path('notifications/', AlertNotificationsView.as_view(), name='alert_notifications'),
]
