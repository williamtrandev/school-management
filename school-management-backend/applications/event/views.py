from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Event, EventType
from .serializers import (
    EventCreateRequestSerializer, EventUpdateRequestSerializer, EventResponseSerializer,
    EventTypeResponseSerializer, EventBulkCreateRequestSerializer, EventBulkCreateResponseSerializer
)
from applications.permissions import IsAdminOrTeacher


# Event Type Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_type_list(request):
    """Danh sách loại sự kiện"""
    event_types = EventType.objects.filter(is_active=True)
    serializer = EventTypeResponseSerializer(event_types, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrTeacher])
def event_type_create(request):
    """Tạo loại sự kiện mới"""
    serializer = EventTypeResponseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_type_detail(request, pk):
    """Chi tiết loại sự kiện"""
    try:
        event_type = EventType.objects.get(pk=pk)
        serializer = EventTypeResponseSerializer(event_type)
        return Response(serializer.data)
    except EventType.DoesNotExist:
        return Response({'error': 'Loại sự kiện không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminOrTeacher])
def event_type_update(request, pk):
    """Cập nhật loại sự kiện"""
    try:
        event_type = EventType.objects.get(pk=pk)
        serializer = EventTypeResponseSerializer(event_type, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except EventType.DoesNotExist:
        return Response({'error': 'Loại sự kiện không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminOrTeacher])
def event_type_delete(request, pk):
    """Xóa loại sự kiện"""
    try:
        event_type = EventType.objects.get(pk=pk)
        event_type.delete()
        return Response({'message': 'Xóa loại sự kiện thành công'})
    except EventType.DoesNotExist:
        return Response({'error': 'Loại sự kiện không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


# Event Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_list(request):
    """Danh sách sự kiện"""
    events = Event.objects.select_related(
        'event_type', 'classroom', 'student__user', 'recorded_by'
    ).all()
    
    # Filter theo các tham số
    classroom_id = request.query_params.get('classroom_id', None)
    if classroom_id:
        events = events.filter(classroom_id=classroom_id)
    
    event_type_id = request.query_params.get('event_type_id', None)
    if event_type_id:
        events = events.filter(event_type_id=event_type_id)
    
    student_id = request.query_params.get('student_id', None)
    if student_id:
        events = events.filter(student_id=student_id)
    
    date = request.query_params.get('date', None)
    if date:
        events = events.filter(date=date)
    
    start_date = request.query_params.get('start_date', None)
    if start_date:
        events = events.filter(date__gte=start_date)
    
    end_date = request.query_params.get('end_date', None)
    if end_date:
        events = events.filter(date__lte=end_date)
    
    serializer = EventResponseSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrTeacher])
def event_create(request):
    """Tạo sự kiện mới"""
    serializer = EventCreateRequestSerializer(data=request.data)
    if serializer.is_valid():
        event = serializer.save(recorded_by=request.user)
        response_serializer = EventResponseSerializer(event)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_detail(request, pk):
    """Chi tiết sự kiện"""
    try:
        event = Event.objects.select_related(
            'event_type', 'classroom', 'student__user', 'recorded_by'
        ).get(pk=pk)
        serializer = EventResponseSerializer(event)
        return Response(serializer.data)
    except Event.DoesNotExist:
        return Response({'error': 'Sự kiện không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminOrTeacher])
def event_update(request, pk):
    """Cập nhật sự kiện"""
    try:
        event = Event.objects.get(pk=pk)
        serializer = EventUpdateRequestSerializer(event, data=request.data)
        if serializer.is_valid():
            serializer.save()
            response_serializer = EventResponseSerializer(event)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Event.DoesNotExist:
        return Response({'error': 'Sự kiện không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminOrTeacher])
def event_delete(request, pk):
    """Xóa sự kiện"""
    try:
        event = Event.objects.get(pk=pk)
        event.delete()
        return Response({'message': 'Xóa sự kiện thành công'})
    except Event.DoesNotExist:
        return Response({'error': 'Sự kiện không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrTeacher])
def event_bulk_create(request):
    """Tạo nhiều events cùng lúc"""
    serializer = EventBulkCreateRequestSerializer(data=request.data)
    if serializer.is_valid():
        events_data = serializer.validated_data['events']
        created_events = []
        
        for event_data in events_data:
            event_data['recorded_by'] = request.user
            event = Event.objects.create(**event_data)
            created_events.append(event)
        
        response_data = {
            'message': f'Đã tạo {len(created_events)} events thành công',
            'created_count': len(created_events),
            'events': EventResponseSerializer(created_events, many=True).data
        }
        
        response_serializer = EventBulkCreateResponseSerializer(data=response_data)
        response_serializer.is_valid()
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 