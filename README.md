# 🏫 Hệ thống Quản lý Thi đua Học đường

Hệ thống quản lý thi đua nề nếp cho trường học với giao diện React TypeScript và backend Django REST API.

## 🚀 Tính năng chính

### 👥 Quản lý người dùng
- **Admin**: Quản lý toàn bộ hệ thống, lớp học, học sinh, giáo viên
- **Giáo viên**: Nhập điểm thi đua, xem báo cáo lớp mình
- **Học sinh**: Xem bảng xếp hạng và điểm của lớp

### 📊 Quản lý thi đua
- Ghi nhận sự kiện thi đua (học tập, chuyên cần, nề nếp, vệ sinh)
- Tính điểm tự động theo tuần
- Bảng xếp hạng lớp theo tuần
- Duyệt báo cáo thi đua

### 📈 Báo cáo và thống kê
- Dashboard tổng quan
- Bảng xếp hạng chi tiết
- Biểu đồ tiến độ
- Xuất báo cáo

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** với TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Validation
- **Lucide React** - Icons

### Backend
- **Django 5.2** với Python
- **Django REST Framework** - API
- **Django Simple JWT** - Authentication
- **MySQL** - Database
- **CORS** - Cross-origin requests

## 📦 Cài đặt và chạy

### Backend (Django)

1. **Cài đặt dependencies:**
```bash
cd school-management-backend
pip install -r requirements.txt
```

2. **Cấu hình database:**
```bash
# Tạo file .env từ env_template.txt
cp env_template.txt .env
# Chỉnh sửa thông tin database trong .env
```

3. **Chạy migrations:**
```bash
python manage.py migrate
```

4. **Tạo superuser:**
```bash
python manage.py createsuperuser
```

5. **Chạy server:**
```bash
python manage.py runserver
```

### Frontend (React)

1. **Cài đặt dependencies:**
```bash
cd school-management-frontend
npm install
```

2. **Cấu hình API URL:**
Tạo file `.env` trong thư mục `school-management-frontend`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

3. **Chạy development server:**
```bash
npm run dev
```

## 🔐 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Đăng xuất
- `POST /api/v1/auth/change_password` - Đổi mật khẩu

### Users
- `GET /api/v1/users` - Danh sách users (Admin)
- `GET /api/v1/users/profile` - Thông tin profile
- `PUT /api/v1/users/update_profile` - Cập nhật profile

### Events
- `GET /api/v1/events` - Danh sách sự kiện
- `POST /api/v1/events/create` - Tạo sự kiện
- `GET /api/v1/events/{id}` - Chi tiết sự kiện
- `PUT /api/v1/events/{id}/update` - Cập nhật sự kiện
- `DELETE /api/v1/events/{id}/delete` - Xóa sự kiện
- `POST /api/v1/events/bulk_create` - Tạo nhiều sự kiện

### Event Types
- `GET /api/v1/events/event-types` - Danh sách loại sự kiện
- `POST /api/v1/events/event-types/create` - Tạo loại sự kiện
- `GET /api/v1/events/event-types/{id}` - Chi tiết loại sự kiện
- `PUT /api/v1/events/event-types/{id}/update` - Cập nhật loại sự kiện
- `DELETE /api/v1/events/event-types/{id}/delete` - Xóa loại sự kiện

### Classrooms
- `GET /api/v1/classrooms` - Danh sách lớp
- `POST /api/v1/classrooms/create` - Tạo lớp
- `GET /api/v1/classrooms/{id}` - Chi tiết lớp
- `PUT /api/v1/classrooms/{id}/update` - Cập nhật lớp
- `DELETE /api/v1/classrooms/{id}/delete` - Xóa lớp

### Students
- `GET /api/v1/students` - Danh sách học sinh
- `POST /api/v1/students/create` - Tạo học sinh
- `GET /api/v1/students/{id}` - Chi tiết học sinh
- `PUT /api/v1/students/{id}/update` - Cập nhật học sinh
- `DELETE /api/v1/students/{id}/delete` - Xóa học sinh

### Week Summaries
- `GET /api/v1/week-summaries` - Danh sách tổng hợp tuần
- `GET /api/v1/week-summaries/{id}` - Chi tiết tổng hợp tuần
- `POST /api/v1/week-summaries/{id}/approve` - Duyệt tổng hợp tuần

### Dashboard
- `GET /api/v1/dashboard/stats` - Thống kê tổng quan
- `GET /api/v1/dashboard/rankings` - Bảng xếp hạng

## 🎯 Cách sử dụng

### 1. Đăng nhập
- Truy cập `http://localhost:3000/login`
- Đăng nhập với tài khoản admin/teacher/student

### 2. Quản lý sự kiện thi đua
- Vào menu "Sự kiện thi đua"
- Tạo sự kiện mới với các thông tin:
  - Loại sự kiện (học tập, chuyên cần, nề nếp, vệ sinh)
  - Lớp học
  - Học sinh (tùy chọn)
  - Ngày và tiết học
  - Điểm (+ hoặc -)
  - Mô tả

### 3. Xem bảng xếp hạng
- Vào menu "Bảng xếp hạng"
- Chọn tuần và năm để xem
- Duyệt báo cáo tuần (Admin/GVCN)

### 4. Quản lý danh mục
- **Lớp học**: Thêm/sửa/xóa lớp, phân công GVCN
- **Học sinh**: Quản lý thông tin học sinh
- **Giáo viên**: Quản lý tài khoản giáo viên

## 🔧 Cấu hình

### Environment Variables

**Backend (.env):**
```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=school_management
DB_USER=root
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=3306
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 📁 Cấu trúc project

```
school-management-project/
├── school-management-backend/  # Backend Django
│   ├── applications/          # Django apps
│   │   ├── user_management/   # Quản lý user
│   │   ├── event/            # Sự kiện thi đua
│   │   ├── classroom/        # Lớp học
│   │   ├── student/          # Học sinh
│   │   ├── teacher/          # Giáo viên
│   │   ├── week_summary/     # Tổng hợp tuần
│   │   └── ...
│   ├── school_management/    # Django settings
│   └── requirements.txt
└── school-management-frontend/ # Frontend React
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── contexts/        # React contexts
    │   └── ...
    └── package.json
```

## 🚀 Quick Start

### Chạy cả Frontend và Backend

1. **Chạy Backend:**
```bash
cd school-management-backend
python manage.py runserver
```

2. **Chạy Frontend (terminal mới):**
```bash
cd school-management-frontend
npm run dev
```

3. **Truy cập ứng dụng:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- Email: your-email@example.com
- Project Link: [https://github.com/your-username/school-management-project](https://github.com/your-username/school-management-project)
