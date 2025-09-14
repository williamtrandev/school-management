import pandas as pd
import io
from datetime import datetime
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from django.utils import timezone
import pandas as pd
import io
from datetime import datetime

from .models import Student, BehaviorRecord
from .serializers import (
    StudentSerializer, 
    StudentListSerializer,
    StudentCreateRequestSerializer,
    StudentUpdateRequestSerializer,
    StudentImportSerializer,
    StudentImportResultSerializer,
    BehaviorRecordSerializer,
    BehaviorRecordCreateSerializer,
    BehaviorRecordUpdateSerializer,
    BehaviorRecordListSerializer
)
from applications.user_management.models import User
from applications.classroom.models import Classroom
from django.db import models


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_list(request):
    """API lấy danh sách học sinh"""
    # Filter theo role của user
    user = request.user
    queryset = Student.objects.select_related('user', 'classroom', 'classroom__grade')
    
    if user.role == 'student':
        # Học sinh chỉ thấy thông tin của mình
        queryset = queryset.filter(user=user)
    elif user.role == 'teacher':
        # Giáo viên thấy học sinh trong lớp mình chủ nhiệm
        queryset = queryset.filter(classroom__homeroom_teacher=user)
    # Admin thấy tất cả
    
    # Apply filters
    classroom_id = request.query_params.get('classroom_id')
    if classroom_id:
        queryset = queryset.filter(classroom_id=classroom_id)
    
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(student_code__icontains=search) |
            Q(user__email__icontains=search)
        )
    
    gender = request.query_params.get('gender')
    if gender:
        queryset = queryset.filter(gender=gender)
    
    # Ordering
    ordering = request.query_params.get('ordering', 'user__first_name')
    queryset = queryset.order_by(ordering)
    
    serializer = StudentListSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_detail(request, id):
    """API lấy chi tiết học sinh"""
    student = get_object_or_404(Student, id=id)
    
    # Check permissions
    user = request.user
    if user.role == 'student' and student.user != user:
        return Response(
            {'error': 'Không có quyền truy cập'},
            status=status.HTTP_403_FORBIDDEN
        )
    elif user.role == 'teacher' and student.classroom.homeroom_teacher != user:
        return Response(
            {'error': 'Không có quyền truy cập'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = StudentSerializer(student)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def student_create(request):
    """API tạo học sinh mới"""
    serializer = StudentCreateRequestSerializer(data=request.data)
    if serializer.is_valid():
        with transaction.atomic():
            # Tạo user
            user_data = {
                'username': serializer.validated_data['username'],
                'email': serializer.validated_data['email'],
                'password': make_password(serializer.validated_data['password']),
                'first_name': serializer.validated_data['first_name'],
                'last_name': serializer.validated_data['last_name'],
                'role': 'student'
            }
            user = User.objects.create(**user_data)
            
            # Tạo student
            student_data = {
                'user': user,
                'student_code': serializer.validated_data['student_code'],
                'classroom_id': serializer.validated_data['classroom_id'],
                'date_of_birth': serializer.validated_data['date_of_birth'],
                'gender': serializer.validated_data['gender'],
                'address': serializer.validated_data.get('address', ''),
                'parent_phone': serializer.validated_data.get('parent_phone', '')
            }
            student = Student.objects.create(**student_data)
        
        response_serializer = StudentSerializer(student)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def student_update(request, id):
    """API cập nhật thông tin học sinh"""
    student = get_object_or_404(Student, id=id)
    
    # Check permissions
    user = request.user
    if user.role == 'student' and student.user != user:
        return Response(
            {'error': 'Không có quyền cập nhật thông tin học sinh khác'},
            status=status.HTTP_403_FORBIDDEN
        )
    elif user.role == 'teacher' and student.classroom.homeroom_teacher != user:
        return Response(
            {'error': 'Không có quyền cập nhật thông tin học sinh lớp khác'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = StudentUpdateRequestSerializer(data=request.data, partial=True)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                # Cập nhật thông tin student
                for field, value in serializer.validated_data.items():
                    if field == 'classroom_id':
                        # Kiểm tra xem lớp có tồn tại không
                        try:
                            classroom = Classroom.objects.get(id=value)
                            student.classroom = classroom
                        except Classroom.DoesNotExist:
                            return Response(
                                {'error': f'Lớp với ID {value} không tồn tại'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    else:
                        setattr(student, field, value)
                
                student.save()
                
                # Cập nhật thông tin user nếu có
                user_update_data = {}
                if 'first_name' in serializer.validated_data:
                    user_update_data['first_name'] = serializer.validated_data['first_name']
                if 'last_name' in serializer.validated_data:
                    user_update_data['last_name'] = serializer.validated_data['last_name']
                if 'email' in serializer.validated_data:
                    user_update_data['email'] = serializer.validated_data['email']
                
                if user_update_data:
                    User.objects.filter(id=student.user.id).update(**user_update_data)
            
            response_serializer = StudentSerializer(student)
            return Response(response_serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Lỗi cập nhật: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def student_delete(request, id):
    """API xóa học sinh"""
    student = get_object_or_404(Student, id=id)
    
    # Check permissions - chỉ admin mới được xóa học sinh
    if request.user.role != 'admin':
        return Response(
            {'error': 'Chỉ admin mới có quyền xóa học sinh'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        with transaction.atomic():
            # Xóa user trước, sau đó xóa student
            user = student.user
            student.delete()
            user.delete()
        
        return Response({'message': 'Đã xóa học sinh thành công'})
    except Exception as e:
        return Response(
            {'error': f'Lỗi xóa học sinh: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def student_import_excel(request):
    """API import học sinh từ file Excel"""
    serializer = StudentImportSerializer(data=request.data)
    if serializer.is_valid():
        file = serializer.validated_data['file']
        
        try:
            # Đọc file Excel
            if file.name.endswith('.xlsx'):
                df = pd.read_excel(file, engine='openpyxl')
            else:
                df = pd.read_excel(file, engine='xlrd')
            
            # Validate columns
            required_columns = [
                'student_code', 'username', 'email', 'password', 
                'first_name', 'last_name', 'classroom_name', 
                'date_of_birth', 'gender', 'address', 'parent_phone'
            ]
            
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response({
                    'error': f'Thiếu các cột: {", ".join(missing_columns)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success_count = 0
            error_count = 0
            errors = []
            
            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        # Validate classroom
                        classroom_name = str(row['classroom_name']).strip()
                        try:
                            # Parse classroom name (e.g., "12A1" -> grade="12", name="A1")
                            if len(classroom_name) >= 3:
                                grade_name = classroom_name[:-2]  # "12"
                                class_name = classroom_name[-2:]  # "A1"
                                
                                from applications.grade.models import Grade
                                grade = Grade.objects.get(name=grade_name)
                                classroom = Classroom.objects.get(name=class_name, grade=grade)
                            else:
                                raise Classroom.DoesNotExist
                        except (Classroom.DoesNotExist, Grade.DoesNotExist):
                            errors.append({
                                'row': index + 2,  # Excel row number (1-based + header)
                                'error': f'Lớp "{classroom_name}" không tồn tại'
                            })
                            error_count += 1
                            continue
                        
                        # Validate unique fields
                        student_code = str(row['student_code']).strip()
                        username = str(row['username']).strip()
                        email = str(row['email']).strip()
                        
                        if Student.objects.filter(student_code=student_code).exists():
                            errors.append({
                                'row': index + 2,
                                'error': f'Mã học sinh "{student_code}" đã tồn tại'
                            })
                            error_count += 1
                            continue
                        
                        if User.objects.filter(username=username).exists():
                            errors.append({
                                'row': index + 2,
                                'error': f'Username "{username}" đã tồn tại'
                            })
                            error_count += 1
                            continue
                        
                        if User.objects.filter(email=email).exists():
                            errors.append({
                                'row': index + 2,
                                'error': f'Email "{email}" đã tồn tại'
                            })
                            error_count += 1
                            continue
                        
                        # Parse date
                        try:
                            if pd.isna(row['date_of_birth']):
                                date_of_birth = datetime.now().date()
                            else:
                                date_of_birth = pd.to_datetime(row['date_of_birth']).date()
                        except:
                            date_of_birth = datetime.now().date()
                        
                        # Create user
                        user = User.objects.create(
                            username=username,
                            email=email,
                            password=make_password(str(row['password'])),
                            first_name=str(row['first_name']).strip(),
                            last_name=str(row['last_name']).strip(),
                            role='student'
                        )
                        
                        # Create student
                        Student.objects.create(
                            user=user,
                            student_code=student_code,
                            classroom=classroom,
                            date_of_birth=date_of_birth,
                            gender=str(row['gender']).strip().lower(),
                            address=str(row.get('address', '')).strip(),
                            parent_phone=str(row.get('parent_phone', '')).strip()
                        )
                        
                        success_count += 1
                        
                    except Exception as e:
                        errors.append({
                            'row': index + 2,
                            'error': str(e)
                        })
                        error_count += 1
            
            result = {
                'success_count': success_count,
                'error_count': error_count,
                'errors': errors[:10],  # Limit to first 10 errors
                'message': f'Import thành công {success_count} học sinh, {error_count} lỗi'
            }
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Lỗi đọc file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_import_template(request):
    """API tải template Excel"""
    # Tạo template Excel
    template_data = {
        'student_code': ['HS001', 'HS002', 'HS003'],
        'username': ['student1', 'student2', 'student3'],
        'email': ['student1@example.com', 'student2@example.com', 'student3@example.com'],
        'password': ['password123', 'password123', 'password123'],
        'first_name': ['Nguyễn', 'Trần', 'Lê'],
        'last_name': ['Văn A', 'Thị B', 'Minh C'],
        'classroom_name': ['12A1', '12A1', '11A1'],
        'date_of_birth': ['2006-01-01', '2006-02-01', '2006-03-01'],
        'gender': ['male', 'female', 'male'],
        'address': ['123 Đường ABC', '456 Đường XYZ', '789 Đường DEF'],
        'parent_phone': ['0123456789', '0987654321', '0123456780']
    }
    
    df = pd.DataFrame(template_data)
    
    # Tạo file Excel
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Students', index=False)
    
    output.seek(0)
    
    from django.http import HttpResponse
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="student_import_template.xlsx"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_stats(request):
    """API lấy thống kê học sinh"""
    total_students = Student.objects.count()
    male_students = Student.objects.filter(gender='male').count()
    female_students = Student.objects.filter(gender='female').count()
    
    # Thống kê theo lớp
    classroom_stats = []
    classrooms = Classroom.objects.all()
    for classroom in classrooms:
        student_count = classroom.students.count()
        if student_count > 0:
            classroom_stats.append({
                'classroom_name': classroom.full_name,
                'student_count': student_count
            })
    
    stats = {
        'total_students': total_students,
        'male_students': male_students,
        'female_students': female_students,
        'classroom_stats': classroom_stats
    }
    
    return Response(stats) 

# Behavior Record Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def behavior_record_list(request):
    """API lấy danh sách vi phạm nề nết"""
    user = request.user
    queryset = BehaviorRecord.objects.select_related('student__user', 'student__classroom', 'approved_by')
    
    # Filter theo quyền
    if user.role == 'student':
        # Học sinh chỉ thấy vi phạm của mình
        try:
            student = Student.objects.get(user=user)
            queryset = queryset.filter(student=student)
        except Student.DoesNotExist:
            return Response({'error': 'Không tìm thấy thông tin học sinh'}, status=status.HTTP_404_NOT_FOUND)
    
    elif user.role == 'teacher':
        # Giáo viên thấy vi phạm của lớp mình chủ nhiệm
        homeroom_classrooms = user.homeroom_classrooms.all()
        if homeroom_classrooms:
            queryset = queryset.filter(student__classroom__in=homeroom_classrooms)
        else:
            return Response({'error': 'Bạn không phải giáo viên chủ nhiệm lớp nào'}, status=status.HTTP_403_FORBIDDEN)
    
    # Admin thấy tất cả
    
    # Apply filters
    classroom_id = request.query_params.get('classroom_id')
    if classroom_id and classroom_id != 'all':
        queryset = queryset.filter(student__classroom_id=classroom_id)
    
    status_filter = request.query_params.get('status')
    if status_filter and status_filter != 'all':
        queryset = queryset.filter(status=status_filter)
    
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(student__user__first_name__icontains=search) |
            Q(student__user__last_name__icontains=search) |
            Q(student__student_code__icontains=search) |
            Q(violation_type__icontains=search) |
            Q(description__icontains=search)
        )
    
    # Ordering
    ordering = request.query_params.get('ordering', '-created_at')
    queryset = queryset.order_by(ordering)
    
    serializer = BehaviorRecordListSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def behavior_record_detail(request, id):
    """API lấy chi tiết vi phạm nề nết"""
    behavior_record = get_object_or_404(BehaviorRecord, id=id)
    
    # Check permissions
    user = request.user
    if user.role == 'student' and behavior_record.student.user != user:
        return Response(
            {'error': 'Không có quyền truy cập'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = BehaviorRecordSerializer(behavior_record)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def behavior_record_create(request):
    """API tạo vi phạm nề nết - học sinh có thể tạo vi phạm cho mình hoặc cho học sinh khác trong cùng lớp"""
    if request.user.role != 'student':
        return Response(
            {'error': 'Chỉ học sinh mới được tạo vi phạm nề nết'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Lấy thông tin học sinh tạo vi phạm
    try:
        current_student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Không tìm thấy thông tin học sinh'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Kiểm tra xem học sinh có được phân công vào lớp không
    if not hasattr(current_student, 'classroom') or not current_student.classroom:
        return Response(
            {'error': 'Bạn chưa được phân công vào lớp học nào'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Kiểm tra xem lớp có giáo viên chủ nhiệm không
    if not hasattr(current_student.classroom, 'homeroom_teacher') or not current_student.classroom.homeroom_teacher:
        return Response(
            {'error': 'Lớp của bạn chưa có giáo viên chủ nhiệm'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = BehaviorRecordCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                # Xác định học sinh bị vi phạm
                target_student = current_student  # Mặc định là chính mình
                
                # Nếu có student_id trong request, kiểm tra xem có phải học sinh trong cùng lớp không
                if 'student_id' in serializer.validated_data and serializer.validated_data['student_id']:
                    try:
                        target_student = Student.objects.get(id=serializer.validated_data['student_id'])
                        
                        # Kiểm tra xem học sinh có trong cùng lớp không
                        if target_student.classroom.id != current_student.classroom.id:
                            return Response(
                                {'error': 'Bạn chỉ có thể tạo vi phạm cho học sinh trong cùng lớp'},
                                status=status.HTTP_403_FORBIDDEN
                            )
                    except Student.DoesNotExist:
                        return Response(
                            {'error': 'Không tìm thấy học sinh được chọn'},
                            status=status.HTTP_404_NOT_FOUND
                        )
                
                behavior_record = BehaviorRecord.objects.create(
                    student=target_student,
                    violation_type=serializer.validated_data['violation_type'],
                    description=serializer.validated_data['description'],
                    points_deducted=serializer.validated_data['points_deducted'],
                    status='pending'
                )
            
            response_serializer = BehaviorRecordSerializer(behavior_record)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Lỗi tạo vi phạm: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def behavior_record_update(request, id):
    """API cập nhật trạng thái vi phạm - chỉ giáo viên chủ nhiệm hoặc admin"""
    behavior_record = get_object_or_404(BehaviorRecord, id=id)
    user = request.user
    
    # Check permissions
    if user.role == 'student':
        return Response(
            {'error': 'Học sinh không có quyền cập nhật vi phạm'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if user.role == 'teacher':
        # Kiểm tra xem có phải giáo viên chủ nhiệm của lớp không
        if not user.homeroom_classrooms.filter(id=behavior_record.student.classroom.id).exists():
            return Response(
                {'error': 'Bạn không phải giáo viên chủ nhiệm của lớp này'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    serializer = BehaviorRecordUpdateSerializer(behavior_record, data=request.data, partial=True)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                new_status = serializer.validated_data['status']
                
                if new_status == 'approved':
                    behavior_record.approved_at = timezone.now()
                    behavior_record.approved_by = user
                elif new_status == 'rejected':
                    behavior_record.rejection_notes = serializer.validated_data.get('rejection_notes', '')
                
                behavior_record.status = new_status
                behavior_record.save()
            
            response_serializer = BehaviorRecordSerializer(behavior_record)
            return Response(response_serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Lỗi cập nhật vi phạm: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def behavior_record_delete(request, id):
    """API xóa vi phạm nề nết - chỉ admin hoặc học sinh tạo ra"""
    behavior_record = get_object_or_404(BehaviorRecord, id=id)
    user = request.user
    
    # Check permissions
    if user.role == 'student':
        if behavior_record.student.user != user:
            return Response(
                {'error': 'Bạn chỉ có thể xóa vi phạm của mình'},
                status=status.HTTP_403_FORBIDDEN
            )
        # Học sinh chỉ có thể xóa vi phạm chưa được duyệt
        if behavior_record.status != 'pending':
            return Response(
                {'error': 'Không thể xóa vi phạm đã được duyệt hoặc từ chối'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    try:
        behavior_record.delete()
        return Response({'message': 'Đã xóa vi phạm thành công'})
    except Exception as e:
        return Response(
            {'error': f'Lỗi xóa vi phạm: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def behavior_record_stats(request):
    """API lấy thống kê vi phạm nề nết"""
    user = request.user
    queryset = BehaviorRecord.objects.select_related('student__classroom')
    
    # Filter theo quyền
    if user.role == 'student':
        try:
            student = Student.objects.get(user=user)
            queryset = queryset.filter(student=student)
        except Student.DoesNotExist:
            return Response({'error': 'Không tìm thấy thông tin học sinh'}, status=status.HTTP_404_NOT_FOUND)
    
    elif user.role == 'teacher':
        homeroom_classrooms = user.homeroom_classrooms.all()
        if homeroom_classrooms:
            queryset = queryset.filter(student__classroom__in=homeroom_classrooms)
        else:
            return Response({'error': 'Bạn không phải giáo viên chủ nhiệm lớp nào'}, status=status.HTTP_403_FORBIDDEN)
    
    # Tính toán thống kê
    total_violations = queryset.count()
    pending_violations = queryset.filter(status='pending').count()
    approved_violations = queryset.filter(status='approved').count()
    rejected_violations = queryset.filter(status='rejected').count()
    total_points_deducted = queryset.filter(status='approved').aggregate(
        total=models.Sum('points_deducted')
    )['total'] or 0
    
    # Thống kê theo lớp
    classroom_stats = []
    if user.role in ['admin', 'teacher']:
        classroom_stats = queryset.values('student__classroom__full_name').annotate(
            count=models.Count('id')
        ).order_by('-count')[:10]
    
    stats = {
        'total_violations': total_violations,
        'pending_violations': pending_violations,
        'approved_violations': approved_violations,
        'rejected_violations': rejected_violations,
        'total_points_deducted': total_points_deducted,
        'classroom_stats': [
            {'classroom_name': item['student__classroom__full_name'], 'count': item['count']}
            for item in classroom_stats
        ]
    }
    
    return Response(stats) 