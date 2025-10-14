import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  User,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { StudentEventPermission, Student, Classroom } from '@/services/api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface StudentEventPermissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: StudentEventPermission | null;
  classroomId?: string;
}

const StudentEventPermissionForm: React.FC<StudentEventPermissionFormProps> = ({ 
  onSuccess, 
  onCancel, 
  initialData,
  classroomId 
}) => {
  const [formData, setFormData] = useState({
    student: initialData?.student || '',
    classroom: initialData?.classroom || classroomId || '',
    expires_at: initialData?.expires_at || '',
    notes: initialData?.notes || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [studentsData, classroomsData] = await Promise.all([
          apiService.getStudents({ classroom_id: formData.classroom }),
          apiService.getClassrooms()
        ]);
        setStudents(studentsData);
        setClassrooms(classroomsData);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    loadOptions();
  }, [formData.classroom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (initialData) {
        await apiService.updateStudentEventPermission(initialData.id, {
          is_active: true,
          expires_at: formData.expires_at || undefined,
          notes: formData.notes,
        });
        toast({
          title: 'Thành công',
          description: 'Cập nhật quyền thành công!',
        });
      } else {
        await apiService.createStudentEventPermission({
          student: formData.student,
          classroom: formData.classroom,
          expires_at: formData.expires_at || undefined,
          notes: formData.notes,
        });
        toast({
          title: 'Thành công',
          description: 'Cấp quyền thành công!',
        });
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Có lỗi xảy ra');
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi lưu quyền',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Lớp học *</label>
          <Select
            value={formData.classroom}
            onValueChange={(value) => setFormData(prev => ({ ...prev, classroom: value, student: '' }))}
            disabled={!!classroomId}
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Học sinh *</label>
          <Select
            value={formData.student}
            onValueChange={(value) => setFormData(prev => ({ ...prev, student: value }))}
            disabled={!formData.classroom}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn học sinh" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.student_code} - {student.user.full_name || `${student.user.first_name} ${student.user.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ngày hết hạn (tùy chọn)</label>
        <Input
          type="datetime-local"
          value={formData.expires_at}
          onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
        />
        <p className="text-xs text-muted-foreground">
          Để trống nếu không muốn giới hạn thời gian
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ghi chú</label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Ghi chú về quyền này..."
        />
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
        <Button type="submit" disabled={isLoading || !formData.student || !formData.classroom}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            initialData ? 'Cập nhật' : 'Cấp quyền'
          )}
        </Button>
      </div>
    </form>
  );
};

interface StudentEventPermissionManagerProps {
  classroomId?: string;
}

const StudentEventPermissionManager: React.FC<StudentEventPermissionManagerProps> = ({ classroomId }) => {
  const [permissions, setPermissions] = useState<StudentEventPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<StudentEventPermission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    permission: StudentEventPermission | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    permission: null,
    isLoading: false,
  });

  useEffect(() => {
    loadPermissions();
  }, [classroomId]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      setError('');
      const params: any = {};
      if (classroomId) params.classroom_id = classroomId;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
      
      const permissionsData = await apiService.getStudentEventPermissions(params);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setError('Không thể tải danh sách quyền');
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách quyền',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (permission: StudentEventPermission) => {
    setDeleteModal({
      isOpen: true,
      permission,
      isLoading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.permission) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await apiService.deleteStudentEventPermission(deleteModal.permission.id);
      toast({
        title: 'Thành công',
        description: 'Xóa quyền thành công!',
      });
      loadPermissions();
      setDeleteModal({ isOpen: false, permission: null, isLoading: false });
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast({
        title: 'Lỗi',
        description: 'Xóa quyền thất bại',
        variant: 'destructive',
      });
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, permission: null, isLoading: false });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPermission(null);
    loadPermissions();
  };

  const handleEdit = (permission: StudentEventPermission) => {
    setEditingPermission(permission);
    setShowForm(true);
  };

  const handleToggleStatus = async (permission: StudentEventPermission) => {
    try {
      await apiService.updateStudentEventPermission(permission.id, {
        is_active: !permission.is_active,
      });
      toast({
        title: 'Thành công',
        description: `${permission.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'} quyền thành công!`,
      });
      loadPermissions();
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Lỗi',
        description: 'Cập nhật quyền thất bại',
        variant: 'destructive',
      });
    }
  };

  // Filter permissions
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = searchTerm === '' || 
      permission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.classroom_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
            <p className="text-muted-foreground">Đang tải danh sách quyền...</p>
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
                  <Shield className="h-5 w-5 text-white" />
                </div>
                Quản lý quyền tạo sự kiện
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Cấp và quản lý quyền tạo sự kiện thi đua cho học sinh
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadPermissions}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Cấp quyền
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPermission ? 'Cập nhật quyền' : 'Cấp quyền tạo sự kiện'}
                    </DialogTitle>
                  </DialogHeader>
                  <StudentEventPermissionForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingPermission(null);
                    }}
                    initialData={editingPermission}
                    classroomId={classroomId}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredPermissions.length} trong tổng số {permissions.length} quyền
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

      {/* Permissions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày cấp</TableHead>
                  <TableHead>Ngày hết hạn</TableHead>
                  <TableHead>Người cấp</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Shield className="h-12 w-12 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            {searchTerm ? 'Không tìm thấy quyền nào' : 'Chưa có quyền nào được cấp'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm 
                              ? 'Thử thay đổi từ khóa tìm kiếm'
                              : 'Cấp quyền đầu tiên để bắt đầu'
                            }
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPermissions.map((permission) => (
                    <TableRow key={permission.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-medium">{permission.student_name}</div>
                            <div className="text-sm text-muted-foreground">{permission.student_code}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {permission.classroom_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {permission.is_valid ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Hoạt động
                            </Badge>
                          ) : permission.is_expired ? (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Hết hạn
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Tạm dừng
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(permission.granted_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {permission.expires_at ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDateTime(permission.expires_at)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Không giới hạn</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{permission.granted_by_name}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm" title={permission.notes || ''}>
                          {permission.notes || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(permission)}
                            className="hover:bg-purple-50 hover:text-purple-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(permission)}
                            className={`hover:bg-${permission.is_active ? 'red' : 'green'}-50 hover:text-${permission.is_active ? 'red' : 'green'}-600`}
                          >
                            {permission.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(permission)}
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
        title="Xóa quyền tạo sự kiện"
        description="Bạn có chắc chắn muốn xóa quyền tạo sự kiện của học sinh"
        itemName={deleteModal.permission?.student_name}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default StudentEventPermissionManager;

