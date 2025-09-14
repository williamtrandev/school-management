import axios from 'axios';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data as { access_token: string; refresh_token: string };
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_name: string;
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

// Classroom Types
export interface Classroom {
  id: string;
  name: string;
  grade: Grade;
  homeroom_teacher?: User;
  is_special: boolean;
  created_at: string;
  updated_at: string;
  full_name: string;
  student_count?: number;
}

export interface Grade {
  id: string;
  name: string;
  description?: string;
}

// Student Types
export interface Student {
  id: string;
  user: User;
  student_code: string;
  classroom: Classroom;
  date_of_birth: string;
  gender: 'male' | 'female';
  address?: string;
  parent_phone?: string;
  created_at: string;
  updated_at: string;
}

// Teacher Types
export interface Teacher {
  id: string;
  user: User;
  teacher_code: string;
  subject?: string;
  homeroom_classes?: Array<{
    id: string;
    name: string;
    full_name: string;
    grade: {
      id: string;
      name: string;
    };
  }>;
  homeroom_class_count?: number;
  created_at: string;
  updated_at: string;
}

// Event Types
export interface EventType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  event_type: EventType;
  classroom: Classroom;
  student?: Student;
  date: string;
  period?: number;
  points: number;
  description?: string;
  recorded_by: User;
  created_at: string;
  updated_at: string;
}

export interface EventCreateRequest {
  event_type_id: string;
  classroom_id: string;
  student_id?: string;
  date: string;
  period?: number;
  points: number;
  description?: string;
}

export interface EventBulkCreateRequest {
  events: EventCreateRequest[];
}

// Week Summary Types
export interface WeekSummary {
  id: string;
  classroom: Classroom;
  week_number: number;
  year: number;
  positive_points: number;
  negative_points: number;
  total_points: number;
  rank?: number;
  is_approved: boolean;
  approved_by?: User;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Behavior Record Types
export interface BehaviorRecord {
  id: string;
  student: Student;
  violation_type: string;
  description: string;
  points_deducted: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_notes?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: User;
}

// API Service Class
class ApiService {
  // Authentication APIs
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data as LoginResponse;
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data as LoginResponse;
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data as { access_token: string; refresh_token: string };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    return response.data as { message: string };
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/change_password', data);
    return response.data as { message: string };
  }

  // User APIs
  async getUsers(params?: { role?: string }): Promise<User[]> {
    const response = await apiClient.get('/users', { params });
    return response.data as User[];
  }

  async getUserProfile(): Promise<User> {
    const response = await apiClient.get('/users/profile');
    return response.data as User;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put('/users/update_profile', data);
    return response.data as User;
  }

  // Event Type APIs
  async getEventTypes(): Promise<EventType[]> {
    const response = await apiClient.get('/events/event-types');
    return response.data as EventType[];
  }

  async createEventType(data: Partial<EventType>): Promise<EventType> {
    const response = await apiClient.post('/events/event-types/create', data);
    return response.data as EventType;
  }

  async getEventType(id: string): Promise<EventType> {
    const response = await apiClient.get(`/events/event-types/${id}`);
    return response.data as EventType;
  }

  async updateEventType(id: string, data: Partial<EventType>): Promise<EventType> {
    const response = await apiClient.put(`/events/event-types/${id}/update`, data);
    return response.data as EventType;
  }

  async deleteEventType(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/events/event-types/${id}/delete`);
    return response.data as { message: string };
  }

  // Event APIs
  async getEvents(params?: {
    classroom_id?: string;
    event_type_id?: string;
    student_id?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Event[]> {
    const response = await apiClient.get('/events', { params });
    return response.data as Event[];
  }

  async createEvent(data: EventCreateRequest): Promise<Event> {
    const response = await apiClient.post('/events/create', data);
    return response.data as Event;
  }

  async getEvent(id: string): Promise<Event> {
    const response = await apiClient.get(`/events/${id}`);
    return response.data as Event;
  }

  async updateEvent(id: string, data: Partial<EventCreateRequest>): Promise<Event> {
    const response = await apiClient.put(`/events/${id}/update`, data);
    return response.data as Event;
  }

  async deleteEvent(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/events/${id}/delete`);
    return response.data as { message: string };
  }

  async bulkCreateEvents(data: EventBulkCreateRequest): Promise<{
    message: string;
    created_count: number;
    events: Event[];
  }> {
    const response = await apiClient.post('/events/bulk_create', data);
    return response.data as {
      message: string;
      created_count: number;
      events: Event[];
    };
  }

  // Week Summary APIs (to be implemented in backend)
  async getWeekSummaries(params?: {
    classroom_id?: string;
    week_number?: number;
    year?: number;
    is_approved?: boolean;
  }): Promise<WeekSummary[]> {
    const response = await apiClient.get('/week-summaries', { params });
    return response.data as WeekSummary[];
  }

  async getWeekSummary(id: string): Promise<WeekSummary> {
    const response = await apiClient.get(`/week-summaries/${id}`);
    return response.data as WeekSummary;
  }

  async approveWeekSummary(id: string): Promise<WeekSummary> {
    const response = await apiClient.post(`/week-summaries/${id}/approve`);
    return response.data as WeekSummary;
  }

  // Classroom APIs
  async getClassrooms(params?: { 
    grade?: string; 
    is_special?: boolean; 
    homeroom_teacher?: string;
    search?: string;
    ordering?: string;
  }): Promise<Classroom[]> {
    const response = await apiClient.get('/classrooms', { params });
    return response.data as Classroom[];
  }

  async getClassroom(id: string): Promise<Classroom> {
    const response = await apiClient.get(`/classrooms/${id}`);
    return response.data as Classroom;
  }

  async createClassroom(data: {
    name: string;
    grade_id: string;
    homeroom_teacher_id?: string;
    is_special?: boolean;
  }): Promise<Classroom> {
    const response = await apiClient.post('/classrooms/create', data);
    return response.data as Classroom;
  }

  async updateClassroom(id: string, data: {
    name?: string;
    grade_id?: string;
    homeroom_teacher_id?: string;
    is_special?: boolean;
  }): Promise<Classroom> {
    const response = await apiClient.patch(`/classrooms/${id}/update`, data);
    return response.data as Classroom;
  }

  async deleteClassroom(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/classrooms/${id}/delete`);
    return response.data as { message: string };
  }

  // Additional Classroom APIs
  async getGrades(): Promise<Grade[]> {
    const response = await apiClient.get('/classrooms/grades');
    return response.data as Grade[];
  }

  async getTeachers(): Promise<User[]> {
    const response = await apiClient.get('/classrooms/teachers');
    return response.data as User[];
  }

  async getClassroomStats(): Promise<{
    total_classrooms: number;
    special_classrooms: number;
    regular_classrooms: number;
    classrooms_with_teacher: number;
    classrooms_without_teacher: number;
  }> {
    const response = await apiClient.get('/classrooms/stats');
    return response.data as {
      total_classrooms: number;
      special_classrooms: number;
      regular_classrooms: number;
      classrooms_with_teacher: number;
      classrooms_without_teacher: number;
    };
  }

  // Student APIs
  async getStudents(params?: { 
    classroom_id?: string; 
    search?: string; 
    gender?: string;
    ordering?: string;
  }): Promise<Student[]> {
    const response = await apiClient.get('/students', { params });
    return response.data as Student[];
  }

  async getStudent(id: string): Promise<Student> {
    const response = await apiClient.get(`/students/${id}`);
    return response.data as Student;
  }

  async createStudent(data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    student_code: string;
    classroom_id: string;
    date_of_birth: string;
    gender: 'male' | 'female';
    address?: string;
    parent_phone?: string;
  }): Promise<Student> {
    const response = await apiClient.post('/students/create', data);
    return response.data as Student;
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const response = await apiClient.patch(`/students/${id}/update/`, data);
    return response.data as Student;
  }

  async deleteStudent(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/students/${id}/delete/`);
    return response.data as { message: string };
  }

  // Student Import APIs
  async importStudents(file: File): Promise<{
    success_count: number;
    error_count: number;
    errors?: Array<{ row: number; error: string }>;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as {
      success_count: number;
      error_count: number;
      errors?: Array<{ row: number; error: string }>;
      message: string;
    };
  }

  async downloadStudentTemplate(): Promise<Blob> {
    const response = await apiClient.get('/students/import/template', {
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  async getStudentStats(): Promise<{
    total_students: number;
    male_students: number;
    female_students: number;
    classroom_stats: Array<{ classroom_name: string; student_count: number }>;
  }> {
    const response = await apiClient.get('/students/stats');
    return response.data as {
      total_students: number;
      male_students: number;
      female_students: number;
      classroom_stats: Array<{ classroom_name: string; student_count: number }>;
    };
  }

  // Teacher APIs
  async getTeacherList(params?: { 
    search?: string; 
    subject?: string;
    ordering?: string;
  }): Promise<Teacher[]> {
    const response = await apiClient.get('/teachers', { params });
    return response.data as Teacher[];
  }

  async getTeacher(id: string): Promise<Teacher> {
    const response = await apiClient.get(`/teachers/${id}`);
    return response.data as Teacher;
  }

  async createTeacher(data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    teacher_code: string;
    subject?: string;
  }): Promise<Teacher> {
    const response = await apiClient.post('/teachers/create', data);
    return response.data as Teacher;
  }

  async updateTeacher(id: string, data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    teacher_code?: string;
    subject?: string;
  }): Promise<Teacher> {
    const response = await apiClient.patch(`/teachers/${id}/update`, data);
    return response.data as Teacher;
  }

  async deleteTeacher(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/teachers/${id}/delete`);
    return response.data as { message: string };
  }

  async getTeacherStats(): Promise<{
    total_teachers: number;
    teachers_with_classes: number;
    teachers_without_classes: number;
    subject_stats: Array<{ subject: string; count: number }>;
  }> {
    const response = await apiClient.get('/teachers/stats');
    return response.data as {
      total_teachers: number;
      teachers_with_classes: number;
      teachers_without_classes: number;
      subject_stats: Array<{ subject: string; count: number }>;
    };
  }

  // Teacher Import APIs
  async importTeachers(file: File): Promise<{
    success_count: number;
    error_count: number;
    errors?: Array<{ row: number; errors: any }>;
    success_data?: Array<{ row: number; username: string; teacher_code: string; full_name: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/teachers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as {
      success_count: number;
      error_count: number;
      errors?: Array<{ row: number; errors: any }>;
      success_data?: Array<{ row: number; username: string; teacher_code: string; full_name: string }>;
    };
  }

  async downloadTeacherTemplate(): Promise<Blob> {
    const response = await apiClient.get('/teachers/import/template', {
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  // Dashboard APIs (to be implemented in backend)
  async getDashboardStats(): Promise<{
    total_students: number;
    total_classrooms: number;
    total_teachers: number;
    current_week_rankings: WeekSummary[];
    top_classes: Classroom[];
    recent_events: Event[];
  }> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data as {
      total_students: number;
      total_classrooms: number;
      total_teachers: number;
      current_week_rankings: WeekSummary[];
      top_classes: Classroom[];
      recent_events: Event[];
    };
  }

  async getClassRankings(params?: { week_number?: number; year?: number }): Promise<WeekSummary[]> {
    const response = await apiClient.get('/week-summaries/dashboard/rankings', { params });
    return response.data as WeekSummary[];
  }

  // Behavior Record APIs
  async getBehaviorRecords(params?: { 
    classroom_id?: string; 
    status?: string; 
    search?: string;
    ordering?: string;
  }): Promise<BehaviorRecord[]> {
    const response = await apiClient.get('/students/behavior', { params });
    return response.data as BehaviorRecord[];
  }

  async getBehaviorRecord(id: string): Promise<BehaviorRecord> {
    const response = await apiClient.get(`/students/behavior/${id}`);
    return response.data as BehaviorRecord;
  }

  async createBehaviorRecord(data: {
    student_id?: string; // Thêm student_id để học sinh có thể tạo vi phạm cho người khác
    violation_type: string;
    description: string;
    points_deducted: number;
  }): Promise<BehaviorRecord> {
    const response = await apiClient.post('/students/behavior/create', data);
    return response.data as BehaviorRecord;
  }

  async updateBehaviorRecord(id: string, data: {
    status: 'pending' | 'approved' | 'rejected';
    rejection_notes?: string;
  }): Promise<BehaviorRecord> {
    const response = await apiClient.patch(`/students/behavior/${id}/update`, data);
    return response.data as BehaviorRecord;
  }

  async deleteBehaviorRecord(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/students/behavior/${id}/delete`);
    return response.data as { message: string };
  }

  async getBehaviorRecordStats(): Promise<{
    total_violations: number;
    pending_violations: number;
    approved_violations: number;
    rejected_violations: number;
    total_points_deducted: number;
    classroom_stats: Array<{ classroom_name: string; count: number }>;
  }> {
    const response = await apiClient.get('/students/behavior/stats');
    return response.data as {
      total_violations: number;
      pending_violations: number;
      approved_violations: number;
      rejected_violations: number;
      total_points_deducted: number;
      classroom_stats: Array<{ classroom_name: string; count: number }>;
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 