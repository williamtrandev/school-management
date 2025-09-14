import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, Classroom, Grade, User } from '@/services/api';

export default function ClassroomForm() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade_id: '',
    homeroom_teacher_id: '',
    is_special: false
  });
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { toast } = useToast();
  const isEditing = !!classroomId;

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch classroom data if in edit mode
  useEffect(() => {
    if (classroomId && classroomId !== 'create') {
      const fetchClassroom = async () => {
        try {
          const classroomData = await apiService.getClassroom(classroomId);
          setClassroom(classroomData);
          setFormData({
            name: classroomData.name,
            grade_id: classroomData.grade.id,
            homeroom_teacher_id: classroomData.homeroom_teacher?.id || '',
            is_special: classroomData.is_special
          });
        } catch (error) {
          console.error('Error fetching classroom:', error);
          toast({
            title: 'Lỗi',
            description: 'Không thể tải thông tin lớp học',
            variant: 'destructive',
          });
          navigate('/classes');
        }
      };
      fetchClassroom();
    }
  }, [classroomId, navigate, toast]);

  const loadInitialData = async () => {
    try {
      const [gradesData, teachersData] = await Promise.all([
        apiService.getGrades(),
        apiService.getTeachers()
      ]);
      setGrades(gradesData);
      setTeachers(teachersData);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade_id) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      let result: Classroom;

      if (isEditing && classroom) {
        result = await apiService.updateClassroom(classroom.id, {
          name: formData.name,
          grade_id: formData.grade_id,
          homeroom_teacher_id: formData.homeroom_teacher_id === 'none' ? undefined : formData.homeroom_teacher_id || undefined,
          is_special: formData.is_special
        });
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật lớp học'
        });
      } else {
        result = await apiService.createClassroom({
          name: formData.name,
          grade_id: formData.grade_id,
          homeroom_teacher_id: formData.homeroom_teacher_id === 'none' ? undefined : formData.homeroom_teacher_id || undefined,
          is_special: formData.is_special
        });
        toast({
          title: 'Thành công',
          description: 'Đã tạo lớp học mới'
        });
      }
      
      navigate('/classes');
    } catch (error: any) {
      console.error('Error saving classroom:', error);
      toast({
        title: 'Lỗi',
        description: error.response?.data?.error || 'Không thể lưu lớp học',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/classes');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Đang tải...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {isEditing ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên lớp *</Label>
              <Input
                id="name"
                placeholder="Ví dụ: A1, B2, C3"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Khối lớp *</Label>
              <Select
                value={formData.grade_id}
                onValueChange={(value) => handleInputChange('grade_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khối lớp" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      Khối {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeroom_teacher">Giáo viên chủ nhiệm</Label>
            <Select
              value={formData.homeroom_teacher_id}
              onValueChange={(value) => handleInputChange('homeroom_teacher_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giáo viên chủ nhiệm (tùy chọn)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không phân công</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_special"
              checked={formData.is_special}
              onCheckedChange={(checked) => handleInputChange('is_special', checked)}
            />
            <Label htmlFor="is_special">Lớp đặc biệt</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Cập nhật' : 'Tạo lớp học'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 