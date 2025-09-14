from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import User
from .serializers import (
    LoginRequestSerializer, RegisterRequestSerializer, ChangePasswordRequestSerializer,
    UserResponseSerializer, LoginResponseSerializer, RegisterResponseSerializer, 
    ChangePasswordResponseSerializer
)
from applications.permissions import IsAdminUser

User = get_user_model()


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Đăng nhập"""
    serializer = LoginRequestSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': UserResponseSerializer(user).data
        }
        
        response_serializer = LoginResponseSerializer(data=response_data)
        response_serializer.is_valid()
        return Response(response_serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Đăng ký"""
    serializer = RegisterRequestSerializer(data=request.data)
    if serializer.is_valid():
        # Tạo user mới
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['last_name'],
            role=serializer.validated_data['role'],
            phone=serializer.validated_data.get('phone', '')
        )
        
        # Tạo token
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': UserResponseSerializer(user).data
        }
        
        response_serializer = RegisterResponseSerializer(data=response_data)
        response_serializer.is_valid()
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh token"""
    try:
        refresh_token = request.data.get('refresh_token')
        refresh = RefreshToken(refresh_token)
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh)
        })
    except Exception:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """Đăng xuất"""
    try:
        refresh_token = request.data.get('refresh_token')
        refresh = RefreshToken(refresh_token)
        refresh.blacklist()
        return Response({'message': 'Đăng xuất thành công'})
    except Exception:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Đổi mật khẩu"""
    serializer = ChangePasswordRequestSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if user.check_password(serializer.validated_data['old_password']):
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            response_data = {'message': 'Đổi mật khẩu thành công'}
            response_serializer = ChangePasswordResponseSerializer(data=response_data)
            response_serializer.is_valid()
            return Response(response_serializer.data)
        else:
            return Response({'error': 'Mật khẩu cũ không đúng'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# User Views
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_list(request):
    """Danh sách users (Admin only)"""
    users = User.objects.all()
    
    # Filter theo role
    role = request.query_params.get('role', None)
    if role:
        users = users.filter(role=role)
    
    serializer = UserResponseSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Lấy thông tin profile của user hiện tại"""
    serializer = UserResponseSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Cập nhật profile của user hiện tại"""
    serializer = UserResponseSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 