import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Clock, 
  Edit, 
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Event, EventType, Classroom } from '@/services/api';
import StudentEventMatrix from '@/components/StudentEventMatrix';

// Helper function to get classroom name
const getClassroomName = (event: Event) => {
  if (typeof event.classroom === 'string') {
    return event.classroom_name || event.classroom;
  }
  return event.classroom.full_name;
};

// Helper function to get recorded by name
const getRecordedByName = (event: Event) => {
  if (typeof event.recorded_by === 'string') {
    return event.recorded_by_name || event.recorded_by;
  }
  return event.recorded_by.full_name;
};

const EventEditByDate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const date = searchParams.get('date');
  const classroomId = searchParams.get('classroom');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date) {
      setError('Thiếu thông tin ngày');
      return;
    }
    
    if (!classroomId || classroomId === 'undefined') {
      setError('Thiếu thông tin lớp học');
      return;
    }
    
    loadData();
  }, [date, classroomId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load classroom info
      const classroomData = await apiService.getClassroom(classroomId!);
      setClassroom(classroomData);
      
      // Load events for this date and classroom
      const eventsData = await apiService.getEvents({
        classroom_id: classroomId!,
        date: date!
      });
      setEvents(eventsData);
      
    } catch (e: any) {
      console.error('Error loading data:', e);
      setError(e?.message || 'Không thể tải dữ liệu');
      toast({
        title: 'Lỗi',
        description: e?.message || 'Không thể tải dữ liệu',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/events');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPointsColor = (points: number) => {
    if (points > 0) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (points < 0) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa sự kiện</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(date!)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {classroom?.full_name}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {events.length} sự kiện
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Matrix for editing */}
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa sự kiện theo tiết học</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentEventMatrix 
            initialDate={date!}
            initialClassroomId={classroomId!}
            isEditMode={true}
            onSave={() => {
              toast({
                title: 'Đã lưu',
                description: 'Dữ liệu đã được cập nhật thành công',
              });
              // Reload data
              loadData();
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EventEditByDate;
