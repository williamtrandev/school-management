import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Plus, 
  Users, 
  UserCheck, 
  UserX, 
  Filter,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  BookOpen,
  Mail,
  Calendar,
  Table as TableIcon,
  Upload
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Teacher } from '@/services/api';

export default function TeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filters, setFilters] = useState({
    search: '',
    subject: 'all',
    ordering: 'user__first_name'
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    teacher: Teacher | null;
  }>({ isOpen: false, teacher: null });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load teachers
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.subject !== 'all') params.subject = filters.subject;
      if (filters.ordering) params.ordering = filters.ordering;
      
      const teachersData = await apiService.getTeacherList(params);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách giáo viên',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setDeleteModal({ isOpen: true, teacher });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.teacher) return;
    
    try {
      await apiService.deleteTeacher(deleteModal.teacher.id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa giáo viên',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa giáo viên',
        variant: 'destructive',
      });
    } finally {
      setDeleteModal({ isOpen: false, teacher: null });
    }
  };

  const handleAddTeacher = () => {
    navigate('/teachers/create');
  };

  const handleEditTeacher = (teacher: Teacher) => {
    navigate(`/teachers/${teacher.id}/edit`);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    navigate(`/teachers/${teacher.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const teachersWithClasses = teachers.filter(t => (t.homeroom_class_count || 0) > 0).length;
  const teachersWithoutClasses = teachers.length - teachersWithClasses;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng giáo viên</p>
                <p className="text-3xl font-bold text-blue-700">{teachers.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Có lớp chủ nhiệm</p>
                <p className="text-3xl font-bold text-green-700">{teachersWithClasses}</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Chưa có lớp</p>
                <p className="text-3xl font-bold text-orange-700">{teachersWithoutClasses}</p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                <UserX className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Môn học</p>
                <p className="text-3xl font-bold text-purple-700">
                  {new Set(teachers.map(t => t.subject).filter(Boolean)).size}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-green-600" />
            Bộ Lọc & Tìm Kiếm
          </CardTitle>
          <CardDescription>
            Tìm kiếm và lọc danh sách giáo viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tên, mã giáo viên, email, môn dạy..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 border-0 bg-white shadow-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Môn dạy</label>
              <Select
                value={filters.subject}
                onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger className="border-0 bg-white shadow-sm">
                  <SelectValue placeholder="Chọn môn dạy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn</SelectItem>
                  <SelectItem value="Toán">Toán</SelectItem>
                  <SelectItem value="Văn">Văn</SelectItem>
                  <SelectItem value="Anh">Anh</SelectItem>
                  <SelectItem value="Lý">Lý</SelectItem>
                  <SelectItem value="Hóa">Hóa</SelectItem>
                  <SelectItem value="Sinh">Sinh</SelectItem>
                  <SelectItem value="Sử">Sử</SelectItem>
                  <SelectItem value="Địa">Địa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sắp xếp</label>
              <Select
                value={filters.ordering}
                onValueChange={(value) => setFilters(prev => ({ ...prev, ordering: value }))}
              >
                <SelectTrigger className="border-0 bg-white shadow-sm">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user__first_name">Tên A-Z</SelectItem>
                  <SelectItem value="-user__first_name">Tên Z-A</SelectItem>
                  <SelectItem value="teacher_code">Mã giáo viên</SelectItem>
                  <SelectItem value="created_at">Ngày tạo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Teachers Display */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Đang tải danh sách giáo viên...</p>
            </div>
          </CardContent>
        </Card>
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có giáo viên nào</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.subject !== 'all'
                  ? 'Không tìm thấy giáo viên phù hợp với bộ lọc'
                  : 'Chưa có giáo viên nào trong hệ thống'}
              </p>
              <Button 
                className="bg-gradient-to-r from-green-600 to-blue-600"
                onClick={handleAddTeacher}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm giáo viên đầu tiên
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        // Table View
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh Sách Giáo Viên</span>
              <Badge variant="secondary" className="text-sm">
                {teachers.length} giáo viên
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Giáo Viên</TableHead>
                    <TableHead className="font-semibold">Mã GV</TableHead>
                    <TableHead className="font-semibold">Môn dạy</TableHead>
                    <TableHead className="font-semibold">Lớp chủ nhiệm</TableHead>
                    <TableHead className="font-semibold">Ngày tạo</TableHead>
                    <TableHead className="font-semibold text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
                              {getInitials(teacher.user.full_name || `${teacher.user.first_name} ${teacher.user.last_name}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{teacher.user.full_name || `${teacher.user.first_name} ${teacher.user.last_name}`}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {teacher.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {teacher.teacher_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {teacher.subject ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {teacher.subject}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{teacher.homeroom_class_count || 0}</span>
                          <span className="text-muted-foreground text-sm">lớp</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(teacher.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewTeacher(teacher)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditTeacher(teacher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(teacher)}
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
          </CardContent>
        </Card>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Avatar className="h-16 w-16 mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-lg font-semibold">
                      {getInitials(teacher.user.full_name || `${teacher.user.first_name} ${teacher.user.last_name}`)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-1">{teacher.user.full_name || `${teacher.user.first_name} ${teacher.user.last_name}`}</h3>
                  <Badge variant="outline" className="font-mono text-xs">
                    {teacher.teacher_code}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Môn dạy:</span>
                    {teacher.subject ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {teacher.subject}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lớp chủ nhiệm:</span>
                    <span className="font-medium">{teacher.homeroom_class_count || 0} lớp</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium truncate">{teacher.user.email}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleViewTeacher(teacher)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditTeacher(teacher)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(teacher)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, teacher: null })}
        onConfirm={handleDeleteConfirm}
        title="Xóa Giáo Viên"
        description="Bạn có chắc chắn muốn xóa giáo viên này không? Hành động này không thể hoàn tác."
        itemName={deleteModal.teacher?.user.full_name || `${deleteModal.teacher?.user.first_name} ${deleteModal.teacher?.user.last_name}` || ''}
      />
    </div>
  );
} 