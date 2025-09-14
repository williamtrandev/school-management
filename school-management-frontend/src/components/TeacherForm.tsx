import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, GraduationCap, BookOpen, Save, X, Plus } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Teacher } from '@/services/api';

interface TeacherFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TeacherForm({ onSuccess, onCancel }: TeacherFormProps) {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    teacher_code: '',
    subject: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const isEditMode = !!teacherId;

  // Fetch teacher data if in edit mode
  useEffect(() => {
    if (teacherId && teacherId !== 'create') {
      const fetchTeacher = async () => {
        try {
          setInitialLoading(true);
          const teacherData = await apiService.getTeacher(teacherId);
          setTeacher(teacherData);
          setFormData({
            username: teacherData.user.username,
            email: teacherData.user.email,
            password: '', // Không hiển thị password khi edit
            first_name: teacherData.user.first_name,
            last_name: teacherData.user.last_name,
            teacher_code: teacherData.teacher_code,
            subject: teacherData.subject || ''
          });
        } catch (error) {
          console.error('Error fetching teacher:', error);
          toast({
            title: 'Lỗi',
            description: 'Không thể tải thông tin giáo viên',
            variant: 'destructive',
          });
          navigate('/teachers');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchTeacher();
    }
  }, [teacherId, navigate, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Họ là bắt buộc';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Tên là bắt buộc';
    }

    if (!formData.teacher_code.trim()) {
      newErrors.teacher_code = 'Mã giáo viên là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && teacher) {
        await apiService.updateTeacher(teacher.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          teacher_code: formData.teacher_code,
          subject: formData.subject
        });
        toast({
          title: 'Thành công',
          description: 'Cập nhật giáo viên thành công',
        });
      } else {
        await apiService.createTeacher({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          teacher_code: formData.teacher_code,
          subject: formData.subject
        });
        toast({
          title: 'Thành công',
          description: 'Tạo giáo viên mới thành công',
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/teachers');
      }
    } catch (error: any) {
      console.error('Error saving teacher:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast({
          title: 'Lỗi',
          description: error.response?.data?.message || 'Có lỗi xảy ra khi lưu giáo viên',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/teachers');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Đang tải thông tin giáo viên...</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <User className="h-5 w-5" />
              Chỉnh Sửa Giáo Viên
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Thêm Giáo Viên Mới
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isEditMode 
            ? 'Cập nhật thông tin giáo viên'
            : 'Thêm giáo viên mới vào hệ thống'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông Tin Cá Nhân
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  Họ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Nhập họ"
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Nhập tên"
                  className={errors.last_name ? 'border-red-500' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin đăng nhập */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Thông Tin Đăng Nhập
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  disabled={isEditMode}
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
                {isEditMode && (
                  <p className="text-sm text-muted-foreground">
                    Không thể thay đổi tên đăng nhập
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Nhập email"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
            
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Mật khẩu phải có ít nhất 6 ký tự
                </p>
              </div>
            )}
          </div>

          {/* Thông tin chuyên môn */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Thông Tin Chuyên Môn
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher_code">
                  Mã giáo viên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="teacher_code"
                  value={formData.teacher_code}
                  onChange={(e) => handleInputChange('teacher_code', e.target.value)}
                  placeholder="Nhập mã giáo viên"
                  className={errors.teacher_code ? 'border-red-500' : ''}
                />
                {errors.teacher_code && (
                  <p className="text-sm text-red-500">{errors.teacher_code}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Môn dạy</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Nhập môn dạy"
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && (
                  <p className="text-sm text-red-500">{errors.subject}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 