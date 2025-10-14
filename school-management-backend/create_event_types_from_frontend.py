#!/usr/bin/env python3
"""
Script để tạo các loại sự kiện dựa trên frontend constants
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school_management.settings')
django.setup()

from applications.event.models import EventType

def create_event_types_from_frontend():
    """Tạo các loại sự kiện dựa trên frontend constants"""
    
    # Xóa tất cả loại sự kiện cũ
    EventType.objects.all().delete()
    print("Đã xóa tất cả loại sự kiện cũ")
    
    # Event types cho lesson ratings (đánh giá tiết học)
    lesson_rating_types = [
        {
            'name': 'Tiết tốt',
            'description': 'Tiết học có chất lượng tốt',
            'category': 'behavior',
            'allowed_roles': 'both',
            'default_points': 10
        },
        {
            'name': 'Tiết khá',
            'description': 'Tiết học có chất lượng khá',
            'category': 'behavior',
            'allowed_roles': 'both',
            'default_points': 8
        },
        {
            'name': 'Tiết trung bình',
            'description': 'Tiết học có chất lượng trung bình',
            'category': 'behavior',
            'allowed_roles': 'both',
            'default_points': 1
        },
        {
            'name': 'Tiết yếu',
            'description': 'Tiết học có chất lượng yếu',
            'category': 'behavior',
            'allowed_roles': 'both',
            'default_points': -5
        },
        {
            'name': 'Tiết kém',
            'description': 'Tiết học có chất lượng kém',
            'category': 'behavior',
            'allowed_roles': 'both',
            'default_points': -9
        },
    ]
    
    # Event types cho point columns (cột điểm)
    point_column_types = [
        {
            'name': 'Điểm 10',
            'description': 'Điểm 10 kiểm tra miệng',
            'category': 'academic',
            'allowed_roles': 'both',
            'default_points': 8
        },
        {
            'name': 'Điểm 9',
            'description': 'Điểm 9 kiểm tra miệng',
            'category': 'academic',
            'allowed_roles': 'both',
            'default_points': 6
        },
        {
            'name': 'Điểm 8',
            'description': 'Điểm 8 kiểm tra miệng',
            'category': 'academic',
            'allowed_roles': 'both',
            'default_points': 4
        },
        {
            'name': 'Điểm 4',
            'description': 'Điểm 4 kiểm tra miệng',
            'category': 'academic',
            'allowed_roles': 'both',
            'default_points': -4
        },
        {
            'name': 'Điểm 3',
            'description': 'Điểm 3 kiểm tra miệng',
            'category': 'academic',
            'allowed_roles': 'both',
            'default_points': -5
        },
        {
            'name': 'Điểm 2 trở xuống',
            'description': 'Điểm 2 trở xuống kiểm tra miệng',
            'category': 'academic',
            'allowed_roles': 'both',
            'default_points': -6
        },
        {
            'name': 'Điểm nợ',
            'description': 'Điểm nợ kiểm tra miệng',
            'category': 'academic',
            'allowed_roles': 'both',
            'default_points': -7
        },
        {
            'name': 'Không thuộc bài',
            'description': 'Không thuộc bài kiểm tra miệng',
            'category': 'academic',
            'allowed_roles': 'both',
            'default_points': -8
        },
    ]
    
    # Event types cho class-level violations (vi phạm nề nếp/quy định)
    class_violation_types = [
        {
            'name': 'Cúp tiết',
            'description': 'Lớp cúp tiết học',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -20
        },
        {
            'name': 'Không tập trung vào lớp',
            'description': 'Lớp không tập trung vào bài học',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -10
        },
        {
            'name': 'Lập biên bản',
            'description': 'Học sinh vi phạm bị lập biên bản',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -10
        },
        {
            'name': 'Mất trật tự lớp',
            'description': 'Lớp ồn ào, mất trật tự',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -8
        },
        {
            'name': 'Nói tục chửi thề',
            'description': 'Học sinh nói tục, chửi thề',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -6
        },
        {
            'name': 'Nghỉ không phép',
            'description': 'Học sinh nghỉ học không phép',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -5
        },
        {
            'name': 'Đi trễ',
            'description': 'Học sinh đi học muộn',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -4
        },
        {
            'name': 'Không tham gia phong trào trường',
            'description': 'Không tham gia phong trào theo kế hoạch trường',
            'category': 'school_rules',
            'allowed_roles': 'both',
            'default_points': -30
        },
        {
            'name': 'Đánh nhau',
            'description': 'Học sinh đánh nhau',
            'category': 'school_rules',
            'allowed_roles': 'both',
            'default_points': -20
        },
        {
            'name': 'Sử dụng điện thoại trong giờ',
            'description': 'Sử dụng điện thoại trong giờ học (chưa được phép)',
            'category': 'school_rules',
            'allowed_roles': 'both',
            'default_points': -10
        },
        {
            'name': 'Tập trung trễ',
            'description': 'Tập trung trễ (chào cờ, lễ, ngoại khóa)',
            'category': 'school_rules',
            'allowed_roles': 'both',
            'default_points': -10
        },
        {
            'name': 'Vi phạm của công',
            'description': 'Vi phạm của công (quạt, đèn, khoá cửa, bẻ cây...)',
            'category': 'school_rules',
            'allowed_roles': 'both',
            'default_points': -5
        },
        {
            'name': 'Ăn vụn mang nước phẩm màu',
            'description': 'Ăn vụn/mang ly đá/nước phẩm màu vào lớp',
            'category': 'school_rules',
            'allowed_roles': 'both',
            'default_points': -5
        },
        {
            'name': 'Tự ý ra ngoài trường',
            'description': 'Tự ý ra ngoài trường không xin phép',
            'category': 'school_rules',
            'allowed_roles': 'both',
            'default_points': -5
        },
        {
            'name': 'Không vệ sinh lớp',
            'description': 'Không vệ sinh lớp học',
            'category': 'hygiene',
            'allowed_roles': 'both',
            'default_points': -5
        },
        {
            'name': 'Không đổ rác vệ sinh chậm',
            'description': 'Không đổ rác / vệ sinh chậm, trễ, hành lang dơ',
            'category': 'hygiene',
            'allowed_roles': 'both',
            'default_points': -5
        },
    ]
    
    # Event types cho student-specific violations (vi phạm tác phong)
    student_violation_types = [
        {
            'name': 'Áo quần không đúng quy định',
            'description': 'Áo/quần không đúng quy định',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -6
        },
        {
            'name': 'Không mang giày dép có quai hậu',
            'description': 'Không mang giày/dép có quai hậu',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -6
        },
        {
            'name': 'Tóc dài nhuộm màu',
            'description': 'Tóc dài (nam), nhuộm màu',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -6
        },
        {
            'name': 'Không bảng tên',
            'description': 'Không bảng tên',
            'category': 'discipline',
            'allowed_roles': 'both',
            'default_points': -6
        },
    ]
    
    # Tạo tất cả event types
    all_event_types = (
        lesson_rating_types + 
        point_column_types + 
        class_violation_types + 
        student_violation_types
    )
    
    print(f"\nTạo {len(all_event_types)} loại sự kiện...")
    
    for event_data in all_event_types:
        event_type = EventType.objects.create(**event_data)
        print(f"✓ {event_type.name} ({event_type.get_category_display()}) - {event_type.default_points} điểm")
    
    print(f"\n✅ Đã tạo thành công {EventType.objects.count()} loại sự kiện!")
    print("\n📊 Thống kê:")
    print(f"- Đánh giá tiết học: {EventType.objects.filter(name__startswith='Tiết').count()}")
    print(f"- Cột điểm: {EventType.objects.filter(name__startswith='Điểm').count()}")
    print(f"- Vi phạm nề nếp: {EventType.objects.filter(category='discipline').count()}")
    print(f"- Vi phạm quy định: {EventType.objects.filter(category='school_rules').count()}")
    print(f"- Vi phạm vệ sinh: {EventType.objects.filter(category='hygiene').count()}")
    print(f"- Học tập: {EventType.objects.filter(category='academic').count()}")
    print(f"- Hành vi: {EventType.objects.filter(category='behavior').count()}")

if __name__ == '__main__':
    create_event_types_from_frontend()

