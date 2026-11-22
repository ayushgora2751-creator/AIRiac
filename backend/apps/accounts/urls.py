from django.urls import path
from apps.accounts.views import (
    RegisterView,
    LoginView,
    CustomTokenRefreshView,
    CurrentUserView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='auth_refresh'),
    path('me/', CurrentUserView.as_view(), name='auth_me'),
]
