from django.db.models import Q
from rest_framework import serializers
from apps.accounts.models import User, UserProfile
from apps.locations.models import Sector


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']


class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')
    preferred_sector = serializers.CharField(required=False, allow_blank=True, default=None)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value.lower()

    def create(self, validated_data):
        preferred_sector_name = validated_data.pop('preferred_sector', None)
        password = validated_data.pop('password')

        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='citizen',
        )

        sector = None
        if preferred_sector_name:
            sector_query = Q(sector_number__iexact=str(preferred_sector_name)) | Q(name__iexact=str(preferred_sector_name))
            if str(preferred_sector_name).isdigit():
                sector_query |= Q(id=int(preferred_sector_name))
            sector = Sector.objects.filter(sector_query).first()

        UserProfile.objects.create(
            user=user,
            preferred_sector=sector,
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='user.id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    role = serializers.CharField(source='user.role', read_only=True)
    preferred_sector = serializers.CharField(
        source='preferred_sector.sector_number',
        allow_null=True,
        required=False,
    )

    class Meta:
        model = UserProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'preferred_sector', 'is_vulnerable', 'vulnerability_types',
            'notify_via_email', 'notify_via_sms',
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            for attr, val in user_data.items():
                setattr(user, attr, val)
            user.save()

        preferred_sector_str = validated_data.pop('preferred_sector', None)
        if preferred_sector_str is not None:
            if isinstance(preferred_sector_str, dict):
                preferred_sector_str = preferred_sector_str.get('sector_number')
            sector_query = Q(sector_number__iexact=str(preferred_sector_str)) | Q(name__iexact=str(preferred_sector_str))
            if str(preferred_sector_str).isdigit():
                sector_query |= Q(id=int(preferred_sector_str))
            sector = Sector.objects.filter(sector_query).first()
            instance.preferred_sector = sector

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance
