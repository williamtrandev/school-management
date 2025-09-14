import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Phone, 
  Users, 
  Award,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Student, BehaviorRecord } from '@/services/api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface StudentDetailProps {
  onDelete?: (studentId: string) => void;
}

export default function StudentDetail({ onDelete }: StudentDetailProps) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Debug logging
  console.log('StudentDetail component rendered with studentId:', studentId);

  useEffect(() => {
    console.log('StudentDetail useEffect triggered with studentId:', studentId);
    if (studentId) {
      loadStudent();
      loadBehaviorRecords();
    } else {
      console.log('No studentId provided, showing error state');
      setLoading(false);
    }
  }, [studentId]);

  const loadStudent = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      const data = await apiService.getStudent(studentId);
      setStudent(data);
    } catch (error) {
      console.error('Error loading student:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin học sinh',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBehaviorRecords = async () => {
    if (!studentId) return;
    
    try {
      // Filter behavior records by student ID
      const data = await apiService.getBehaviorRecords();
      const filteredRecords = data.filter(record => record.student.id === studentId);
      setBehaviorRecords(filteredRecords);
    } catch (error) {
      console.error('Error loading behavior records:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/students/${studentId}/edit`);
  };

  const handleDelete = async () => {
    if (!studentId) return;
    
    try {
      await apiService.deleteStudent(studentId);
      toast({
        title: 'Thành công',
        description: 'Đã xóa học sinh',
      });
      
      if (onDelete) {
        onDelete(studentId);
      } else {
        navigate('/students');
      }
    } catch (error: any) {
      console.error('Error deleting student:', error);
      
      let errorMessage = 'Không thể xóa học sinh';
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

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '??';
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin học sinh...</p>
        </div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không có học sinh được chọn</h3>
          <p className="text-muted-foreground mb-4">Vui lòng chọn một học sinh từ danh sách để xem chi tiết</p>
          <Button onClick={() => navigate('/students')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy học sinh</h3>
          <p className="text-muted-foreground">Học sinh bạn đang tìm kiếm không tồn tại</p>
          <Button onClick={() => navigate('/students')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const fullName = student.user.full_name || `${student.user.first_name} ${student.user.last_name}`;
  const initials = getInitials(student.user.first_name, student.user.last_name);

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/students')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Chi Tiết Học Sinh
            </h1>
            <p className="text-muted-foreground mt-1">
              Xem thông tin chi tiết của học sinh
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin cơ bản */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin cá nhân */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Thông Tin Cá Nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{fullName}</h2>
                  <p className="text-muted-foreground">Mã học sinh: {student.student_code}</p>
                  <p className="text-muted-foreground">Username: {student.user.username}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">
                    {student.gender === 'male' ? 'Nam' : 'Nữ'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.classroom?.full_name || 'Chưa phân lớp'}</span>
                </div>
              </div>
              
              {student.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{student.address}</span>
                </div>
              )}
              
              {student.parent_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.parent_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lịch sử vi phạm */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                Lịch Sử Vi Phạm Nề Nết
              </CardTitle>
              <CardDescription>
                Danh sách các vi phạm và điểm trừ của học sinh
              </CardDescription>
            </CardHeader>
            <CardContent>
              {behaviorRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có vi phạm nào</h3>
                  <p className="text-muted-foreground">Học sinh này chưa có vi phạm nề nết nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {behaviorRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </div>
                        <Badge variant="destructive">-{record.points_deducted} điểm</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{record.violation_type}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Ngày tạo: {new Date(record.created_at).toLocaleDateString('vi-VN')}</span>
                        {record.approved_at && (
                          <span>Ngày duyệt: {new Date(record.approved_at).toLocaleDateString('vi-VN')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thống kê nhanh */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Thống Kê Nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {behaviorRecords.length}
                </div>
                <div className="text-sm text-muted-foreground">Tổng vi phạm</div>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {behaviorRecords.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">Vi phạm đã duyệt</div>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {behaviorRecords
                    .filter(r => r.status === 'approved')
                    .reduce((sum, r) => sum + r.points_deducted, 0)
                  }
                </div>
                <div className="text-sm text-muted-foreground">Tổng điểm trừ</div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin tài khoản */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Thông Tin Tài Khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <Badge variant="default" className="bg-green-600">Hoạt động</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ngày tạo:</span>
                <span className="text-sm">
                  {student.created_at ? new Date(student.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cập nhật lần cuối:</span>
                <span className="text-sm">
                  {student.updated_at ? new Date(student.updated_at).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Xóa học sinh"
        description={`Bạn có chắc chắn muốn xóa học sinh "${fullName}"?`}
        itemName={fullName}
      />
    </div>
  );
} 