import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Plus, 
  X, 
  Calendar,
  Users,
  Award,
  Clock,
  TrendingUp,
  TrendingDown,
  BookOpen,
  User,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { EventCreateRequest, EventType, Classroom, Student } from '@/services/api';

interface ModernEventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<EventCreateRequest>;
}

const ModernEventForm: React.FC<ModernEventFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  
  // Form data
  const [formData, setFormData] = useState<EventCreateRequest>({
    event_type: '',
    classroom: '',
    student: '',
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
        toast({
          title: 'Lỗi',
          description: 'Không thể tải dữ liệu',
          variant: 'destructive',
        });
      }
    };

    loadOptions();
  }, []);

  // Load students when classroom changes
  useEffect(() => {
    if (formData.classroom) {
      const loadStudents = async () => {
        try {
          const students = await apiService.getStudents({ classroom_id: formData.classroom });
          setStudents(students);
        } catch (error) {
          console.error('Error loading students:', error);
        }
      };
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [formData.classroom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiService.createEvent(formData);
      toast({
        title: 'Thành công',
        description: 'Tạo sự kiện thành công!',
      });
      onSuccess?.();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Tạo sự kiện thất bại');
      toast({
        title: 'Lỗi',
        description: 'Tạo sự kiện thất bại',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventCreateRequest, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Nếu thay đổi loại sự kiện, cập nhật điểm mặc định
      if (field === 'event_type' && value) {
        const selectedType = eventTypes.find(t => t.id === value || t.id === String(value) || String(t.id) === value);
        if (selectedType) {
          newData.points = selectedType.default_points;
        }
      }
      
      return newData;
    });
  };

  const getPointsColor = (points: number) => {
    if (points > 0) return 'text-emerald-600';
    if (points < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPointsIcon = (points: number) => {
    if (points > 0) return <TrendingUp className="h-4 w-4" />;
    if (points < 0) return <TrendingDown className="h-4 w-4" />;
    return <Award className="h-4 w-4" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {initialData ? 'Cập nhật sự kiện' : 'Tạo sự kiện mới'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {initialData ? 'Chỉnh sửa thông tin sự kiện thi đua' : 'Thêm sự kiện thi đua mới cho học sinh'}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
              </div>
              
              {user?.role === 'teacher' && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4" />
                      <span className="font-medium">Quyền hạn của giáo viên:</span>
                    </div>
                    <ul className="text-sm space-y-1 ml-6">
                      <li>• Tất cả loại sự kiện (nề nếp, vệ sinh, quy định, học tập, hành vi)</li>
                      <li>• Đánh giá tiết học và điểm kiểm tra miệng</li>
                      <li>• Tạo sự kiện cho bất kỳ học sinh nào trong lớp</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="event_type" className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    Loại sự kiện *
                  </Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => handleInputChange('event_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại sự kiện">
                        {formData.event_type && eventTypes.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span>{eventTypes.find(t => t.id === formData.event_type || t.id === String(formData.event_type) || String(t.id) === formData.event_type)?.name || 'Loại sự kiện không xác định'}</span>
                          </div>
                        ) : formData.event_type ? (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span>Đang tải...</span>
                          </div>
                        ) : (
                          'Chọn loại sự kiện'
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-purple-500" />
                            <div className="flex flex-col">
                              <span className="font-medium">{type.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {type.category_display}
                                {type.default_points !== 0 && (
                                  <span className={`ml-1 ${type.default_points > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    ({type.default_points > 0 ? '+' : ''}{type.default_points})
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classroom" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Lớp học *
                  </Label>
                  <Select
                    value={formData.classroom}
                    onValueChange={(value) => handleInputChange('classroom', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lớp học">
                        {formData.classroom && classrooms.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>{classrooms.find(c => c.id === formData.classroom)?.full_name || 'Lớp học không xác định'}</span>
                          </div>
                        ) : formData.classroom ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>Đang tải...</span>
                          </div>
                        ) : (
                          'Chọn lớp học'
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            {classroom.full_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Thời gian</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    Ngày *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Tiết học (tùy chọn)
                  </Label>
                  <Select
                    value={formData.period?.toString() || 'none'}
                    onValueChange={(value) => handleInputChange('period', value === 'none' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tiết học (không bắt buộc)">
                        {formData.period ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span>Tiết {formData.period}</span>
                          </div>
                        ) : (
                          'Chọn tiết học (không bắt buộc)'
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          Không chọn tiết
                        </div>
                      </SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((period) => (
                        <SelectItem key={period} value={period.toString()}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            Tiết {period}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Chỉ chọn nếu sự kiện xảy ra trong giờ học cụ thể
                  </p>
                </div>
              </div>
            </div>

            {/* Student Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold">Đối tượng</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="student" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  Học sinh (tùy chọn)
                </Label>
                <Select
                  value={formData.student || 'all'}
                  onValueChange={(value) => handleInputChange('student', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học sinh (để trống nếu là sự kiện của cả lớp)">
                      {formData.student && students.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-indigo-500" />
                          <span>{students.find(s => s.id === formData.student)?.user.full_name || 'Học sinh không xác định'}</span>
                        </div>
                      ) : formData.student ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-indigo-500" />
                          <span>Đang tải...</span>
                        </div>
                      ) : (
                        'Chọn học sinh (để trống nếu là sự kiện của cả lớp)'
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Cả lớp
                      </div>
                    </SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-indigo-500" />
                          {student.student_code} - {student.user.full_name || `${student.user.first_name} ${student.user.last_name}`}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Points and Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">Điểm số và mô tả</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="points" className="flex items-center gap-2">
                    <div className={`${getPointsColor(formData.points)}`}>
                      {getPointsIcon(formData.points)}
                    </div>
                    Điểm (tự động)
                  </Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    readOnly
                    className="w-full bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Điểm được tự động điền theo loại sự kiện đã chọn
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Xem trước điểm</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Badge className={`${formData.points > 0 ? 'bg-emerald-100 text-emerald-800' : formData.points < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                        {getPointsIcon(formData.points)}
                        {formData.points > 0 ? '+' : ''}{formData.points}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formData.points > 0 ? 'Điểm cộng' : formData.points < 0 ? 'Điểm trừ' : 'Điểm 0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  Mô tả chi tiết (tùy chọn)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về sự kiện thi đua..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Mô tả rõ ràng về hành vi, vi phạm hoặc thành tích của học sinh
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {initialData ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernEventForm;
