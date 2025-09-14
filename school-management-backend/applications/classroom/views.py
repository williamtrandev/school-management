from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Classroom
from .serializers import (
    ClassroomSerializer, 
    ClassroomListSerializer,
    ClassroomCreateRequestSerializer,
    ClassroomUpdateRequestSerializer
)
from applications.grade.models import Grade
from applications.user_management.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classroom_list(request):
    """API lấy danh sách lớp học"""
    # Filter theo role của user
    user = request.user
    queryset = Classroom.objects.select_related('grade', 'homeroom_teacher')
    
    if user.role == 'student':
        # Học sinh chỉ thấy lớp của mình
        if hasattr(user, 'student'):
            queryset = queryset.filter(id=user.student.classroom.id)
        else:
            queryset = queryset.none()
    elif user.role == 'teacher':
        # Giáo viên thấy lớp mình chủ nhiệm và tất cả lớp khác
        queryset = queryset.filter(
            Q(homeroom_teacher=user) | Q(homeroom_teacher__isnull=True)
        )
    # Admin thấy tất cả
    
    # Apply filters
    grade = request.query_params.get('grade')
    if grade:
        queryset = queryset.filter(grade_id=grade)
    
    is_special = request.query_params.get('is_special')
    if is_special is not None:
        queryset = queryset.filter(is_special=is_special.lower() == 'true')
    
    homeroom_teacher = request.query_params.get('homeroom_teacher')
    if homeroom_teacher:
        queryset = queryset.filter(homeroom_teacher_id=homeroom_teacher)
    
    # Search
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | Q(grade__name__icontains=search)
        )
    
    # Ordering
    ordering = request.query_params.get('ordering', 'grade__name')
    if ordering:
        queryset = queryset.order_by(ordering)
    else:
        queryset = queryset.order_by('grade__name', 'name')
    
    serializer = ClassroomListSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classroom_detail(request, id):
    """API lấy chi tiết lớp học"""
    # Filter theo role của user
    user = request.user
    queryset = Classroom.objects.select_related('grade', 'homeroom_teacher')
    
    if user.role == 'student':
        # Học sinh chỉ thấy lớp của mình
        if hasattr(user, 'student'):
            queryset = queryset.filter(id=user.student.classroom.id)
        else:
            queryset = queryset.none()
    elif user.role == 'teacher':
        # Giáo viên thấy lớp mình chủ nhiệm và tất cả lớp khác
        queryset = queryset.filter(
            Q(homeroom_teacher=user) | Q(homeroom_teacher__isnull=True)
        )
    # Admin thấy tất cả
    
    classroom = get_object_or_404(queryset, id=id)
    serializer = ClassroomSerializer(classroom)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def classroom_create(request):
    """API tạo lớp học mới"""
    serializer = ClassroomCreateRequestSerializer(data=request.data)
    if serializer.is_valid():
        # Tạo classroom từ validated data
        classroom = Classroom.objects.create(
            name=serializer.validated_data['name'],
            grade_id=serializer.validated_data['grade_id'],
            homeroom_teacher_id=serializer.validated_data.get('homeroom_teacher_id'),
            is_special=serializer.validated_data.get('is_special', False)
        )
        response_serializer = ClassroomSerializer(classroom)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def classroom_update(request, id):
    """API cập nhật lớp học"""
    classroom = get_object_or_404(Classroom, id=id)
    serializer = ClassroomUpdateRequestSerializer(classroom, data=request.data, partial=True)
    if serializer.is_valid():
        # Cập nhật classroom từ validated data
        if 'name' in serializer.validated_data:
            classroom.name = serializer.validated_data['name']
        if 'grade_id' in serializer.validated_data:
            classroom.grade_id = serializer.validated_data['grade_id']
        if 'homeroom_teacher_id' in serializer.validated_data:
            classroom.homeroom_teacher_id = serializer.validated_data['homeroom_teacher_id']
        if 'is_special' in serializer.validated_data:
            classroom.is_special = serializer.validated_data['is_special']
        classroom.save()
        
        response_serializer = ClassroomSerializer(classroom)
        return Response(response_serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def classroom_delete(request, id):
    """API xóa lớp học"""
    classroom = get_object_or_404(Classroom, id=id)
    
    # Kiểm tra xem lớp có học sinh không (tạm thời bỏ qua vì chưa có model Student)
    # if classroom.students.exists():
    #     return Response(
    #         {'error': 'Không thể xóa lớp học đang có học sinh'},
    #         status=status.HTTP_400_BAD_REQUEST
    #     )
    
    classroom.delete()
    return Response(
        {'message': 'Xóa lớp học thành công'},
        status=status.HTTP_204_NO_CONTENT
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_grades(request):
    """API lấy danh sách khối lớp"""
    from .serializers import GradeSerializer
    grades = Grade.objects.all().order_by('name')
    serializer = GradeSerializer(grades, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teachers(request):
    """API lấy danh sách giáo viên"""
    from .serializers import TeacherSerializer
    teachers = User.objects.filter(role='teacher').order_by('first_name', 'last_name')
    serializer = TeacherSerializer(teachers, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_classroom_stats(request):
    """API lấy thống kê lớp học"""
    total_classrooms = Classroom.objects.count()
    special_classrooms = Classroom.objects.filter(is_special=True).count()
    regular_classrooms = total_classrooms - special_classrooms
    classrooms_with_teacher = Classroom.objects.filter(homeroom_teacher__isnull=False).count()
    classrooms_without_teacher = total_classrooms - classrooms_with_teacher
    
    stats = {
        'total_classrooms': total_classrooms,
        'special_classrooms': special_classrooms,
        'regular_classrooms': regular_classrooms,
        'classrooms_with_teacher': classrooms_with_teacher,
        'classrooms_without_teacher': classrooms_without_teacher,
    }
    
    return Response(stats) 