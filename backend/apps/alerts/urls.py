from django.urls import path
from apps.alerts.views import (
    AlertSubscriptionsView,
    AlertNotificationsView,
    MailercloudTestAlertView,
    ShipdayDispatchView,
)

urlpatterns = [
    path('subscriptions/', AlertSubscriptionsView.as_view(), name='alert_subscriptions'),
    path('notifications/', AlertNotificationsView.as_view(), name='alert_notifications'),
    path('test-send/', MailercloudTestAlertView.as_view(), name='alert_mailercloud_test_send'),
    path('dispatch-delivery/', ShipdayDispatchView.as_view(), name='alert_shipday_dispatch'),
]
