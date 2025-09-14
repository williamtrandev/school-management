import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import apiService, { EventCreateRequest, EventType, Classroom, Student } from '../services/api';

interface EventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<EventCreateRequest>;
}

const EventForm: React.FC<EventFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState<EventCreateRequest>({
    event_type_id: '',
    classroom_id: '',
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    period: undefined,
    points: 0,
    description: '',
    ...initialData
  });

  // Options data
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Load options data
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [types, classes] = await Promise.all([
          apiService.getEventTypes(),
          apiService.getClassrooms()
        ]);
        setEventTypes(types);
        setClassrooms(classes);
      } catch (error) {
        console.error('Error loading options:', error);
        toast.error('Không thể tải dữ liệu');
      }
    };

    loadOptions();
  }, []);

  // Load students when classroom changes
  useEffect(() => {
    if (formData.classroom_id) {
      const loadStudents = async () => {
        try {
          const students = await apiService.getStudents({ classroom_id: formData.classroom_id });
          setStudents(students);
        } catch (error) {
          console.error('Error loading students:', error);
        }
      };
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [formData.classroom_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiService.createEvent(formData);
      toast.success('Tạo sự kiện thành công!');
      onSuccess?.();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Tạo sự kiện thất bại');
      toast.error('Tạo sự kiện thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {initialData ? 'Cập nhật sự kiện' : 'Tạo sự kiện mới'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_type">Loại sự kiện *</Label>
              <Select
                value={formData.event_type_id}
                onValueChange={(value) => handleInputChange('event_type_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại sự kiện" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classroom">Lớp học *</Label>
              <Select
                value={formData.classroom_id}
                onValueChange={(value) => handleInputChange('classroom_id', value)}
              >
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Tiết học</Label>
              <Select
                value={formData.period?.toString() || ''}
                onValueChange={(value) => handleInputChange('period', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tiết học" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((period) => (
                    <SelectItem key={period} value={period.toString()}>
                      Tiết {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student">Học sinh (tùy chọn)</Label>
            <Select
              value={formData.student_id || ''}
              onValueChange={(value) => handleInputChange('student_id', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn học sinh (để trống nếu là sự kiện của cả lớp)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Cả lớp</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.student_code} - {student.user.full_name || `${student.user.first_name} ${student.user.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Điểm *</Label>
            <Input
              id="points"
              type="number"
              placeholder="Nhập điểm (+ hoặc -)"
              value={formData.points}
              onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
              required
            />
            <p className="text-sm text-gray-500">
              Điểm dương (+) cho hành vi tốt, điểm âm (-) cho vi phạm
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết sự kiện..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {initialData ? 'Cập nhật' : 'Tạo sự kiện'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventForm; 