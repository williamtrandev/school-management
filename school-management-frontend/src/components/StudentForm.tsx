import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, User, Users, ArrowLeft, Save, Plus } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Student, Classroom } from '@/services/api';

interface StudentFormData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  student_code: string;
  classroom_id: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  address: string;
  parent_phone: string;
}

export default function StudentForm() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    student_code: '',
    classroom_id: '',
    date_of_birth: '',
    gender: 'male',
    address: '',
    parent_phone: ''
  });

  const isEditMode = !!studentId;

  useEffect(() => {
    loadClassrooms();
    if (isEditMode) {
      loadStudent();
    }
  }, [studentId]);

  const loadClassrooms = async () => {
    try {
      const data = await apiService.getClassrooms();
      setClassrooms(data);
    } catch (error) {
      console.error('Error loading classrooms:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lớp học',
        variant: 'destructive',
      });
    }
  };

  const loadStudent = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      const data = await apiService.getStudent(studentId);
      setStudent(data);
      
      // Populate form data
      setFormData({
        username: data.user.username || '',
        email: data.user.email || '',
        password: '', // Don't populate password
        first_name: data.user.first_name || '',
        last_name: data.user.last_name || '',
        student_code: data.student_code || '',
        classroom_id: data.classroom?.id || '',
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
        gender: data.gender || 'male',
        address: data.address || '',
        parent_phone: data.parent_phone || ''
      });
    } catch (error) {
      console.error('Error loading student:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin học sinh',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof StudentFormData)[] = [
      'username', 'email', 'password', 'first_name', 'last_name', 
      'student_code', 'classroom_id', 'date_of_birth', 'gender'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast({
          title: 'Lỗi',
          description: `Vui lòng điền ${field === 'first_name' ? 'họ' : field === 'last_name' ? 'tên' : field === 'student_code' ? 'mã học sinh' : field === 'classroom_id' ? 'lớp học' : field === 'date_of_birth' ? 'ngày sinh' : field === 'gender' ? 'giới tính' : field}`,
          variant: 'destructive',
        });
        return false;
      }
    }

    if (!isEditMode && formData.password.length < 6) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu phải có ít nhất 6 ký tự',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      if (isEditMode) {
        await apiService.updateStudent(studentId!, formData);
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật thông tin học sinh',
        });
      } else {
        await apiService.createStudent(formData);
        toast({
          title: 'Thành công',
          description: 'Đã tạo học sinh mới',
        });
      }
      
      navigate('/students');
    } catch (error: any) {
      console.error('Error saving student:', error);
      
      let errorMessage = 'Không thể lưu thông tin học sinh';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        const details = error.response.data.details;
        const fieldErrors = Object.keys(details).map(field => details[field].join(', ')).join('; ');
        errorMessage = `Lỗi: ${fieldErrors}`;
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin học sinh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/students')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {isEditMode ? 'Chỉnh Sửa Học Sinh' : 'Thêm Học Sinh Mới'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode ? 'Cập nhật thông tin học sinh' : 'Tạo học sinh mới trong hệ thống'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thông tin cơ bản */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Thông Tin Cơ Bản
              </CardTitle>
              <CardDescription>
                Thông tin cá nhân và tài khoản đăng nhập
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Họ *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Nhập họ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Tên *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Nhập tên"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    required
                    disabled={isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Nhập email"
                    required
                  />
                </div>
              </div>

              {!isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student_code">Mã học sinh *</Label>
                  <Input
                    id="student_code"
                    value={formData.student_code}
                    onChange={(e) => handleInputChange('student_code', e.target.value)}
                    placeholder="Nhập mã học sinh"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính *</Label>
                  <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Ngày sinh *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Thông tin bổ sung */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Thông Tin Bổ Sung
              </CardTitle>
              <CardDescription>
                Thông tin lớp học và liên lạc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classroom_id">Lớp học *</Label>
                <Select value={formData.classroom_id} onValueChange={(value) => handleInputChange('classroom_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_phone">Số điện thoại phụ huynh</Label>
                <Input
                  id="parent_phone"
                  value={formData.parent_phone}
                  onChange={(e) => handleInputChange('parent_phone', e.target.value)}
                  placeholder="Nhập số điện thoại phụ huynh"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/students')}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </>
            ) : (
              <>
                {isEditMode ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo học sinh
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 