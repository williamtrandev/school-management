from rest_framework import serializers
from .models import Student, BehaviorRecord
from applications.user_management.serializers import UserResponseSerializer
from applications.classroom.serializers import ClassroomSerializer

class StudentSerializer(serializers.ModelSerializer):
    user = UserResponseSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = '__all__'

class StudentListSerializer(serializers.ModelSerializer):
    user = UserResponseSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'student_code', 'classroom', 'gender', 'date_of_birth', 'created_at']

class StudentCreateRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    student_code = serializers.CharField(max_length=20)
    classroom_id = serializers.UUIDField()
    date_of_birth = serializers.DateField()
    gender = serializers.ChoiceField(choices=[('male', 'Nam'), ('female', 'Nữ')])
    address = serializers.CharField(required=False, allow_blank=True)
    parent_phone = serializers.CharField(required=False, allow_blank=True, max_length=15)
    
    class Meta:
        model = Student
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'student_code', 'classroom_id', 'date_of_birth', 'gender', 'address', 'parent_phone']

class StudentUpdateRequestSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=30, required=False)
    last_name = serializers.CharField(max_length=30, required=False)
    email = serializers.EmailField(required=False)
    classroom_id = serializers.UUIDField(required=False)
    date_of_birth = serializers.DateField(required=False)
    gender = serializers.ChoiceField(choices=[('male', 'Nam'), ('female', 'Nữ')], required=False)
    address = serializers.CharField(required=False, allow_blank=True)
    parent_phone = serializers.CharField(required=False, allow_blank=True, max_length=15)
    
    class Meta:
        model = Student
        fields = ['first_name', 'last_name', 'email', 'classroom_id', 'date_of_birth', 'gender', 'address', 'parent_phone']

class StudentImportSerializer(serializers.Serializer):
    file = serializers.FileField()

class StudentImportResultSerializer(serializers.ModelSerializer):
    user = UserResponseSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'student_code', 'classroom', 'created_at']

# Behavior Record Serializers
class BehaviorRecordSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    approved_by = UserResponseSerializer(read_only=True)
    
    class Meta:
        model = BehaviorRecord
        fields = '__all__'

class BehaviorRecordCreateSerializer(serializers.ModelSerializer):
    student_id = serializers.UUIDField(required=False, allow_null=True)  # Thêm trường này để học sinh có thể tạo vi phạm cho người khác
    violation_type = serializers.CharField(max_length=100)
    description = serializers.CharField()
    points_deducted = serializers.IntegerField(min_value=0, max_value=10)
    
    class Meta:
        model = BehaviorRecord
        fields = ['student_id', 'violation_type', 'description', 'points_deducted']

class BehaviorRecordUpdateSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=BehaviorRecord.STATUS_CHOICES)
    rejection_notes = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = BehaviorRecord
        fields = ['status', 'rejection_notes']

class BehaviorRecordListSerializer(serializers.ModelSerializer):
    student = StudentListSerializer(read_only=True)
    approved_by = UserResponseSerializer(read_only=True)
    
    class Meta:
        model = BehaviorRecord
        fields = ['id', 'student', 'violation_type', 'description', 'points_deducted', 'status', 'created_at', 'approved_at', 'approved_by', 'rejection_notes'] 