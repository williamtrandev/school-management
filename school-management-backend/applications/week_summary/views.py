from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from datetime import datetime, timedelta

from .models import WeekSummary
from .serializers import WeekSummarySerializer
from applications.classroom.models import Classroom


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def week_summary_list(request):
    """API lấy danh sách tổng kết tuần"""
    # Filter theo role của user
    user = request.user
    queryset = WeekSummary.objects.select_related('classroom', 'approved_by')
    
    if user.role == 'student':
        # Học sinh chỉ thấy lớp của mình
        if hasattr(user, 'student'):
            queryset = queryset.filter(classroom=user.student.classroom)
        else:
            queryset = queryset.none()
    elif user.role == 'teacher':
        # Giáo viên thấy lớp mình chủ nhiệm
        queryset = queryset.filter(classroom__homeroom_teacher=user)
    # Admin thấy tất cả
    
    # Apply filters
    classroom_id = request.query_params.get('classroom_id')
    if classroom_id:
        queryset = queryset.filter(classroom_id=classroom_id)
    
    week_number = request.query_params.get('week_number')
    if week_number:
        queryset = queryset.filter(week_number=week_number)
    
    year = request.query_params.get('year')
    if year:
        queryset = queryset.filter(year=year)
    
    is_approved = request.query_params.get('is_approved')
    if is_approved is not None:
        queryset = queryset.filter(is_approved=is_approved.lower() == 'true')
    
    # Ordering
    queryset = queryset.order_by('-year', '-week_number', 'total_points')
    
    serializer = WeekSummarySerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def week_summary_detail(request, id):
    """API lấy chi tiết tổng kết tuần"""
    week_summary = get_object_or_404(WeekSummary, id=id)
    serializer = WeekSummarySerializer(week_summary)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def week_summary_approve(request, id):
    """API duyệt tổng kết tuần"""
    week_summary = get_object_or_404(WeekSummary, id=id)
    
    # Chỉ admin mới được duyệt
    if request.user.role != 'admin':
        return Response(
            {'error': 'Chỉ admin mới được duyệt tổng kết tuần'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    week_summary.is_approved = True
    week_summary.approved_by = request.user
    week_summary.approved_at = datetime.now()
    week_summary.save()
    
    serializer = WeekSummarySerializer(week_summary)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_rankings(request):
    """API lấy bảng xếp hạng cho dashboard"""
    # Filter theo role của user
    user = request.user
    queryset = WeekSummary.objects.select_related('classroom', 'approved_by')
    
    if user.role == 'student':
        # Học sinh chỉ thấy lớp của mình
        if hasattr(user, 'student'):
            queryset = queryset.filter(classroom=user.student.classroom)
        else:
            queryset = queryset.none()
    elif user.role == 'teacher':
        # Giáo viên thấy lớp mình chủ nhiệm
        queryset = queryset.filter(classroom__homeroom_teacher=user)
    # Admin thấy tất cả
    
    # Get current week and year
    week_number = request.query_params.get('week_number')
    year = request.query_params.get('year')
    
    if week_number and year:
        queryset = queryset.filter(week_number=week_number, year=year)
    else:
        # Default to current week
        now = datetime.now()
        current_week = now.isocalendar()[1]
        current_year = now.year
        queryset = queryset.filter(week_number=current_week, year=current_year)
    
    # Order by total points descending
    queryset = queryset.order_by('-total_points')
    
    serializer = WeekSummarySerializer(queryset, many=True)
    return Response(serializer.data) 