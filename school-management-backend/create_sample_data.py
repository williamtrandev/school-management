#!/usr/bin/env python
"""
Script tạo dữ liệu mẫu cho hệ thống quản lý trường học
"""
import os
import sys
import django
from datetime import date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school_management.settings')
django.setup()

from applications.user_management.models import User
from applications.grade.models import Grade
from applications.classroom.models import Classroom
from django.contrib.auth.hashers import make_password

def create_sample_data():
    """Tạo dữ liệu mẫu"""
    print("Bắt đầu tạo dữ liệu mẫu...")
    
    # Tạo Grade
    grades_data = [
        {'name': '10', 'description': 'Khối 10'},
        {'name': '11', 'description': 'Khối 11'},
        {'name': '12', 'description': 'Khối 12'},
    ]
    
    grades = []
    for grade_data in grades_data:
        grade, created = Grade.objects.get_or_create(
            name=grade_data['name'],
            defaults=grade_data
        )
        if created:
            print(f"Đã tạo Grade: {grade.name}")
        else:
            print(f"Grade {grade.name} đã tồn tại")
        grades.append(grade)
    
    # Tạo User (Admin)
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'password': make_password('admin123'),
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin'
        }
    )
    if created:
        print("Đã tạo Admin user")
    else:
        print("Admin user đã tồn tại")
    
    # Tạo User (Teachers)
    teachers_data = [
        {
            'username': 'teacher1',
            'email': 'teacher1@example.com',
            'password': 'teacher123',
            'first_name': 'Nguyễn',
            'last_name': 'Văn A',
            'role': 'teacher'
        },
        {
            'username': 'teacher2',
            'email': 'teacher2@example.com',
            'password': 'teacher123',
            'first_name': 'Trần',
            'last_name': 'Thị B',
            'role': 'teacher'
        },
        {
            'username': 'teacher3',
            'email': 'teacher3@example.com',
            'password': 'teacher123',
            'first_name': 'Lê',
            'last_name': 'Minh C',
            'role': 'teacher'
        }
    ]
    
    teachers = []
    for teacher_data in teachers_data:
        teacher, created = User.objects.get_or_create(
            username=teacher_data['username'],
            defaults={
                'email': teacher_data['email'],
                'password': make_password(teacher_data['password']),
                'first_name': teacher_data['first_name'],
                'last_name': teacher_data['last_name'],
                'role': teacher_data['role']
            }
        )
        if created:
            print(f"Đã tạo Teacher: {teacher.get_full_name()}")
        else:
            print(f"Teacher {teacher.get_full_name()} đã tồn tại")
        teachers.append(teacher)
    
    # Tạo Classroom
    classrooms_data = [
        # Khối 12
        {'name': 'A1', 'grade': grades[2], 'homeroom_teacher': teachers[0], 'is_special': True},
        {'name': 'A2', 'grade': grades[2], 'homeroom_teacher': teachers[1], 'is_special': False},
        {'name': 'B1', 'grade': grades[2], 'homeroom_teacher': teachers[2], 'is_special': False},
        {'name': 'B2', 'grade': grades[2], 'homeroom_teacher': None, 'is_special': False},
        
        # Khối 11
        {'name': 'A1', 'grade': grades[1], 'homeroom_teacher': teachers[0], 'is_special': True},
        {'name': 'A2', 'grade': grades[1], 'homeroom_teacher': teachers[1], 'is_special': False},
        {'name': 'B1', 'grade': grades[1], 'homeroom_teacher': teachers[2], 'is_special': False},
        {'name': 'B2', 'grade': grades[1], 'homeroom_teacher': None, 'is_special': False},
        
        # Khối 10
        {'name': 'A1', 'grade': grades[0], 'homeroom_teacher': teachers[0], 'is_special': True},
        {'name': 'A2', 'grade': grades[0], 'homeroom_teacher': teachers[1], 'is_special': False},
        {'name': 'B1', 'grade': grades[0], 'homeroom_teacher': teachers[2], 'is_special': False},
        {'name': 'B2', 'grade': grades[0], 'homeroom_teacher': None, 'is_special': False},
    ]
    
    for classroom_data in classrooms_data:
        classroom, created = Classroom.objects.get_or_create(
            name=classroom_data['name'],
            grade=classroom_data['grade'],
            defaults={
                'homeroom_teacher': classroom_data['homeroom_teacher'],
                'is_special': classroom_data['is_special']
            }
        )
        if created:
            print(f"Đã tạo Classroom: {classroom.full_name}")
        else:
            print(f"Classroom {classroom.full_name} đã tồn tại")
    
    print("\n✅ Hoàn thành tạo dữ liệu mẫu!")
    print("\n📋 Thông tin đăng nhập:")
    print("Admin: admin / admin123")
    print("Teacher1: teacher1 / teacher123")
    print("Teacher2: teacher2 / teacher123")
    print("Teacher3: teacher3 / teacher123")
    print("\n📚 Danh sách lớp học:")
    for grade in grades:
        print(f"Khối {grade.name}:")
        for classroom in grade.classrooms.all():
            teacher_name = classroom.homeroom_teacher.get_full_name() if classroom.homeroom_teacher else "Chưa phân công"
            print(f"  - {classroom.full_name} (GVCN: {teacher_name})")

if __name__ == '__main__':
    try:
        create_sample_data()
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        sys.exit(1) 