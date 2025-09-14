from rest_framework import serializers
from .models import Teacher
from applications.user_management.models import User


class TeacherSerializer(serializers.ModelSerializer):
    """Serializer cho Teacher"""
    user = serializers.SerializerMethodField()
    homeroom_classes = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'teacher_code', 'subject', 
            'homeroom_classes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'full_name': obj.user.get_full_name()
        }

    def get_homeroom_classes(self, obj):
        return [
            {
                'id': classroom.id,
                'name': classroom.name,
                'full_name': classroom.full_name,
                'grade': {
                    'id': classroom.grade.id,
                    'name': classroom.grade.name
                }
            }
            for classroom in obj.user.homeroom_classrooms.all()
        ]


class TeacherCreateRequestSerializer(serializers.ModelSerializer):
    """Serializer cho tạo Teacher"""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)

    class Meta:
        model = Teacher
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'teacher_code', 'subject'
        ]

    def validate_teacher_code(self, value):
        """Validate teacher_code unique"""
        if Teacher.objects.filter(teacher_code=value).exists():
            raise serializers.ValidationError('Mã giáo viên đã tồn tại')
        return value

    def validate_username(self, value):
        """Validate username unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Tên đăng nhập đã tồn tại')
        return value

    def validate_email(self, value):
        """Validate email unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email đã tồn tại')
        return value


class TeacherUpdateRequestSerializer(serializers.ModelSerializer):
    """Serializer cho cập nhật Teacher"""
    first_name = serializers.CharField(max_length=30, required=False)
    last_name = serializers.CharField(max_length=30, required=False)
    email = serializers.EmailField(required=False)

    class Meta:
        model = Teacher
        fields = [
            'first_name', 'last_name', 'email', 'teacher_code', 'subject'
        ]

    def validate_teacher_code(self, value):
        """Validate teacher_code unique (exclude current instance)"""
        instance = self.instance
        if Teacher.objects.filter(teacher_code=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError('Mã giáo viên đã tồn tại')
        return value

    def validate_email(self, value):
        """Validate email unique (exclude current instance)"""
        instance = self.instance
        if User.objects.filter(email=value).exclude(id=instance.user.id).exists():
            raise serializers.ValidationError('Email đã tồn tại')
        return value


class TeacherListSerializer(serializers.ModelSerializer):
    """Serializer cho danh sách Teacher (compact)"""
    user = serializers.SerializerMethodField()
    homeroom_class_count = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'teacher_code', 'subject', 
            'homeroom_class_count', 'created_at'
        ]

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'full_name': obj.user.get_full_name(),
            'email': obj.user.email
        }

    def get_homeroom_class_count(self, obj):
        return obj.user.homeroom_classrooms.count()


class TeacherImportSerializer(serializers.Serializer):
    """Serializer cho import Teacher từ Excel"""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128, write_only=True)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    teacher_code = serializers.CharField(max_length=20)
    subject = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username đã tồn tại")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã tồn tại")
        return value

    def validate_teacher_code(self, value):
        if Teacher.objects.filter(teacher_code=value).exists():
            raise serializers.ValidationError("Mã giáo viên đã tồn tại")
        return value


class TeacherImportResultSerializer(serializers.Serializer):
    """Serializer cho kết quả import Teacher"""
    success_count = serializers.IntegerField()
    error_count = serializers.IntegerField()
    errors = serializers.ListField(child=serializers.DictField(), required=False)
    success_data = serializers.ListField(child=serializers.DictField(), required=False) 