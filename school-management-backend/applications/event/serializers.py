from rest_framework import serializers
from .models import Event, EventType


# Request Serializers
class EventCreateRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['event_type', 'classroom', 'student', 'date', 'period', 'points', 'description']


class EventUpdateRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['event_type', 'classroom', 'student', 'date', 'period', 'points', 'description']


class EventBulkCreateRequestSerializer(serializers.Serializer):
    events = EventCreateRequestSerializer(many=True)


# Response Serializers
class EventTypeResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ['id', 'name', 'description', 'is_active', 'created_at']


class EventResponseSerializer(serializers.ModelSerializer):
    event_type = EventTypeResponseSerializer(read_only=True)
    classroom_name = serializers.CharField(source='classroom.full_name', read_only=True)
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'event_type', 'classroom', 'classroom_name', 'student', 'student_name',
            'date', 'period', 'points', 'description', 'recorded_by', 'recorded_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'recorded_by', 'created_at', 'updated_at']


class EventBulkCreateResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    created_count = serializers.IntegerField()
    events = EventResponseSerializer(many=True) 