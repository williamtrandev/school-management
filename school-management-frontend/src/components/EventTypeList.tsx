import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Edit,
  Trash2,
  Activity,
  Loader2,
  Settings,
  Award,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { EventType } from '@/services/api';

export default function EventTypeList() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const types = await apiService.getEventTypes();
      setEventTypes(types);
    } catch (error) {
      console.error('Error loading event types:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách loại sự kiện',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventType: EventType) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa loại sự kiện "${eventType.name}"?`)) {
      return;
    }

    try {
      await apiService.deleteEventType(eventType.id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa loại sự kiện',
      });
      loadEventTypes();
    } catch (error) {
      console.error('Error deleting event type:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa loại sự kiện',
        variant: 'destructive',
      });
    }
  };

  const filteredEventTypes = eventTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quản lý loại sự kiện
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các loại sự kiện thi đua
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm loại sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <div className="text-muted-foreground">Đang tải...</div>
          </div>
        ) : filteredEventTypes.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchTerm ? 'Không tìm thấy loại sự kiện' : 'Chưa có loại sự kiện nào'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm 
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Chưa có loại sự kiện nào được tạo'
              }
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
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
                {filteredEventTypes.map((eventType) => (
                  <TableRow key={eventType.id}>
                    <TableCell className="font-medium">
                      {eventType.name}
                    </TableCell>
                    <TableCell>
                      {eventType.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={eventType.is_active ? "default" : "secondary"}>
                        {eventType.is_active ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(eventType.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            toast({
                              title: 'Thông báo',
                              description: 'Chức năng chỉnh sửa sẽ được phát triển sau',
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(eventType)}
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
  );
}
