import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Event, EventType, Classroom } from '@/services/api';
import EventForm from './EventForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface EventListProps {
  onRefresh?: () => void;
}

const EventList: React.FC<EventListProps> = ({ onRefresh }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('A1');
  const [selectedEventType, setSelectedEventType] = useState('A1');
  const [selectedDate, setSelectedDate] = useState('');

  // Options for filters
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    event: Event | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    event: null,
    isLoading: false,
  });

  // Load events and options
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [eventsData, types, classes] = await Promise.all([
        apiService.getEvents(),
        apiService.getEventTypes(),
        apiService.getClassrooms()
      ]);
      setEvents(eventsData);
      setEventTypes(types);
      setClassrooms(classes);
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

  const handleDeleteClick = (event: Event) => {
    setDeleteModal({
      isOpen: true,
      event,
      isLoading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.event) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await apiService.deleteEvent(deleteModal.event.id);
      toast({
        title: 'Thành công',
        description: 'Xóa sự kiện thành công!',
      });
      loadData();
      onRefresh?.();
      setDeleteModal({ isOpen: false, event: null, isLoading: false });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Lỗi',
        description: 'Xóa sự kiện thất bại',
        variant: 'destructive',
      });
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, event: null, isLoading: false });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEvent(null);
    loadData();
    onRefresh?.();
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.classroom.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.student && (event.student.user.full_name || `${event.student.user.first_name} ${event.student.user.last_name}`).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClassroom = selectedClassroom === 'all' || selectedClassroom === '' || event.classroom.id === selectedClassroom;
    const matchesEventType = selectedEventType === 'all' || selectedEventType === '' || event.event_type.id === selectedEventType;
    const matchesDate = selectedDate === '' || event.date === selectedDate;

    return matchesSearch && matchesClassroom && matchesEventType && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPointsColor = (points: number) => {
    if (points > 0) return 'bg-green-100 text-green-800';
    if (points < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Danh sách sự kiện thi đua</h2>
          <p className="text-gray-600">Quản lý các sự kiện thi đua nề nếp</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo sự kiện
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Cập nhật sự kiện' : 'Tạo sự kiện mới'}
              </DialogTitle>
            </DialogHeader>
            <EventForm
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingEvent(null);
              }}
              initialData={editingEvent ? {
                event_type_id: editingEvent.event_type.id,
                classroom_id: editingEvent.classroom.id,
                student_id: editingEvent.student?.id,
                date: editingEvent.date,
                period: editingEvent.period,
                points: editingEvent.points,
                description: editingEvent.description,
              } : undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lớp học</label>
              <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lớp</SelectItem>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại sự kiện</label>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Kết quả ({filteredEvents.length} sự kiện)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy sự kiện nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Loại sự kiện</TableHead>
                    <TableHead>Học sinh</TableHead>
                    <TableHead>Tiết</TableHead>
                    <TableHead>Điểm</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Người ghi</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{formatDate(event.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {event.classroom.full_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.event_type.name}</TableCell>
                      <TableCell>
                        {event.student ? (
                          <span className="text-sm">
                            {event.student.student_code} - {event.student.user.full_name || `${event.student.user.first_name} ${event.student.user.last_name}`}
                          </span>
                        ) : (
                          <span className="text-gray-500">Cả lớp</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {event.period ? `Tiết ${event.period}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPointsColor(event.points)}>
                          {event.points > 0 ? '+' : ''}{event.points}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {event.description || '-'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {event.recorded_by.full_name || `${event.recorded_by.first_name} ${event.recorded_by.last_name}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(event)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xóa sự kiện"
        description="Bạn có chắc chắn muốn xóa sự kiện"
        itemName={deleteModal.event?.description || deleteModal.event?.event_type.name}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default EventList; 