import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Settings,
  Award,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { EventType } from '@/services/api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface EventTypeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: EventType | null;
}

const EventTypeForm: React.FC<EventTypeFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    is_active: initialData?.is_active ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (initialData) {
        await apiService.updateEventType(initialData.id, formData);
        toast({
          title: 'Thành công',
          description: 'Cập nhật loại sự kiện thành công!',
        });
      } else {
        await apiService.createEventType(formData);
        toast({
          title: 'Thành công',
          description: 'Tạo loại sự kiện thành công!',
        });
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Có lỗi xảy ra');
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi lưu loại sự kiện',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Tên loại sự kiện *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nhập tên loại sự kiện"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Mô tả</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Nhập mô tả loại sự kiện"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          className="rounded"
        />
        <label htmlFor="is_active" className="text-sm font-medium">
          Kích hoạt
        </label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            initialData ? 'Cập nhật' : 'Tạo mới'
          )}
        </Button>
      </div>
    </form>
  );
};

const ModernEventTypeList: React.FC = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<EventType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    eventType: EventType | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    eventType: null,
    isLoading: false,
  });

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const types = await apiService.getEventTypes();
      setEventTypes(types);
    } catch (error) {
      console.error('Error loading event types:', error);
      setError('Không thể tải danh sách loại sự kiện');
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách loại sự kiện',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (eventType: EventType) => {
    setDeleteModal({
      isOpen: true,
      eventType,
      isLoading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.eventType) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await apiService.deleteEventType(deleteModal.eventType.id);
      toast({
        title: 'Thành công',
        description: 'Xóa loại sự kiện thành công!',
      });
      loadEventTypes();
      setDeleteModal({ isOpen: false, eventType: null, isLoading: false });
    } catch (error) {
      console.error('Error deleting event type:', error);
      toast({
        title: 'Lỗi',
        description: 'Xóa loại sự kiện thất bại',
        variant: 'destructive',
      });
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, eventType: null, isLoading: false });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingType(null);
    loadEventTypes();
  };

  const handleEdit = (eventType: EventType) => {
    setEditingType(eventType);
    setShowForm(true);
  };

  // Filter event types
  const filteredEventTypes = eventTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
            <p className="text-muted-foreground">Đang tải danh sách loại sự kiện...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                Quản lý loại sự kiện
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tạo và quản lý các loại sự kiện thi đua nề nếp
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadEventTypes}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm loại sự kiện
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingType ? 'Cập nhật loại sự kiện' : 'Tạo loại sự kiện mới'}
                    </DialogTitle>
                  </DialogHeader>
                  <EventTypeForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingType(null);
                    }}
                    initialData={editingType}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm loại sự kiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredEventTypes.length} trong tổng số {eventTypes.length} loại sự kiện
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

      {/* Event Types Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên loại sự kiện</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEventTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Award className="h-12 w-12 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            {searchTerm ? 'Không tìm thấy loại sự kiện' : 'Chưa có loại sự kiện nào'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm 
                              ? 'Thử thay đổi từ khóa tìm kiếm'
                              : 'Tạo loại sự kiện đầu tiên để bắt đầu'
                            }
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEventTypes.map((eventType) => (
                    <TableRow key={eventType.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{eventType.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {eventType.description || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={eventType.is_active ? "default" : "secondary"}
                          className={eventType.is_active 
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                            : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {eventType.is_active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Tạm dừng
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(eventType.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(eventType)}
                            className="hover:bg-purple-50 hover:text-purple-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(eventType)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xóa loại sự kiện"
        description="Bạn có chắc chắn muốn xóa loại sự kiện"
        itemName={deleteModal.eventType?.name}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default ModernEventTypeList;

