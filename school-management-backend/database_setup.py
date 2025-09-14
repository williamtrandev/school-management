#!/usr/bin/env python3
"""
Script setup database MySQL cho project
"""
import os
import sys
from decouple import config

def check_dependencies():
    """Kiểm tra dependencies"""
    missing_deps = []
    
    try:
        import mysql.connector
    except ImportError:
        missing_deps.append("mysql-connector-python")
    
    try:
        import django
    except ImportError:
        missing_deps.append("django")
    
    if missing_deps:
        print("❌ Thiếu dependencies:")
        for dep in missing_deps:
            print(f"   - {dep}")
        print("\n🔧 Cài đặt dependencies:")
        print("   pip install -r requirements.txt")
        return False
    
    return True

def create_database():
    """Tạo database MySQL"""
    if not check_dependencies():
        return
    
    try:
        import mysql.connector
        from mysql.connector import Error
        
        # Lấy database config từ environment variables
        db_host = config('DB_HOST', default='localhost')
        db_user = config('DB_USER', default='root')
        db_password = config('DB_PASSWORD', default='password')
        db_name = config('DB_NAME', default='school_management')
        
        # Kết nối MySQL server
        connection = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Tạo database
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✅ Database '{db_name}' đã được tạo thành công!")
            
            # Hiển thị danh sách databases
            cursor.execute("SHOW DATABASES")
            databases = cursor.fetchall()
            print("\n📋 Danh sách databases:")
            for db in databases:
                print(f"  - {db[0]}")
                
    except Error as e:
        print(f"❌ Lỗi kết nối MySQL: {e}")
        print("\n🔧 Hướng dẫn setup MySQL:")
        print("1. Cài đặt MySQL Server:")
        print("   - macOS: brew install mysql")
        print("   - Ubuntu: sudo apt-get install mysql-server")
        print("   - Windows: Tải từ https://dev.mysql.com/downloads/mysql/")
        
        print("\n2. Khởi động MySQL service:")
        print("   - macOS: brew services start mysql")
        print("   - Ubuntu: sudo systemctl start mysql")
        print("   - Windows: net start mysql")
        
        print("\n3. Tạo file .env từ env_template.txt:")
        print("   cp env_template.txt .env")
        print("   # Sau đó chỉnh sửa .env với thông tin database thực tế")
        
        print("\n4. Tạo user và database:")
        print("   mysql -u root -p")
        print(f"   CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        print("   CREATE USER 'django_user'@'localhost' IDENTIFIED BY 'your_password';")
        print(f"   GRANT ALL PRIVILEGES ON {db_name}.* TO 'django_user'@'localhost';")
        print("   FLUSH PRIVILEGES;")
        
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("\n🔌 Đã đóng kết nối MySQL")

def check_mysql_connection():
    """Kiểm tra kết nối MySQL"""
    if not check_dependencies():
        return
    
    try:
        import mysql.connector
        from mysql.connector import Error
        
        # Lấy database config từ environment variables
        db_host = config('DB_HOST', default='localhost')
        db_user = config('DB_USER', default='root')
        db_password = config('DB_PASSWORD', default='password')
        db_name = config('DB_NAME', default='school_management')
        
        connection = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name
        )
        
        if connection.is_connected():
            print("✅ Kết nối MySQL thành công!")
            db_info = connection.get_server_info()
            print(f"📊 MySQL Server version: {db_info}")
            
            cursor = connection.cursor()
            cursor.execute("select database();")
            record = cursor.fetchone()
            print(f"🗄️ Database: {record[0]}")
            
    except Error as e:
        print(f"❌ Lỗi kết nối MySQL: {e}")
        
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

def setup_env_file():
    """Tạo file .env từ template"""
    if not os.path.exists('.env'):
        if os.path.exists('env_template.txt'):
            import shutil
            shutil.copy('env_template.txt', '.env')
            print("✅ Đã tạo file .env từ env_template.txt")
            print("🔧 Vui lòng chỉnh sửa file .env với thông tin database thực tế")
        else:
            print("❌ Không tìm thấy file env_template.txt")
    else:
        print("ℹ️ File .env đã tồn tại")

def install_dependencies():
    """Cài đặt dependencies"""
    print("📦 Cài đặt dependencies...")
    try:
        import subprocess
        result = subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Dependencies đã được cài đặt thành công!")
        else:
            print("❌ Lỗi cài đặt dependencies:")
            print(result.stderr)
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        print("🔧 Vui lòng chạy thủ công: pip install -r requirements.txt")

if __name__ == '__main__':
    print("🚀 Setup Database MySQL cho School Management System")
    print("=" * 50)
    
    print("\n0️⃣ Kiểm tra dependencies...")
    if not check_dependencies():
        print("\n📦 Cài đặt dependencies...")
        install_dependencies()
        print("\n🔄 Kiểm tra lại dependencies...")
        if not check_dependencies():
            print("❌ Vẫn thiếu dependencies. Vui lòng cài đặt thủ công:")
            print("   pip install -r requirements.txt")
            sys.exit(1)
    
    print("\n1️⃣ Tạo file .env...")
    setup_env_file()
    
    print("\n2️⃣ Tạo database...")
    create_database()
    
    print("\n3️⃣ Kiểm tra kết nối...")
    check_mysql_connection()
    
    print("\n4️⃣ Hướng dẫn tiếp theo:")
    print("   - Chỉnh sửa file .env với thông tin database thực tế")
    print("   - Chạy migrations: python3 migrate_all.py")
    print("   - Tạo superuser: python3 manage.py createsuperuser")
    print("   - Chạy server: python3 manage.py runserver") 