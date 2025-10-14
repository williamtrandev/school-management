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
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventType, Classroom } from '@/services/api';

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

const EventDetailByDate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
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
      
      console.log('EventDetailByDate - Loaded events:', eventsData);
      console.log('EventDetailByDate - Events count:', eventsData.length);
      console.log('EventDetailByDate - First event:', eventsData[0]);
      
      setEvents(eventsData);
      
    } catch (e: any) {
      console.error('EventDetailByDate - Error loading data:', e);
      console.error('EventDetailByDate - Error details:', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        url: e?.config?.url,
        params: { classroomId, date }
      });
      
      const errorMessage = e?.response?.data?.detail || e?.message || 'Không thể tải dữ liệu';
      setError(errorMessage);
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/events');
  };

  const handleEdit = () => {
    navigate(`/events/edit?date=${date}&classroom=${classroomId}`);
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

  // Group events by period
  const eventsByPeriod = events.reduce((acc, event) => {
    const period = event.period || 0;
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period].push(event);
    return acc;
  }, {} as Record<number, Event[]>);

  const periods = Object.keys(eventsByPeriod)
    .map(Number)
    .sort((a, b) => a - b);
  

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
    <div className="container mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button onClick={handleBack} variant="outline" className="h-9 px-3">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Chi tiết sự kiện</h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(date!)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {classroom?.full_name}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          {user?.role === 'teacher' && (
            <Button
              variant="outline"
              className="h-9 px-3"
              onClick={async () => {
                try {
                  await apiService.bulkApproveEvents({ classroom: classroomId!, date: date!, period: null });
                  toast({ title: 'Đã duyệt', description: 'Duyệt toàn bộ sự kiện trong ngày' });
                  loadData();
                } catch (e: any) {
                  toast({ title: 'Lỗi', description: e?.message || 'Không thể duyệt', variant: 'destructive' });
                }
              }}
            >
              Duyệt cả ngày
            </Button>
          )}
          <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 h-9 px-3">
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Summary Cards removed as per request */}

      {/* Period overview - more visual details per period */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {periods.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-gray-500 text-sm">
              Chưa có dữ liệu cho ngày này
            </CardContent>
          </Card>
        ) : (
          periods.map((p) => {
            const pEvents = eventsByPeriod[p] || [];
            const hasPending = pEvents.some(e => e.status === 'pending');
            const hasRejected = pEvents.some(e => e.status === 'rejected');
            const statusBadge = hasPending ? { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
              : hasRejected ? { text: 'Từ chối', cls: 'bg-red-100 text-red-800 border-red-200' }
              : { text: 'Đã duyệt', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' };

            const studentPoints = pEvents.filter(e => e.student && e.event_type?.category !== 'discipline');
            const studentDiscipline = pEvents.filter(e => e.student && e.event_type?.category === 'discipline');
            const classRules = pEvents.filter(e => !e.student && e.event_type?.category === 'school_rules');

            return (
              <Card key={p} className="border border-gray-200">
                <CardHeader className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" /> Tiết {p}
                    </Badge>
                    <span className={`px-2 py-0.5 rounded text-[11px] border ${statusBadge.cls}`}>{statusBadge.text}</span>
                  </div>
                  {user?.role === 'teacher' && (hasPending || hasRejected) && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await apiService.bulkApproveEvents({ classroom: classroomId!, date: date!, period: p });
                            toast({ title: 'Đã duyệt', description: `Duyệt tiết ${p}` });
                            loadData();
                          } catch (e: any) {
                            toast({ title: 'Lỗi', description: e?.message || 'Không thể duyệt', variant: 'destructive' });
                          }
                        }}
                      >
                        Duyệt tiết này
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-green-50/60 border border-green-100 rounded-md p-3">
                      <div className="font-medium text-green-700 mb-2 text-sm">Học sinh đạt điểm</div>
                      {studentPoints.length === 0 ? (
                        <div className="text-xs sm:text-sm text-gray-500">Không có</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {studentPoints.map((e) => {
                            const fullName = typeof e.student === 'object'
                              ? (e.student.user?.full_name || `${e.student.user?.first_name || ''} ${e.student.user?.last_name || ''}`.trim())
                              : (e.student_name || '');
                            return (
                              <Badge key={e.id} variant="outline" className="text-[11px] sm:text-xs">
                                {fullName || 'Không rõ tên'} • {e.event_type.name} • {e.points > 0 ? `+${e.points}` : e.points}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-red-50/60 border border-red-100 rounded-md p-3">
                      <div className="font-medium text-red-700 mb-2 text-sm">Vi phạm theo học sinh</div>
                      {studentDiscipline.length === 0 ? (
                        <div className="text-xs sm:text-sm text-gray-500">Không có</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {studentDiscipline.map((e) => {
                            const fullName = typeof e.student === 'object'
                              ? (e.student.user?.full_name || `${e.student.user?.first_name || ''} ${e.student.user?.last_name || ''}`.trim())
                              : (e.student_name || '');
                            return (
                              <Badge key={e.id} variant="outline" className="text-[11px] sm:text-xs">
                                {fullName || 'Không rõ tên'} • {e.event_type.name} • {e.points}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <div className="font-medium text-gray-700 mb-2 text-sm">Vi phạm nề nếp/quy định</div>
                      {classRules.length === 0 ? (
                        <div className="text-xs sm:text-sm text-gray-500">Không có</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {classRules.map((e) => (
                            <Badge key={e.id} variant="secondary" className="text-[11px] sm:text-xs">
                              {e.event_type.name} • {e.points}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
};

export default EventDetailByDate;
