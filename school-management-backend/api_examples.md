# API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Tất cả API (trừ login/register) yêu cầu JWT token trong header:
```
Authorization: Bearer <access_token>
```

---

## 1. Authentication APIs

### 1. Đăng nhập
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin",
    "phone": "0123456789",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Đăng ký
```http
POST /auth/register
Content-Type: application/json

{
  "username": "teacher1",
  "email": "teacher1@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "first_name": "Nguyễn",
  "last_name": "Văn A",
  "role": "teacher",
  "phone": "0123456789"
}
```

### 3. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 4. Đổi mật khẩu
```http
POST /auth/change_password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "old_password": "oldpassword",
  "new_password": "newpassword123",
  "confirm_new_password": "newpassword123"
}
```

---

## 2. Classroom APIs

### 1. Lấy danh sách lớp học
```http
GET /classrooms
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `grade`: Filter theo khối lớp (UUID)
- `is_special`: Filter lớp đặc biệt (true/false)
- `homeroom_teacher`: Filter theo giáo viên chủ nhiệm (UUID)
- `search`: Tìm kiếm theo tên lớp hoặc khối
- `ordering`: Sắp xếp (name, created_at, grade__name)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "A1",
    "grade": {
      "id": "uuid",
      "name": "10",
      "description": "Khối 10"
    },
    "homeroom_teacher": {
      "id": "uuid",
      "username": "teacher1",
      "first_name": "Nguyễn",
      "last_name": "Văn A",
      "email": "teacher1@example.com"
    },
    "is_special": false,
    "full_name": "10A1",
    "student_count": 35,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### 2. Lấy chi tiết lớp học
```http
GET /classrooms/{id}
Authorization: Bearer <access_token>
```

### 3. Tạo lớp học mới
```http
POST /classrooms/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "A1",
  "grade_id": "uuid",
  "homeroom_teacher_id": "uuid",
  "is_special": false
}
```

### 4. Cập nhật lớp học
```http
PATCH /classrooms/{id}/update
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "A2",
  "grade_id": "uuid",
  "homeroom_teacher_id": "uuid",
  "is_special": true
}
```

### 5. Xóa lớp học
```http
DELETE /classrooms/{id}/delete
Authorization: Bearer <access_token>
```

### 6. Lấy danh sách khối lớp
```http
GET /classrooms/grades
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "10",
    "description": "Khối 10"
  },
  {
    "id": "uuid",
    "name": "11",
    "description": "Khối 11"
  }
]
```

### 7. Lấy danh sách giáo viên
```http
GET /classrooms/teachers
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "teacher1",
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "email": "teacher1@example.com"
  }
]
```

### 8. Thống kê lớp học
```http
GET /classrooms/stats
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_classrooms": 24,
  "special_classrooms": 6,
  "regular_classrooms": 18,
  "classrooms_with_teacher": 20,
  "classrooms_without_teacher": 4
}
```

---

## 3. Event APIs

### 1. Lấy danh sách sự kiện
```http
GET /events
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `classroom_id`: Filter theo lớp học
- `event_type_id`: Filter theo loại sự kiện
- `student_id`: Filter theo học sinh
- `date`: Filter theo ngày
- `start_date`: Filter từ ngày
- `end_date`: Filter đến ngày

### 2. Tạo sự kiện mới
```http
POST /events/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "event_type_id": "uuid",
  "classroom_id": "uuid",
  "student_id": "uuid",
  "date": "2024-01-15",
  "period": 1,
  "points": 10,
  "description": "Học sinh tích cực phát biểu"
}
```

### 3. Cập nhật sự kiện
```http
PUT /events/{id}/update
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "points": 15,
  "description": "Học sinh tích cực phát biểu và giúp đỡ bạn"
}
```

### 4. Xóa sự kiện
```http
DELETE /events/{id}/delete
Authorization: Bearer <access_token>
```

### 5. Tạo nhiều sự kiện
```http
POST /events/bulk_create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "events": [
    {
      "event_type_id": "uuid",
      "classroom_id": "uuid",
      "student_id": "uuid",
      "date": "2024-01-15",
      "period": 1,
      "points": 10,
      "description": "Học sinh tích cực phát biểu"
    }
  ]
}
```

---

## 4. Event Type APIs

### 1. Lấy danh sách loại sự kiện
```http
GET /events/event-types
Authorization: Bearer <access_token>
```

### 2. Tạo loại sự kiện mới
```http
POST /events/event-types/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Tích cực phát biểu",
  "description": "Học sinh tích cực tham gia phát biểu xây dựng bài",
  "is_active": true
}
```

### 3. Cập nhật loại sự kiện
```http
PUT /events/event-types/{id}/update
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Tích cực phát biểu xây dựng bài",
  "description": "Học sinh tích cực tham gia phát biểu xây dựng bài học"
}
```

### 4. Xóa loại sự kiện
```http
DELETE /events/event-types/{id}/delete
Authorization: Bearer <access_token>
```

---

## 5. Week Summary APIs

### 1. Lấy danh sách tổng kết tuần
```http
GET /week-summaries
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `classroom_id`: Filter theo lớp học
- `week_number`: Filter theo tuần
- `year`: Filter theo năm
- `is_approved`: Filter theo trạng thái duyệt

### 2. Lấy chi tiết tổng kết tuần
```http
GET /week-summaries/{id}
Authorization: Bearer <access_token>
```

### 3. Duyệt tổng kết tuần
```http
POST /week-summaries/{id}/approve
Authorization: Bearer <access_token>
```

---

## 6. Student APIs

### 1. Lấy danh sách học sinh
```http
GET /students
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `classroom_id`: Filter theo lớp học
- `search`: Tìm kiếm theo tên, mã học sinh, email
- `gender`: Filter theo giới tính (male/female)
- `ordering`: Sắp xếp (user__first_name, student_code, created_at)

**Response:**
```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "full_name": "Nguyễn Văn A",
      "email": "student1@example.com"
    },
    "student_code": "HS001",
    "classroom": {
      "id": "uuid",
      "full_name": "12A1"
    },
    "gender": "male",
    "date_of_birth": "2006-01-01",
    "parent_phone": "0123456789",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### 2. Lấy chi tiết học sinh
```http
GET /students/{id}
Authorization: Bearer <access_token>
```

### 3. Tạo học sinh mới
```http
POST /students/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "student1",
  "email": "student1@example.com",
  "password": "password123",
  "first_name": "Nguyễn",
  "last_name": "Văn A",
  "student_code": "HS001",
  "classroom_id": "uuid",
  "date_of_birth": "2006-01-01",
  "gender": "male",
  "address": "123 Đường ABC",
  "parent_phone": "0123456789"
}
```

### 4. Import học sinh từ Excel
```http
POST /students/import
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: [Excel file]
```

**Excel Template Columns:**
- `student_code`: Mã học sinh (bắt buộc)
- `username`: Tên đăng nhập (bắt buộc)
- `email`: Email (bắt buộc)
- `password`: Mật khẩu (bắt buộc)
- `first_name`: Họ (bắt buộc)
- `last_name`: Tên (bắt buộc)
- `classroom_name`: Tên lớp (định dạng: 12A1, 11B2, 10A1 - bắt buộc)
- `date_of_birth`: Ngày sinh (YYYY-MM-DD)
- `gender`: Giới tính (male/female)
- `address`: Địa chỉ
- `parent_phone`: Số điện thoại phụ huynh

**Response:**
```json
{
  "success_count": 5,
  "error_count": 2,
  "errors": [
    {
      "row": 3,
      "error": "Mã học sinh \"HS001\" đã tồn tại"
    },
    {
      "row": 7,
      "error": "Lớp \"A5\" không tồn tại"
    }
  ],
  "message": "Import thành công 5 học sinh, 2 lỗi"
}
```

### 5. Tải template Excel
```http
GET /students/import/template
Authorization: Bearer <access_token>
```

**Response:** File Excel template

### 6. Thống kê học sinh
```http
GET /students/stats
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_students": 500,
  "male_students": 250,
  "female_students": 250,
  "classroom_stats": [
    {
      "classroom_name": "12A1",
      "student_count": 35
    },
    {
      "classroom_name": "12A2",
      "student_count": 34
    }
  ]
}
```

---

## 7. Teacher APIs

### 1. Lấy danh sách giáo viên
```http
GET /teachers
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `search`: Tìm kiếm theo tên, mã giáo viên, email, môn dạy
- `subject`: Filter theo môn dạy
- `ordering`: Sắp xếp (user__first_name, teacher_code, created_at)

**Response:**
```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "full_name": "Nguyễn Văn A",
      "email": "teacher1@example.com"
    },
    "teacher_code": "GV001",
    "subject": "Toán",
    "homeroom_class_count": 2,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### 2. Lấy chi tiết giáo viên
```http
GET /teachers/{id}
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "username": "teacher1",
    "email": "teacher1@example.com",
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "full_name": "Nguyễn Văn A"
  },
  "teacher_code": "GV001",
  "subject": "Toán",
  "homeroom_classes": [
    {
      "id": "uuid",
      "name": "A1",
      "full_name": "12A1",
      "grade": {
        "id": "uuid",
        "name": "12"
      }
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3. Tạo giáo viên mới
```http
POST /teachers/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "teacher1",
  "email": "teacher1@example.com",
  "password": "password123",
  "first_name": "Nguyễn",
  "last_name": "Văn A",
  "teacher_code": "GV001",
  "subject": "Toán"
}
```

### 4. Cập nhật giáo viên
```http
PATCH /teachers/{id}/update
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Nguyễn",
  "last_name": "Văn B",
  "email": "teacher1@example.com",
  "teacher_code": "GV001",
  "subject": "Toán"
}
```

### 5. Xóa giáo viên
```http
DELETE /teachers/{id}/delete
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Đã xóa giáo viên thành công"
}
```

### 6. Thống kê giáo viên
```http
GET /teachers/stats
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_teachers": 50,
  "teachers_with_classes": 30,
  "teachers_without_classes": 20,
  "subject_stats": [
    {
      "subject": "Toán",
      "count": 8
    },
    {
      "subject": "Văn",
      "count": 6
    }
  ]
}
```

### 7. Import giáo viên từ Excel
```http
POST /teachers/import
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <excel_file>
```

**Request Body:**
- `file`: File Excel (.xlsx hoặc .xls) chứa danh sách giáo viên

**Excel Columns:**
- `username` (bắt buộc): Tên đăng nhập (duy nhất)
- `email` (bắt buộc): Email (duy nhất)
- `password` (bắt buộc): Mật khẩu (tối thiểu 6 ký tự)
- `first_name` (bắt buộc): Tên
- `last_name` (bắt buộc): Họ
- `teacher_code` (bắt buộc): Mã giáo viên (duy nhất)
- `subject` (tùy chọn): Môn dạy

**Response:**
```json
{
  "success_count": 5,
  "error_count": 2,
  "success_data": [
    {
      "row": 2,
      "username": "teacher1",
      "teacher_code": "GV001",
      "full_name": "Nguyễn Văn A"
    }
  ],
  "errors": [
    {
      "row": 3,
      "errors": {
        "username": ["Username đã tồn tại"],
        "email": ["Email đã tồn tại"]
      }
    }
  ]
}
```

### 8. Tải template Excel cho import giáo viên
```http
GET /teachers/import/template
Authorization: Bearer <access_token>
```

**Response:**
- File Excel (.xlsx) chứa template với cấu trúc cột chuẩn và dữ liệu mẫu

---

## Behavior Record APIs

### 1. Lấy danh sách vi phạm nề nết
```http
GET /students/behavior
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `classroom_id` (tùy chọn): ID lớp học để lọc
- `status` (tùy chọn): Trạng thái vi phạm (pending/approved/rejected)
- `search` (tùy chọn): Tìm kiếm theo tên học sinh hoặc mô tả
- `ordering` (tùy chọn): Sắp xếp (created_at, -created_at)

**Response:**
```json
[
  {
    "id": "uuid",
    "student": {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "username": "student1",
        "full_name": "Nguyễn Văn A",
        "email": "student1@example.com"
      },
      "student_code": "HS001",
      "classroom": {
        "id": "uuid",
        "full_name": "12A1"
      }
    },
    "violation_type": "Đi muộn",
    "description": "Đi học muộn 15 phút",
    "points_deducted": 2,
    "status": "pending",
    "created_at": "2024-01-01T08:00:00Z",
    "approved_at": null,
    "approved_by": null,
    "rejection_notes": null
  }
]
```

### 2. Lấy chi tiết vi phạm
```http
GET /students/behavior/{id}
Authorization: Bearer <access_token>
```

### 3. Tạo vi phạm nề nết
```http
POST /students/behavior/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "student_id": "uuid",  // Tùy chọn - nếu không có thì tạo vi phạm cho chính mình
  "violation_type": "Đi muộn",
  "description": "Đi học muộn 15 phút",
  "points_deducted": 2
}
```

**Lưu ý:**
- Học sinh chỉ có thể tạo vi phạm cho chính mình hoặc cho học sinh khác trong cùng lớp
- Nếu không có `student_id`, hệ thống sẽ tạo vi phạm cho chính học sinh đang đăng nhập
- Nếu có `student_id`, hệ thống sẽ kiểm tra xem học sinh đó có trong cùng lớp không

**Response:**
```json
{
  "id": "uuid",
  "student": {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "username": "student1",
      "full_name": "Nguyễn Văn A",
      "email": "student1@example.com"
    },
    "student_code": "HS001",
    "classroom": {
      "id": "uuid",
      "full_name": "12A1"
    }
  },
  "violation_type": "Đi muộn",
  "description": "Đi học muộn 15 phút",
  "points_deducted": 2,
  "status": "pending",
  "created_at": "2024-01-01T08:00:00Z",
  "approved_at": null,
  "approved_by": null,
  "rejection_notes": null
}
```

### 4. Cập nhật trạng thái vi phạm (duyệt/từ chối)
```http
PATCH /students/behavior/{id}/update
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "approved",  // approved hoặc rejected
  "rejection_notes": "Lý do từ chối"  // Chỉ cần khi status = rejected
}
```

**Lưu ý:**
- Chỉ giáo viên chủ nhiệm của lớp hoặc admin mới có quyền duyệt/từ chối vi phạm
- Khi duyệt vi phạm, hệ thống sẽ tự động cập nhật `approved_at` và `approved_by`
- Khi từ chối vi phạm, cần cung cấp `rejection_notes`

### 5. Xóa vi phạm
```http
DELETE /students/behavior/{id}/delete
Authorization: Bearer <access_token>
```

**Lưu ý:**
- Chỉ học sinh tạo vi phạm mới có thể xóa
- Chỉ có thể xóa vi phạm có trạng thái "pending"

### 6. Thống kê vi phạm nề nết
```http
GET /students/behavior/stats
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_violations": 150,
  "pending_violations": 25,
  "approved_violations": 100,
  "rejected_violations": 25,
  "total_points_deducted": 450,
  "classroom_stats": [
    {
      "classroom_name": "12A1",
      "count": 30
    },
    {
      "classroom_name": "11B2",
      "count": 25
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Thông tin không hợp lệ",
  "details": {
    "field_name": ["Lỗi cụ thể"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 403 Forbidden
```json
{
  "error": "Không có quyền truy cập"
}
```

### 404 Not Found
```json
{
  "error": "Không tìm thấy dữ liệu"
}
```

### 500 Internal Server Error
```json
{
  "error": "Lỗi server"
}
```

---

## Pagination

Các API trả về danh sách có thể hỗ trợ pagination:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/v1/classrooms?page=2",
  "previous": null,
  "results": [...]
}
```

**Query Parameters:**
- `page`: Trang hiện tại
- `page_size`: Số lượng item mỗi trang (mặc định: 20) 