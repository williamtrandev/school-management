import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Plus, 
  Filter, 
  Eye,
  Edit,
  Calendar,
  Users,
  Award,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Event, Classroom } from '@/services/api';
// Removed DeleteConfirmationModal for simplified UI

interface ModernEventListProps {
  onRefresh?: () => void;
  onEventsLoaded?: (events: Event[]) => void;
}

const ModernEventList: React.FC<ModernEventListProps> = ({ onRefresh, onEventsLoaded }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Removed inline create dialog to avoid duplicate create buttons
  // Removed inline editing in list/grid views to simplify UI
  const [groupByDate, setGroupByDate] = useState(true);
  const [studentClassroomId, setStudentClassroomId] = useState<string>('');
  const [studentClassroomName, setStudentClassroomName] = useState<string>('');

  // Filter states
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  // Removed event type filter
  const [selectedDate, setSelectedDate] = useState('');
  // Removed points filter

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Options for filters
  // Removed event types options
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Removed delete modal state

  const { toast } = useToast();

  // Helpers: parse and sort classroom codes like 10A1, 10B2
  function parseClassCode(className: string) {
    const compact = (className || '').replace(/\s+/g, '');
    const match = compact.match(/^(\d+)([A-Za-zÀ-ỹ]+)?(\d+)?/i);
    const grade = match && match[1] ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
    const letter = match && match[2] ? match[2].toUpperCase() : '';
    const number = match && match[3] ? parseInt(match[3], 10) : Number.MAX_SAFE_INTEGER;
    return { grade, letter, number };
  }

  function compareClassroomsByCode(a: Classroom, b: Classroom) {
    const A = parseClassCode(a.full_name || '');
    const B = parseClassCode(b.full_name || '');
    if (A.grade !== B.grade) return A.grade - B.grade;
    if (A.letter !== B.letter) return A.letter.localeCompare(B.letter, 'vi');
    if (A.number !== B.number) return A.number - B.number;
    return (a.full_name || '').localeCompare(b.full_name || '', 'vi');
  }

  // Load events and options
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when student classroom changes
  useEffect(() => {
    if (user?.role === 'student' && studentClassroomId) {
      loadData();
    }
  }, [studentClassroomId]);

  // Load student classroom info - moved to loadData to avoid duplicate API calls

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Build parameters based on role and filters
      const params: any = {};
      
      // For students, load classroom info first
      if (user?.role === 'student') {
        try {
          const studentResponse = await apiService.getMyClassroomStudents();
          setStudentClassroomId(studentResponse.classroom.id);
          setStudentClassroomName(studentResponse.classroom.full_name);
          setSelectedClassroom(studentResponse.classroom.id);
          params.classroom_id = studentResponse.classroom.id;
        } catch (e) {
          console.error('Error loading student classroom:', e);
        }
      } else if (user?.role === 'admin' || user?.role === 'teacher') {
        if (selectedClassroom !== 'all') {
          params.classroom_id = selectedClassroom;
        }
      }
      
      console.log('Loading events with params:', params);
      
      // Load data in parallel (event types removed)
      const [eventsData, classes] = await Promise.all([
        apiService.getEvents(params),
        apiService.getClassrooms()
      ]);
      
      console.log('Loaded events:', eventsData);
      console.log('Events count:', eventsData.length);
      console.log('First event structure:', eventsData[0]);
      
      // Debug: Check for student events with points
      const studentEvents = eventsData.filter(e => e.student && e.points);
      console.log('Student events with points:', studentEvents);
      console.log('Student events count:', studentEvents.length);
      
      // Debug: Check for events with specific point values
      const eventsWithPoints = eventsData.filter(e => e.points && e.points > 0);
      console.log('Events with positive points:', eventsWithPoints);
      console.log('Events with points 10:', eventsData.filter(e => e.points === 10));
      console.log('Events with points 9:', eventsData.filter(e => e.points === 9));
      console.log('Events with points 8:', eventsData.filter(e => e.points === 8));
      setEvents(eventsData);
      setClassrooms(classes);

      // Auto-select homeroom class for teacher
      if (user?.role === 'teacher' && selectedClassroom === 'all') {
        const myClasses = classes.filter((c) => c.homeroom_teacher && c.homeroom_teacher.id === user.id);
        if (myClasses.length > 0) {
          setSelectedClassroom(myClasses[0].id);
        }
      }
      
      // Pass events data to parent for stats calculation
      if (onEventsLoaded) {
        onEventsLoaded(eventsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Không thể tải dữ liệu');
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed delete click handler

  const handleRefresh = () => {
    loadData();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Removed delete confirm handler

  // Removed delete cancel handler

  // Removed form success handler as inline dialog was removed

  // Removed inline edit handler

  // Filter events
  console.log('All events before filter:', events);
  console.log('Filter params:', { selectedClassroom, selectedDate });
  
  const filteredEvents = events.filter(event => {
    const matchesSearch = true;

    const matchesClassroom = selectedClassroom === 'all' || selectedClassroom === '' || 
      (typeof event.classroom === 'string' ? event.classroom === selectedClassroom : event.classroom.id === selectedClassroom);
    const matchesEventType = true;
    const matchesDate = selectedDate === '' || event.date === selectedDate;
    
    const matchesPoints = true;

    return matchesSearch && matchesClassroom && matchesEventType && matchesDate && matchesPoints;
  });
  
  console.log('Filtered events:', filteredEvents);
  console.log('Filtered events count:', filteredEvents.length);

  // Group events by date
  const eventsByDate = groupByDate ? filteredEvents.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>) : {};

  // Helper function to get classroom name
  function getClassroomName(event: Event) {
    if (typeof event.classroom === 'string') {
      return event.classroom_name || event.classroom;
    }
    return event.classroom.full_name;
  }

  // Helper function to get recorded by name
  function getRecordedByName(event: Event) {
    if (typeof event.recorded_by === 'string') {
      return event.recorded_by_name || event.recorded_by;
    }
    return event.recorded_by.full_name;
  }

  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDates = sortedDates.slice(startIndex, endIndex);
  const totalDates = sortedDates.length;
  const calculatedTotalPages = Math.ceil(totalDates / pageSize);
  
  // Debug pagination
  console.log('Pagination debug:', {
    totalDates,
    pageSize,
    calculatedTotalPages,
    currentPage,
    startIndex,
    endIndex,
    paginatedDatesLength: paginatedDates.length
  });
  
  // Update total pages when data changes
  useEffect(() => {
    setTotalPages(calculatedTotalPages);
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [calculatedTotalPages, currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPointsColor = (points: number) => {
    if (points > 0) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (points < 0) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPointsIcon = (points: number) => {
    if (points > 0) return <TrendingUp className="h-3 w-3" />;
    if (points < 0) return <TrendingDown className="h-3 w-3" />;
    return <Award className="h-3 w-3" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-muted-foreground">Đang tải danh sách sự kiện...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions - Simplified */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Advanced Filters (Search removed) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-500" />
            Bộ lọc nâng cao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Lớp học</label>
              {user?.role === 'student' ? (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">{studentClassroomName}</span>
                </div>
              ) : (
                <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả lớp</SelectItem>
                    {classrooms.slice().sort(compareClassroomsByCode).map((classroom) => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Summary - simplified */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Hiển thị <span className="font-medium">{filteredEvents.length}</span> / <span className="font-medium">{events.length}</span> sự kiện
        </div>
        
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hiển thị:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => {
            setPageSize(parseInt(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Display */}
      {groupByDate ? (
        <>
          {user?.role === 'admin' && selectedClassroom === 'all' && (
            <Alert className="mb-4">
              <AlertDescription>
                💡 Vui lòng chọn lớp học để xem chi tiết và chỉnh sửa sự kiện
              </AlertDescription>
            </Alert>
          )}
          {/* Group by Date View - Beautiful Date Cards */}
        <div className="space-y-6">
          {paginatedDates.map(date => {
            const dateEvents = eventsByDate[date];
            const totalPoints = dateEvents.reduce((sum, event) => sum + event.points, 0);
            const periods = [...new Set(dateEvents.map(e => e.period).filter(Boolean))].sort((a, b) => a - b);
            const hasStudentEvents = dateEvents.some(e => e.student);
            const hasClassEvents = dateEvents.some(e => !e.student);
            
            return (
              <Card key={date} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {new Date(date).getDate()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(date).toLocaleDateString('vi-VN', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-xl">{formatDate(date)}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {dateEvents.length} sự kiện
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {totalPoints > 0 ? `+${totalPoints}` : totalPoints} điểm
                          </span>
                          {periods.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {periods.length} tiết
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={user?.role === 'admin' && selectedClassroom === 'all'}
                        onClick={() => {
                          // Navigate to detail page for this date
                          console.log('Date events:', dateEvents);
                          console.log('First event:', dateEvents[0]);
                          console.log('Classroom:', dateEvents[0]?.classroom);
                          console.log('Selected classroom filter:', selectedClassroom);
                          
                          const classroomId = user?.role === 'student' 
                            ? studentClassroomId 
                            : (typeof dateEvents[0]?.classroom === 'string' 
                                ? dateEvents[0]?.classroom 
                                : dateEvents[0]?.classroom?.id || selectedClassroom);
                          
                          if (classroomId && classroomId !== 'all') {
                            window.location.href = `/events/detail?date=${date}&classroom=${classroomId}`;
                          } else {
                            console.error('No classroom ID found for date:', date);
                            toast({
                              title: 'Lỗi',
                              description: user?.role === 'student' 
                                ? 'Không tìm thấy thông tin lớp học của bạn'
                                : 'Không tìm thấy thông tin lớp học. Vui lòng chọn lớp học trước.',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={user?.role === 'admin' && selectedClassroom === 'all'}
                        onClick={() => {
                          // Navigate to edit page for this date
                          console.log('Edit - Date events:', dateEvents);
                          console.log('Edit - First event:', dateEvents[0]);
                          console.log('Edit - Classroom:', dateEvents[0]?.classroom);
                          console.log('Edit - Selected classroom filter:', selectedClassroom);
                          
                          const classroomId = user?.role === 'student' 
                            ? studentClassroomId 
                            : (typeof dateEvents[0]?.classroom === 'string' 
                                ? dateEvents[0]?.classroom 
                                : dateEvents[0]?.classroom?.id || selectedClassroom);
                          
                          if (classroomId && classroomId !== 'all') {
                            window.location.href = `/events/edit?date=${date}&classroom=${classroomId}`;
                          } else {
                            console.error('No classroom ID found for date:', date);
                            toast({
                              title: 'Lỗi',
                              description: user?.role === 'student' 
                                ? 'Không tìm thấy thông tin lớp học của bạn'
                                : 'Không tìm thấy thông tin lớp học. Vui lòng chọn lớp học trước.',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Summary Cards */}
                    <div className="space-y-3">
                      {hasStudentEvents && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">Sự kiện học sinh</span>
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            {dateEvents.filter(e => e.student).length} sự kiện cá nhân
                          </div>
                        </div>
                      )}
                      {hasClassEvents && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-800">Sự kiện lớp</span>
                          </div>
                          <div className="text-sm text-blue-700 mt-1">
                            {dateEvents.filter(e => !e.student).length} sự kiện tập thể
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Periods Summary */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-800">Tiết học</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {periods.map(period => (
                          <Badge key={period} variant="secondary" className="text-xs">
                            Tiết {period}
                          </Badge>
                        ))}
                        {periods.length === 0 && (
                          <span className="text-sm text-gray-500">Chưa có tiết học</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Pagination Controls */}
        {calculatedTotalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Trang {currentPage} / {calculatedTotalPages} ({totalDates} ngày)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, calculatedTotalPages) }, (_, i) => {
                  let pageNum;
                  if (calculatedTotalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= calculatedTotalPages - 2) {
                    pageNum = calculatedTotalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(calculatedTotalPages, prev + 1))}
                disabled={currentPage === calculatedTotalPages}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        </>
      ) : null}
      
      {/* Delete Confirmation Modal */}
      {/* DeleteConfirmationModal removed in simplified UI */}
    </div>
  );
};

export default ModernEventList;
