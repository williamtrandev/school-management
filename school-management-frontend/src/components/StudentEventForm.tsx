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
  Calendar,
  Award,
  Clock,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Save,
  ArrowLeft,
  User,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { EventCreateRequest, EventType, Student } from '@/services/api';

const StudentEventForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [permission, setPermission] = useState<any>(null);
  
  // Form data
  const [formData, setFormData] = useState<EventCreateRequest>({
    event_type: '',
    classroom: '',
    student: '',
    date: new Date().toISOString().split('T')[0],
    period: undefined,
    points: 0,
    description: '',
  });

  // Options data
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  // Load student info and permission
  useEffect(() => {
    const loadStudentInfo = async () => {
      try {
        // Lấy thông tin học sinh
        const students = await apiService.getStudents();
        const currentStudent = students.find(s => s.user.id === user?.id);
        
        if (!currentStudent) {
          setError('Không tìm thấy thông tin học sinh');
          return;
        }
        
        setStudent(currentStudent);
        setFormData(prev => ({
          ...prev,
          classroom: currentStudent.classroom.id,
          student: currentStudent.id
        }));
        
        // Kiểm tra quyền
        const permissionResult = await apiService.checkStudentEventPermission(currentStudent.id);
        if (!permissionResult.has_permission) {
          setError('Bạn không có quyền tạo sự kiện thi đua');
          return;
        }
        
        setPermission(permissionResult.permission);
        
        // Load event types
        const types = await apiService.getEventTypes();
        console.log('Loaded event types:', types);
        console.log('Event types structure:', types.map(t => ({ id: t.id, idType: typeof t.id, name: t.name })));
        setEventTypes(types);
        
      } catch (error) {
        console.error('Error loading student info:', error);
        setError('Không thể tải thông tin học sinh');
        toast({
          title: 'Lỗi',
          description: 'Không thể tải thông tin học sinh',
          variant: 'destructive',
        });
      }
    };

    if (user?.role === 'student') {
      loadStudentInfo();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiService.createEvent(formData);
      toast({
        title: 'Thành công',
        description: 'Tạo sự kiện thi đua thành công!',
      });
      navigate('/events');
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
        console.log('Selected event type ID:', value, 'Type:', typeof value);
        console.log('Available event types:', eventTypes);
        eventTypes.forEach((type, index) => {
          console.log(`Event type ${index}:`, {
            id: type.id,
            idType: typeof type.id,
            name: type.name,
            match1: type.id === value,
            match2: type.id === String(value),
            match3: String(type.id) === value,
            match4: String(type.id) === String(value)
          });
        });
        const selectedType = eventTypes.find(t => t.id === value || t.id === String(value) || String(t.id) === value);
        console.log('Found selected type:', selectedType);
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

  if (user?.role !== 'student') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Chỉ học sinh mới có thể sử dụng form này</p>
        </CardContent>
      </Card>
    );
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-muted-foreground">Đang tải thông tin học sinh...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!permission) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto">
              <Award className="h-12 w-12 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Không có quyền tạo sự kiện
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bạn chưa được cấp quyền tạo sự kiện thi đua. Vui lòng liên hệ giáo viên chủ nhiệm.
              </p>
              <Button variant="outline" onClick={() => navigate('/events')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                Tạo sự kiện thi đua
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tạo sự kiện thi đua nề nếp cho chính mình
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Permission Info */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-green-700">Thông tin quyền</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Học sinh:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {student.student_code} - {student.user.full_name || `${student.user.first_name} ${student.user.last_name}`}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Lớp:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">{student.classroom.full_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Thông tin sự kiện</h3>
              </div>
              
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">Quyền hạn của bạn:</span>
                  </div>
                  <ul className="text-sm space-y-1 ml-6">
                    <li>• Nề nếp tác phong (đi học muộn, đồng phục, khăn quàng...)</li>
                    <li>• Vệ sinh (vệ sinh lớp học, giữ gìn vệ sinh chung...)</li>
                    <li>• Quy định nhà trường (tuân thủ nội quy, tham gia hoạt động...)</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
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

            {/* Date and Points */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Thời gian và điểm số</h3>
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
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Mô tả sự kiện</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  Mô tả chi tiết (tùy chọn)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về sự kiện thi đua (ví dụ: Đi học muộn, Không làm bài tập, Giúp đỡ bạn bè...)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Mô tả rõ ràng về hành vi, vi phạm hoặc thành tích của bạn
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Xem trước sự kiện</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Loại sự kiện:</span>
                    <span className="text-sm text-muted-foreground">
                      {eventTypes.find(t => t.id === formData.event_type)?.name || 'Chưa chọn'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Ngày:</span>
                    <span className="text-sm text-muted-foreground">
                      {formData.date ? new Date(formData.date).toLocaleDateString('vi-VN') : 'Chưa chọn'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Điểm:</span>
                    <Badge className={`${formData.points > 0 ? 'bg-emerald-100 text-emerald-800' : formData.points < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                      {getPointsIcon(formData.points)}
                      {formData.points > 0 ? '+' : ''}{formData.points}
                    </Badge>
                  </div>
                  {formData.description && (
                    <div className="flex items-start justify-between">
                      <span className="font-medium">Mô tả:</span>
                      <span className="text-sm text-muted-foreground max-w-xs text-right">
                        {formData.description}
                      </span>
                    </div>
                  )}
                </div>
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
                onClick={() => navigate('/events')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !formData.event_type}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Tạo sự kiện
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

export default StudentEventForm;
