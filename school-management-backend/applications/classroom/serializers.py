from rest_framework import serializers
from .models import Classroom
from applications.grade.models import Grade
from applications.user_management.models import User


class GradeSerializer(serializers.ModelSerializer):
    """Serializer cho Grade"""
    class Meta:
        model = Grade
        fields = ['id', 'name', 'description']


class TeacherSerializer(serializers.ModelSerializer):
    """Serializer cho Teacher (User với role=teacher)"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ClassroomSerializer(serializers.ModelSerializer):
    """Serializer cho Classroom"""
    grade = GradeSerializer(read_only=True)
    grade_id = serializers.UUIDField(write_only=True)
    homeroom_teacher = TeacherSerializer(read_only=True)
    homeroom_teacher_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Classroom
        fields = [
            'id', 'name', 'grade', 'grade_id', 'homeroom_teacher', 
            'homeroom_teacher_id', 'full_name', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_grade_id(self, value):
        """Validate grade_id tồn tại"""
        try:
            Grade.objects.get(id=value)
        except Grade.DoesNotExist:
            raise serializers.ValidationError('Khối lớp không tồn tại')
        return value

    def validate_homeroom_teacher_id(self, value):
        """Validate homeroom_teacher_id là teacher"""
        if value is not None:
            try:
                teacher = User.objects.get(id=value)
                if teacher.role != 'teacher':
                    raise serializers.ValidationError('Giáo viên chủ nhiệm phải có vai trò là giáo viên')
            except User.DoesNotExist:
                raise serializers.ValidationError('Giáo viên không tồn tại')
        return value

    def validate(self, attrs):
        """Validate unique constraint"""
        name = attrs.get('name')
        grade_id = attrs.get('grade_id')
        
        if name and grade_id:
            # Kiểm tra unique constraint
            existing_classroom = Classroom.objects.filter(
                name=name, 
                grade_id=grade_id
            )
            
            # Nếu đang update, exclude current instance
            if self.instance:
                existing_classroom = existing_classroom.exclude(id=self.instance.id)
            
            if existing_classroom.exists():
                raise serializers.ValidationError('Lớp học này đã tồn tại trong khối lớp')
        
        return attrs


class ClassroomListSerializer(serializers.ModelSerializer):
    """Serializer cho danh sách Classroom (compact)"""
    grade = GradeSerializer(read_only=True)
    homeroom_teacher = TeacherSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = [
            'id', 'name', 'grade', 'homeroom_teacher', 
            'full_name', 'student_count', 'created_at'
        ]

    def get_student_count(self, obj):
        """Đếm số học sinh trong lớp"""
        # Tạm thời trả về 0 vì chưa có model Student
        return 0


class ClassroomCreateRequestSerializer(serializers.ModelSerializer):
    """Serializer cho tạo Classroom"""
    grade_id = serializers.UUIDField()
    homeroom_teacher_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Classroom
        fields = ['name', 'grade_id', 'homeroom_teacher_id']

    def validate_grade_id(self, value):
        """Validate grade_id tồn tại"""
        try:
            Grade.objects.get(id=value)
        except Grade.DoesNotExist:
            raise serializers.ValidationError('Khối lớp không tồn tại')
        return value

    def validate_homeroom_teacher_id(self, value):
        """Validate homeroom_teacher_id là teacher"""
        if value is not None:
            try:
                teacher = User.objects.get(id=value)
                if teacher.role != 'teacher':
                    raise serializers.ValidationError('Giáo viên chủ nhiệm phải có vai trò là giáo viên')
            except User.DoesNotExist:
                raise serializers.ValidationError('Giáo viên không tồn tại')
        return value

    def validate(self, attrs):
        """Validate unique constraint"""
        name = attrs.get('name')
        grade_id = attrs.get('grade_id')
        
        if name and grade_id:
            if Classroom.objects.filter(name=name, grade_id=grade_id).exists():
                raise serializers.ValidationError('Lớp học này đã tồn tại trong khối lớp')
        
        return attrs


class ClassroomUpdateRequestSerializer(serializers.ModelSerializer):
    """Serializer cho cập nhật Classroom"""
    grade_id = serializers.UUIDField(required=False)
    homeroom_teacher_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Classroom
        fields = ['name', 'grade_id', 'homeroom_teacher_id']

    def validate_grade_id(self, value):
        """Validate grade_id tồn tại"""
        try:
            Grade.objects.get(id=value)
        except Grade.DoesNotExist:
            raise serializers.ValidationError('Khối lớp không tồn tại')
        return value

    def validate_homeroom_teacher_id(self, value):
        """Validate homeroom_teacher_id là teacher"""
        if value is not None:
            try:
                teacher = User.objects.get(id=value)
                if teacher.role != 'teacher':
                    raise serializers.ValidationError('Giáo viên chủ nhiệm phải có vai trò là giáo viên')
            except User.DoesNotExist:
                raise serializers.ValidationError('Giáo viên không tồn tại')
        return value

    def validate(self, attrs):
        """Validate unique constraint"""
        name = attrs.get('name')
        grade_id = attrs.get('grade_id')
        
        if name and grade_id:
            existing_classroom = Classroom.objects.filter(name=name, grade_id=grade_id)
            if self.instance:
                existing_classroom = existing_classroom.exclude(id=self.instance.id)
            
            if existing_classroom.exists():
                raise serializers.ValidationError('Lớp học này đã tồn tại trong khối lớp')
        
        return attrs 