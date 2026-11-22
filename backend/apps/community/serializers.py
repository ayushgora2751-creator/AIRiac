from rest_framework import serializers
from apps.community.models import CitizenReport


class CitizenReportSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    sector_number = serializers.CharField(source='sector.sector_number', read_only=True)

    class Meta:
        model = CitizenReport
        fields = [
            'id', 'user', 'user_email', 'report_type', 'sector',
            'sector_number', 'location', 'description', 'image_url',
            'status', 'upvotes', 'created_at',
        ]
        read_only_fields = ['user', 'upvotes', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        if user and user.is_authenticated:
            validated_data['user'] = user
        return super().create(validated_data)
