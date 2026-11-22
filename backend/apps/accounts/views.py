from rest_framework import status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.utils import extend_schema, inline_serializer

from apps.accounts.models import UserProfile
from apps.accounts.serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileSerializer,
)


class RegisterView(APIView):
    """Register a new user account with citizen role and issue initial JWT tokens."""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="User Registration",
        description="Creates a new citizen account and generates access and refresh JWT tokens.",
        request=UserRegistrationSerializer,
        responses={
            201: inline_serializer(
                name='UserRegisterResponse',
                fields={
                    'user': UserSerializer(),
                    'tokens': inline_serializer(
                        name='TokenPair',
                        fields={
                            'access': serializers.CharField(),
                            'refresh': serializers.CharField(),
                        }
                    )
                }
            ),
            400: inline_serializer(
                name='RegisterErrorResponse',
                fields={'detail': serializers.DictField()}
            ),
        }
    )
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """Exchange valid email and password credentials for access and refresh JWTs."""
    permission_classes = [AllowAny]


class CustomTokenRefreshView(TokenRefreshView):
    """Exchange an unexpired refresh token for a new access token."""
    permission_classes = [AllowAny]


class CurrentUserView(APIView):
    """Retrieve or update identity and preferences of the authenticated user."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get Current User Profile",
        description="Returns user identity, role, and preferred sector.",
        responses={200: UserProfileSerializer}
    )
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update Current User Profile",
        description="Updates user profile preferences (e.g. preferred sector, vulnerability status).",
        request=UserProfileSerializer,
        responses={200: UserProfileSerializer, 400: inline_serializer(name='ProfileUpdateError', fields={'detail': serializers.CharField()})}
    )
    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
