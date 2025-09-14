import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Users, 
  Filter,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  BookOpen,
  Calendar,
  Table as TableIcon
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Classroom, Grade, User } from '@/services/api';

export default function ClassroomList() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filters, setFilters] = useState({
    grade_id: 'all',
    search: '',
    ordering: 'grade__name'
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    classroom: Classroom | null;
  }>({ isOpen: false, classroom: null });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load classrooms
      const params: any = {};
      if (filters.grade_id !== 'all') params.grade_id = filters.grade_id;
      if (filters.search) params.search = filters.search;
      if (filters.ordering) params.ordering = filters.ordering;
      
      const [classroomsData, gradesData, teachersData] = await Promise.all([
        apiService.getClassrooms(params),
        apiService.getGrades(),
        apiService.getTeachers()
      ]);
      
      setClassrooms(classroomsData);
      setGrades(gradesData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (classroom: Classroom) => {
    setDeleteModal({ isOpen: true, classroom });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.classroom) return;
    
    try {
      await apiService.deleteClassroom(deleteModal.classroom.id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa lớp học',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting classroom:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa lớp học',
        variant: 'destructive',
      });
    } finally {
      setDeleteModal({ isOpen: false, classroom: null });
    }
  };

  const handleAddClassroom = () => {
    navigate('/classes/create');
  };

  const handleEditClassroom = (classroom: Classroom) => {
    navigate(`/classes/${classroom.id}/edit`);
  };

  const handleViewClassroom = (classroom: Classroom) => {
    navigate(`/classes/${classroom.id}`);
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Chưa phân công';
  };

  const getGradeName = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.name : '';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách lớp học
          </CardTitle>
          <Button onClick={handleAddClassroom} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm lớp học
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm lớp học..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.grade_id} onValueChange={(value) => setFilters(prev => ({ ...prev, grade_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khối" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khối</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  Khối {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* The following filters are not directly tied to the API call in the new_code,
              so they are removed as per the new_code's simplified filter state. */}
          {/*
          <Select value={filters.is_special} onValueChange={(value) => setFilters(prev => ({ ...prev, is_special: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Loại lớp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Lớp đặc biệt</SelectItem>
              <SelectItem value="false">Lớp thường</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.homeroom_teacher} onValueChange={(value) => setFilters(prev => ({ ...prev, homeroom_teacher: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Giáo viên chủ nhiệm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giáo viên</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          */}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên lớp</TableHead>
                <TableHead>Khối</TableHead>
                <TableHead>Giáo viên chủ nhiệm</TableHead>
                <TableHead>Số học sinh</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : classrooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không có lớp học nào
                  </TableCell>
                </TableRow>
              ) : (
                classrooms.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {classroom.full_name}
                        {classroom.is_special && <GraduationCap className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>Khối {classroom.grade.name}</TableCell>
                    <TableCell>
                      {classroom.homeroom_teacher ? (
                        `${classroom.homeroom_teacher.first_name} ${classroom.homeroom_teacher.last_name}`
                      ) : (
                        <span className="text-muted-foreground">Chưa phân công</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {classroom.student_count || 0} học sinh
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={classroom.is_special ? "default" : "secondary"}>
                        {classroom.is_special ? "Đặc biệt" : "Thường"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClassroom(classroom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewClassroom(classroom)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(classroom)}
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
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, classroom: null })}
        onConfirm={handleDeleteConfirm}
        title="Xóa lớp học"
        description="Bạn có chắc chắn muốn xóa lớp học"
        itemName={deleteModal.classroom?.full_name}
        isLoading={false} // isLoading is removed from state, so it's always false
      />
    </Card>
  );
} 