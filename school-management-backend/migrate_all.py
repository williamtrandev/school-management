#!/usr/bin/env python3
"""
Script để migration tất cả apps trong folder applications
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# Thêm project path vào sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school_management.settings')
django.setup()

# Danh sách tất cả apps cần migration
apps = [
    'user_management',
    'event', 
    'grade',
    'classroom',
    'student',
    'teacher',
    'week_summary',
    'notification',
    'point_rule'
]

def migrate_all_apps():
    """Migration tất cả apps"""
    print("🚀 Bắt đầu migration tất cả apps...")
    
    # Bước 1: Tạo migrations cho tất cả apps
    print("\n📝 Tạo migrations...")
    for app in apps:
        print(f"  - Tạo migration cho {app}")
        try:
            execute_from_command_line(['manage.py', 'makemigrations', app])
            print(f"    ✅ {app} - OK")
        except Exception as e:
            print(f"    ❌ {app} - Lỗi: {e}")
    
    # Bước 2: Chạy migrations
    print("\n🔄 Chạy migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("  ✅ Migration thành công!")
    except Exception as e:
        print(f"  ❌ Lỗi migration: {e}")
    
    print("\n🎉 Hoàn thành migration tất cả apps!")

if __name__ == '__main__':
    migrate_all_apps() 