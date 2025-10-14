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
import { Student } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Classroom {
  id: string;
  name: string;
  full_name: string;
}

export default function StudentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filters, setFilters] = useState({
    search: '',
    classroom_id: 'all',
    gender: 'all',
    ordering: 'user__first_name'
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    student: Student | null;
  }>({ isOpen: false, student: null });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load students
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.classroom_id !== 'all') params.classroom_id = filters.classroom_id;
      if (filters.gender !== 'all') params.gender = filters.gender;
      if (filters.ordering) params.ordering = filters.ordering;
      
      const studentsData = await apiService.getStudents(params);
      setStudents(studentsData);
      
      // Load classrooms for filter
      const classroomsData = await apiService.getClassrooms();
      setClassrooms(classroomsData);

      // If teacher and no class selected, default to homeroom class
      if (user?.role === 'teacher' && filters.classroom_id === 'all') {
        const myClasses = classroomsData.filter((c: any) => c.homeroom_teacher && c.homeroom_teacher.id === user.id);
        if (myClasses.length > 0) {
          setFilters(prev => ({ ...prev, classroom_id: myClasses[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách học sinh',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (student: Student) => {
    setDeleteModal({ isOpen: true, student });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.student) return;
    
    try {
      await apiService.deleteStudent(deleteModal.student.id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa học sinh',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa học sinh',
        variant: 'destructive',
      });
    } finally {
      setDeleteModal({ isOpen: false, student: null });
    }
  };

  const handleAddStudent = () => {
    navigate('/students/create');
  };

  const handleEditStudent = (student: Student) => {
    navigate(`/students/${student.id}/edit`);
  };

  const handleViewStudent = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderLabel = (gender: string) => {
    return gender === 'male' ? 'Nam' : 'Nữ';
  };

  const getGenderBadgeVariant = (gender: string) => {
    return gender === 'male' ? 'default' : 'secondary';
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />;
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const maleCount = students.filter(s => s.gender === 'male').length;
  const femaleCount = students.filter(s => s.gender === 'female').length;

  // Client-side pagination (fallback if backend not paginated)
  const total = students.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pagedStudents = students.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng học sinh</p>
                <p className="text-3xl font-bold text-blue-700">{students.length}</p>
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
                <p className="text-sm font-medium text-green-600">Nam</p>
                <p className="text-3xl font-bold text-green-700">{maleCount}</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600">Nữ</p>
                <p className="text-3xl font-bold text-pink-700">{femaleCount}</p>
              </div>
              <div className="h-12 w-12 bg-pink-500 rounded-full flex items-center justify-center">
                <UserX className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Lớp học</p>
                <p className="text-3xl font-bold text-purple-700">{classrooms.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Bộ Lọc & Tìm Kiếm
              </CardTitle>
              <CardDescription>
                Tìm kiếm và lọc danh sách học sinh
              </CardDescription>
            </div>
            <Button 
              onClick={() => navigate('/students/create')}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Học Sinh Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tên, mã học sinh, email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 border-0 bg-white shadow-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Lớp học</label>
              <Select
                value={filters.classroom_id}
                onValueChange={(value) => setFilters(prev => ({ ...prev, classroom_id: value }))}
              >
                <SelectTrigger className="border-0 bg-white shadow-sm">
                  <SelectValue placeholder="Chọn lớp" />
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
              <label className="text-sm font-medium">Giới tính</label>
              <Select
                value={filters.gender}
                onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className="border-0 bg-white shadow-sm">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
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
                  <SelectItem value="student_code">Mã học sinh</SelectItem>
                  <SelectItem value="created_at">Ngày tạo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-3 sm:gap-4">
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
      {/* Students Display */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Đang tải danh sách học sinh...</p>
            </div>
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có học sinh nào</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.classroom_id !== 'all' || filters.gender !== 'all'
                  ? 'Không tìm thấy học sinh phù hợp với bộ lọc'
                  : 'Chưa có học sinh nào trong hệ thống'}
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={handleAddStudent}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm học sinh đầu tiên
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        // Table View
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh Sách Học Sinh</span>
              <Badge variant="secondary" className="text-sm">
                {students.length} học sinh
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Học Sinh</TableHead>
                    <TableHead className="font-semibold">Mã HS</TableHead>
                    <TableHead className="font-semibold">Lớp</TableHead>
                    <TableHead className="font-semibold">Giới tính</TableHead>
                    <TableHead className="font-semibold">Tuổi</TableHead>
                    <TableHead className="font-semibold">Liên hệ</TableHead>
                    <TableHead className="font-semibold text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {getInitials(student.user.full_name || `${student.user.first_name} ${student.user.last_name}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{student.user.full_name || `${student.user.first_name} ${student.user.last_name}`}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {student.student_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {student.classroom.full_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getGenderBadgeVariant(student.gender)} className="flex items-center gap-1 w-fit">
                          {getGenderIcon(student.gender)}
                          {getGenderLabel(student.gender)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{calculateAge(student.date_of_birth)}</span>
                          <span className="text-muted-foreground text-sm">tuổi</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.parent_phone ? (
                          <div className="flex items-center gap-1 text-sm">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            {student.parent_phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleViewStudent(student)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditStudent(student)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(student)}
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
          {pagedStudents.map((student) => (
            <Card key={student.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Avatar className="h-16 w-16 mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg font-semibold">
                      {getInitials(student.user.full_name || `${student.user.first_name} ${student.user.last_name}`)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-1">{student.user.full_name || `${student.user.first_name} ${student.user.last_name}`}</h3>
                  <Badge variant="outline" className="font-mono text-xs">
                    {student.student_code}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lớp:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {student.classroom.full_name}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Giới tính:</span>
                    <Badge variant={getGenderBadgeVariant(student.gender)} className="flex items-center gap-1">
                      {getGenderIcon(student.gender)}
                      {getGenderLabel(student.gender)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tuổi:</span>
                    <span className="font-medium">{calculateAge(student.date_of_birth)} tuổi</span>
                  </div>
                  
                  {student.parent_phone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">SĐT:</span>
                      <span className="font-medium">{student.parent_phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleViewStudent(student)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditStudent(student)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(student)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {students.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium">{total === 0 ? 0 : startIndex + 1}</span>–<span className="font-medium">{endIndex}</span> trong <span className="font-medium">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 / trang</SelectItem>
                <SelectItem value="12">12 / trang</SelectItem>
                <SelectItem value="24">24 / trang</SelectItem>
                <SelectItem value="48">48 / trang</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Trước</Button>
              <div className="text-sm">{currentPage}/{totalPages}</div>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Sau</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, student: null })}
        onConfirm={handleDeleteConfirm}
        title="Xóa Học Sinh"
        description="Bạn có chắc chắn muốn xóa học sinh này không? Hành động này không thể hoàn tác."
        itemName={deleteModal.student?.user.full_name || `${deleteModal.student?.user.first_name} ${deleteModal.student?.user.last_name}` || ''}
      />
    </div>
  );
} 