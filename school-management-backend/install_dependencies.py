#!/usr/bin/env python3
"""
Script cài đặt dependencies cho project
"""
import subprocess
import sys
import os

def install_requirements():
    """Cài đặt requirements.txt"""
    print("📦 Cài đặt dependencies từ requirements.txt...")
    
    try:
        # Kiểm tra file requirements.txt
        if not os.path.exists('requirements.txt'):
            print("❌ Không tìm thấy file requirements.txt")
            return False
        
        # Cài đặt dependencies
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencies đã được cài đặt thành công!")
            return True
        else:
            print("❌ Lỗi cài đặt dependencies:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False

def check_dependencies():
    """Kiểm tra dependencies đã cài đặt"""
    print("🔍 Kiểm tra dependencies...")
    
    dependencies = [
        'django',
        'djangorestframework',
        'djangorestframework_simplejwt',
        'django_cors_headers',
        'mysqlclient',
        'mysql.connector',
        'python_decouple'
    ]
    
    missing = []
    
    for dep in dependencies:
        try:
            if dep == 'mysql.connector':
                import mysql.connector
            elif dep == 'python_decouple':
                from decouple import config
            else:
                __import__(dep)
            print(f"  ✅ {dep}")
        except ImportError:
            print(f"  ❌ {dep}")
            missing.append(dep)
    
    if missing:
        print(f"\n❌ Thiếu {len(missing)} dependencies:")
        for dep in missing:
            print(f"   - {dep}")
        return False
    
    print("\n✅ Tất cả dependencies đã được cài đặt!")
    return True

def main():
    """Main function"""
    print("🚀 Cài đặt Dependencies cho School Management System")
    print("=" * 50)
    
    # Cài đặt dependencies
    if not install_requirements():
        print("\n🔧 Hướng dẫn cài đặt thủ công:")
        print("1. Tạo virtual environment:")
        print("   python3 -m venv venv")
        print("   source venv/bin/activate  # macOS/Linux")
        print("   venv\\Scripts\\activate     # Windows")
        
        print("\n2. Cài đặt dependencies:")
        print("   pip install -r requirements.txt")
        
        print("\n3. Nếu gặp lỗi với mysqlclient:")
        print("   - macOS: brew install mysql-connector-c")
        print("   - Ubuntu: sudo apt-get install python3-dev default-libmysqlclient-dev build-essential")
        print("   - Windows: Tải từ https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient")
        
        return
    
    # Kiểm tra dependencies
    print("\n" + "=" * 50)
    if check_dependencies():
        print("\n🎉 Setup hoàn tất! Bạn có thể tiếp tục với:")
        print("   python3 database_setup.py")
    else:
        print("\n❌ Vẫn thiếu dependencies. Vui lòng cài đặt thủ công.")

if __name__ == '__main__':
    main() 