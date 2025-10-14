#!/usr/bin/env python3
"""
Script để tạo các loại sự kiện mẫu với phân quyền
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school_management.settings')
django.setup()

from applications.event.models import EventType

def create_event_types():
    """Tạo các loại sự kiện mẫu"""
    
    # Xóa tất cả loại sự kiện cũ
    EventType.objects.all().delete()
    print("Đã xóa tất cả loại sự kiện cũ")
    
    # Loại sự kiện cho học sinh (nề nếp, tác phong, vệ sinh, quy định)
    student_event_types = [
        # Nề nếp tác phong
        {
            'name': 'Đi học muộn',
            'description': 'Học sinh đến lớp muộn',
            'category': 'discipline',
            'allowed_roles': 'student',
            'default_points': -2
        },
        {
            'name': 'Không mặc đồng phục',
            'description': 'Học sinh không mặc đồng phục đúng quy định',
            'category': 'discipline',
            'allowed_roles': 'student',
            'default_points': -1
        },
        {
            'name': 'Không mang khăn quàng đỏ',
            'description': 'Học sinh không mang khăn quàng đỏ',
            'category': 'discipline',
            'allowed_roles': 'student',
            'default_points': -1
        },
        {
            'name': 'Tác phong không đúng',
            'description': 'Tác phong không phù hợp với học sinh',
            'category': 'discipline',
            'allowed_roles': 'student',
            'default_points': -1
        },
        {
            'name': 'Đi học đúng giờ',
            'description': 'Học sinh đi học đúng giờ, đúng tác phong',
            'category': 'discipline',
            'allowed_roles': 'student',
            'default_points': 1
        },
        
        # Vệ sinh
        {
            'name': 'Không vệ sinh lớp học',
            'description': 'Không thực hiện vệ sinh lớp học theo phân công',
            'category': 'hygiene',
            'allowed_roles': 'student',
            'default_points': -2
        },
        {
            'name': 'Vệ sinh lớp học tốt',
            'description': 'Thực hiện vệ sinh lớp học sạch sẽ, đúng quy định',
            'category': 'hygiene',
            'allowed_roles': 'student',
            'default_points': 2
        },
        {
            'name': 'Vứt rác không đúng nơi quy định',
            'description': 'Vứt rác không đúng nơi quy định',
            'category': 'hygiene',
            'allowed_roles': 'student',
            'default_points': -1
        },
        {
            'name': 'Giữ gìn vệ sinh chung',
            'description': 'Tích cực giữ gìn vệ sinh chung của trường, lớp',
            'category': 'hygiene',
            'allowed_roles': 'student',
            'default_points': 1
        },
        
        # Quy định nhà trường
        {
            'name': 'Vi phạm nội quy trường',
            'description': 'Vi phạm các quy định của nhà trường',
            'category': 'school_rules',
            'allowed_roles': 'student',
            'default_points': -3
        },
        {
            'name': 'Không tuân thủ quy định',
            'description': 'Không tuân thủ các quy định của nhà trường',
            'category': 'school_rules',
            'allowed_roles': 'student',
            'default_points': -2
        },
        {
            'name': 'Tuân thủ tốt nội quy',
            'description': 'Tuân thủ tốt các nội quy của nhà trường',
            'category': 'school_rules',
            'allowed_roles': 'student',
            'default_points': 2
        },
        {
            'name': 'Tích cực tham gia hoạt động',
            'description': 'Tích cực tham gia các hoạt động của trường, lớp',
            'category': 'school_rules',
            'allowed_roles': 'student',
            'default_points': 3
        }
    ]
    
    # Loại sự kiện cho giáo viên (học tập, hành vi, đánh giá tiết học)
    teacher_event_types = [
        # Học tập
        {
            'name': 'Điểm kiểm tra miệng',
            'description': 'Điểm kiểm tra miệng trong giờ học',
            'category': 'academic',
            'allowed_roles': 'teacher',
            'default_points': 0
        },
        {
            'name': 'Làm bài tập tốt',
            'description': 'Làm bài tập đầy đủ và chính xác',
            'category': 'academic',
            'allowed_roles': 'teacher',
            'default_points': 2
        },
        {
            'name': 'Không làm bài tập',
            'description': 'Không làm bài tập về nhà',
            'category': 'academic',
            'allowed_roles': 'teacher',
            'default_points': -2
        },
        {
            'name': 'Phát biểu xây dựng bài',
            'description': 'Tích cực phát biểu xây dựng bài học',
            'category': 'academic',
            'allowed_roles': 'teacher',
            'default_points': 1
        },
        {
            'name': 'Không chú ý nghe giảng',
            'description': 'Không chú ý nghe giảng, làm việc riêng',
            'category': 'academic',
            'allowed_roles': 'teacher',
            'default_points': -1
        },
        
        # Hành vi - Đánh giá tiết học
        {
            'name': 'Tiết tốt',
            'description': 'Tiết học có chất lượng tốt',
            'category': 'behavior',
            'allowed_roles': 'teacher',
            'default_points': 10
        },
        {
            'name': 'Tiết khá',
            'description': 'Tiết học có chất lượng khá',
            'category': 'behavior',
            'allowed_roles': 'teacher',
            'default_points': 8
        },
        {
            'name': 'Tiết trung bình',
            'description': 'Tiết học có chất lượng trung bình',
            'category': 'behavior',
            'allowed_roles': 'teacher',
            'default_points': 1
        },
        {
            'name': 'Tiết yếu',
            'description': 'Tiết học có chất lượng yếu',
            'category': 'behavior',
            'allowed_roles': 'teacher',
            'default_points': -5
        },
        {
            'name': 'Tiết kém',
            'description': 'Tiết học có chất lượng kém',
            'category': 'behavior',
            'allowed_roles': 'teacher',
            'default_points': -9
        },
        {
            'name': 'Tích cực tham gia thảo luận',
            'description': 'Tích cực tham gia thảo luận nhóm',
            'category': 'behavior',
            'allowed_roles': 'teacher',
            'default_points': 2
        },
        {
            'name': 'Giúp đỡ bạn bè',
            'description': 'Tích cực giúp đỡ bạn bè trong học tập',
            'category': 'behavior',
            'allowed_roles': 'teacher',
            'default_points': 3
        },
        {
            'name': 'Gây mất trật tự',
            'description': 'Gây mất trật tự trong lớp học',
            'category': 'behavior',
            'allowed_roles': 'teacher',
            'default_points': -2
        },
        {
            'name': 'Không tuân thủ hướng dẫn',
            'description': 'Không tuân thủ hướng dẫn của giáo viên',
            'category': 'behavior',
            'allowed_roles': 'teacher',
            'default_points': -1
        },
        
        # Loại sự kiện cho cả hai
        {
            'name': 'Vi phạm nghiêm trọng',
            'description': 'Vi phạm nghiêm trọng nội quy trường',
            'category': 'school_rules',
            'allowed_roles': 'both',
            'default_points': -5
        },
        {
            'name': 'Thành tích xuất sắc',
            'description': 'Đạt thành tích xuất sắc trong học tập hoặc hoạt động',
            'category': 'academic',
            'allowed_roles': 'both',
            'default_points': 5
        }
    ]
    
    # Tạo loại sự kiện cho học sinh
    print("Tạo loại sự kiện cho học sinh...")
    for event_data in student_event_types:
        event_type = EventType.objects.create(**event_data)
        print(f"✓ {event_type.name} ({event_type.get_category_display()}) - {event_type.default_points} điểm")
    
    # Tạo loại sự kiện cho giáo viên
    print("\nTạo loại sự kiện cho giáo viên...")
    for event_data in teacher_event_types:
        event_type = EventType.objects.create(**event_data)
        print(f"✓ {event_type.name} ({event_type.get_category_display()}) - {event_type.default_points} điểm")
    
    print(f"\n✅ Đã tạo thành công {EventType.objects.count()} loại sự kiện!")
    print("\n📊 Thống kê:")
    print(f"- Nề nếp tác phong: {EventType.objects.filter(category='discipline').count()}")
    print(f"- Vệ sinh: {EventType.objects.filter(category='hygiene').count()}")
    print(f"- Quy định nhà trường: {EventType.objects.filter(category='school_rules').count()}")
    print(f"- Học tập: {EventType.objects.filter(category='academic').count()}")
    print(f"- Hành vi: {EventType.objects.filter(category='behavior').count()}")
    print(f"\n👥 Phân quyền:")
    print(f"- Chỉ học sinh: {EventType.objects.filter(allowed_roles='student').count()}")
    print(f"- Chỉ giáo viên: {EventType.objects.filter(allowed_roles='teacher').count()}")
    print(f"- Cả hai: {EventType.objects.filter(allowed_roles='both').count()}")

if __name__ == '__main__':
    create_event_types()

