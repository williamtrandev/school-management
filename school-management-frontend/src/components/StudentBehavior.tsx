import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Users, 
  Filter,
  Plus,
  Eye,
  Calendar,
  Award,
  XCircle,
  UserPlus
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Student, Classroom } from '@/services/api';

interface BehaviorRecord {
  id: string;
  student: Student;
  violation_type: string;
  description: string;
  points_deducted: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  notes?: string;
}

interface ViolationType {
  id: string;
  name: string;
  points_deducted: number;
  description: string;
}

export default function StudentBehavior() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>([]);
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    classroom_id: 'all',
    status: 'all',
    search: ''
  });
  const [activeTab, setActiveTab] = useState('self');
  const [newViolation, setNewViolation] = useState({
    student_id: '',
    violation_type_id: '',
    description: '',
    points_deducted: 0
  });
  const { toast } = useToast();

  // Debug: Log khi component mount
  console.log('StudentBehavior component mounted');

  useEffect(() => {
    console.log('StudentBehavior useEffect triggered');
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading data...');
      
      // Load data
      const [studentsData, classroomsData, recordsData, typesData] = await Promise.all([
        apiService.getStudents(),
        apiService.getClassrooms(),
        apiService.getBehaviorRecords(filters),
        Promise.resolve([ // Placeholder violation types
          { id: '1', name: 'Đi muộn', points_deducted: 2, description: 'Đi học muộn' },
          { id: '2', name: 'Nói chuyện riêng', points_deducted: 1, description: 'Nói chuyện trong giờ học' },
          { id: '3', name: 'Không làm bài tập', points_deducted: 3, description: 'Không hoàn thành bài tập về nhà' },
          { id: '4', name: 'Vi phạm nội quy', points_deducted: 5, description: 'Vi phạm các quy định của trường' }
        ])
      ]);
      
      console.log('Data loaded:', { studentsData, classroomsData, recordsData, typesData });
      
      setStudents(studentsData);
      setClassrooms(classroomsData);
      setBehaviorRecords(recordsData);
      setViolationTypes(typesData);
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

  const handleAddViolation = async () => {
    console.log('Adding violation:', newViolation);
    
    if (!newViolation.violation_type_id || !newViolation.description) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    // Nếu là tab "other", cần chọn học sinh
    if (activeTab === 'other' && !newViolation.student_id) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn học sinh vi phạm',
        variant: 'destructive',
      });
      return;
    }

    try {
      const violationType = violationTypes.find(t => t.id === newViolation.violation_type_id);
      if (!violationType) {
        toast({
          title: 'Lỗi',
          description: 'Loại vi phạm không hợp lệ',
          variant: 'destructive',
        });
        return;
      }

      const violationData: any = {
        violation_type: violationType.name,
        description: newViolation.description,
        points_deducted: violationType.points_deducted
      };

      // Nếu là tạo vi phạm cho người khác, thêm student_id
      if (activeTab === 'other' && newViolation.student_id) {
        violationData.student_id = newViolation.student_id;
      }

      console.log('Sending violation data:', violationData);

      await apiService.createBehaviorRecord(violationData);
      
      toast({
        title: 'Thành công',
        description: activeTab === 'self' ? 'Đã báo cáo vi phạm của bạn' : 'Đã báo cáo vi phạm của học sinh',
      });
      
      setNewViolation({
        student_id: '',
        violation_type_id: '',
        description: '',
        points_deducted: 0
      });
      loadData();
    } catch (error: any) {
      console.error('Error adding violation:', error);
      
      let errorMessage = 'Không thể báo cáo vi phạm';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleApproveRecord = async (recordId: string) => {
    try {
      await apiService.updateBehaviorRecord(recordId, {
        status: 'approved'
      });
      toast({
        title: 'Thành công',
        description: 'Đã duyệt vi phạm',
      });
      loadData();
    } catch (error) {
      console.error('Error approving record:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể duyệt vi phạm',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRecord = async (recordId: string, notes: string) => {
    try {
      await apiService.updateBehaviorRecord(recordId, {
        status: 'rejected',
        rejection_notes: notes
      });
      toast({
        title: 'Thành công',
        description: 'Đã từ chối vi phạm',
      });
      loadData();
    } catch (error) {
      console.error('Error rejecting record:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối vi phạm',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const resetForm = () => {
    setNewViolation({
      student_id: '',
      violation_type_id: '',
      description: '',
      points_deducted: 0
    });
  };

  console.log('Rendering StudentBehavior with state:', { 
    activeTab, 
    students: students.length, 
    classrooms: classrooms.length, 
    behaviorRecords: behaviorRecords.length,
    violationTypes: violationTypes.length,
    loading 
  });

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <strong>Debug Info:</strong> Component đang render với {students.length} học sinh, {classrooms.length} lớp học, {behaviorRecords.length} vi phạm
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Chấm Điểm Nề Nết
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý vi phạm và chấm điểm nề nết học sinh
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng vi phạm</p>
                <p className="text-3xl font-bold text-blue-700">{behaviorRecords.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Chờ duyệt</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {behaviorRecords.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Đã duyệt</p>
                <p className="text-3xl font-bold text-green-700">
                  {behaviorRecords.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Tổng điểm trừ</p>
                <p className="text-3xl font-bold text-red-700">
                  {behaviorRecords
                    .filter(r => r.status === 'approved')
                    .reduce((sum, r) => sum + r.points_deducted, 0)
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-red-500 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different violation creation modes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-orange-600" />
            Báo Cáo Vi Phạm
          </CardTitle>
          <CardDescription>
            Chọn chế độ báo cáo vi phạm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="self" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Vi Phạm Của Bạn
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Vi Phạm Của Bạn Khác
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="self" className="space-y-4 mt-6">
              <div className="text-center py-4">
                <User className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-2">Báo Cáo Vi Phạm Của Bạn</h3>
                <p className="text-muted-foreground">Ghi nhận vi phạm của bản thân để giáo viên chủ nhiệm duyệt</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="violation_type">Loại vi phạm</Label>
                  <Select value={newViolation.violation_type_id} onValueChange={(value) => {
                    const type = violationTypes.find(t => t.id === value);
                    setNewViolation(prev => ({ 
                      ...prev, 
                      violation_type_id: value,
                      points_deducted: type?.points_deducted || 0
                    }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại vi phạm" />
                    </SelectTrigger>
                    <SelectContent>
                      {violationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} (-{type.points_deducted} điểm)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="points">Điểm trừ</Label>
                  <Input
                    type="number"
                    value={newViolation.points_deducted}
                    onChange={(e) => setNewViolation(prev => ({ ...prev, points_deducted: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="10"
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Điểm trừ được tính tự động theo loại vi phạm
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                  placeholder="Mô tả chi tiết vi phạm của bạn..."
                  value={newViolation.description}
                  onChange={(e) => setNewViolation(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Xóa Form
                </Button>
                <Button onClick={handleAddViolation} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  Báo Cáo Vi Phạm Của Bạn
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="other" className="space-y-4 mt-6">
              <div className="text-center py-4">
                <UserPlus className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-2">Báo Cáo Vi Phạm Của Bạn Khác</h3>
                <p className="text-muted-foreground">Báo cáo vi phạm của học sinh khác trong cùng lớp</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Chọn học sinh</Label>
                  <Select value={newViolation.student_id} onValueChange={(value) => setNewViolation(prev => ({ ...prev, student_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn học sinh vi phạm" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.user.full_name || `${student.user.first_name} ${student.user.last_name}`} - {student.classroom?.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="violation_type">Loại vi phạm</Label>
                  <Select value={newViolation.violation_type_id} onValueChange={(value) => {
                    const type = violationTypes.find(t => t.id === value);
                    setNewViolation(prev => ({ 
                      ...prev, 
                      violation_type_id: value,
                      points_deducted: type?.points_deducted || 0
                    }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại vi phạm" />
                    </SelectTrigger>
                    <SelectContent>
                      {violationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} (-{type.points_deducted} điểm)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="points">Điểm trừ</Label>
                  <Input
                    type="number"
                    value={newViolation.points_deducted}
                    onChange={(e) => setNewViolation(prev => ({ ...prev, points_deducted: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="10"
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Điểm trừ được tính tự động theo loại vi phạm
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                  placeholder="Mô tả chi tiết vi phạm của học sinh..."
                  value={newViolation.description}
                  onChange={(e) => setNewViolation(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Xóa Form
                </Button>
                <Button onClick={handleAddViolation} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Báo Cáo Vi Phạm Của Bạn Khác
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-600" />
            Bộ Lọc & Tìm Kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lớp học</label>
              <Select value={filters.classroom_id} onValueChange={(value) => setFilters(prev => ({ ...prev, classroom_id: value }))}>
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
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tên học sinh, mô tả..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 border-0 bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Records Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Danh Sách Vi Phạm
          </CardTitle>
          <CardDescription>
            Quản lý và duyệt các vi phạm của học sinh
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : behaviorRecords.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có vi phạm nào</h3>
              <p className="text-muted-foreground">Hãy thêm vi phạm đầu tiên để bắt đầu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học sinh</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Loại vi phạm</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Điểm trừ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {behaviorRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{record.student.user.full_name || `${record.student.user.first_name} ${record.student.user.last_name}`}</div>
                            <div className="text-sm text-muted-foreground">{record.student.student_code}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.student.classroom.full_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{record.violation_type}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={record.description}>
                          {record.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">-{record.points_deducted}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(record.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApproveRecord(record.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleRejectRecord(record.id, '')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Từ chối
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
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
    </div>
  );
} 