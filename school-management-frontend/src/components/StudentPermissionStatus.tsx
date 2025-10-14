import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  User,
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { StudentEventPermission } from '@/services/api';

const StudentPermissionStatus: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [permission, setPermission] = useState<StudentEventPermission | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'student') {
      checkPermission();
    }
  }, [user]);

  const checkPermission = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Lấy thông tin học sinh
      const students = await apiService.getStudents();
      const student = students.find(s => s.user.id === user.id);
      
      if (!student) {
        setError('Không tìm thấy thông tin học sinh');
        return;
      }
      
      // Kiểm tra quyền
      const result = await apiService.checkStudentEventPermission(student.id);
      setHasPermission(result.has_permission);
      setPermission(result.permission || null);
      
      if (!result.has_permission) {
        const reasonMessages = {
          'not_granted': 'Bạn chưa được cấp quyền tạo sự kiện',
          'expired': 'Quyền tạo sự kiện đã hết hạn',
          'inactive': 'Quyền tạo sự kiện đã bị vô hiệu hóa'
        };
        setError(reasonMessages[result.reason as keyof typeof reasonMessages] || 'Không có quyền tạo sự kiện');
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      setError('Không thể kiểm tra quyền tạo sự kiện');
      toast({
        title: 'Lỗi',
        description: 'Không thể kiểm tra quyền tạo sự kiện',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (user?.role !== 'student') {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-muted-foreground">Đang kiểm tra quyền tạo sự kiện...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Trạng thái quyền tạo sự kiện
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={checkPermission}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Kiểm tra lại
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasPermission && permission ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Có quyền tạo sự kiện
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Lớp học:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{permission.classroom_name}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Ngày cấp:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{formatDate(permission.granted_at)}</p>
              </div>
              
              {permission.expires_at && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Hết hạn:</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{formatDateTime(permission.expires_at)}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Người cấp:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{permission.granted_by_name}</p>
              </div>
            </div>
            
            {permission.notes && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Ghi chú:</span>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                  {permission.notes}
                </p>
              </div>
            )}
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Bạn có thể tạo sự kiện thi đua cho chính mình trong lớp {permission.classroom_name}.
                {permission.expires_at && (
                  <span className="block mt-1 text-sm">
                    Quyền sẽ hết hạn vào {formatDateTime(permission.expires_at)}.
                  </span>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate('/student/events/create')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tạo Sự Kiện Thi Đua
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Không có quyền tạo sự kiện
              </Badge>
            </div>
            
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Bạn chưa được cấp quyền tạo sự kiện thi đua. Vui lòng liên hệ giáo viên chủ nhiệm để được cấp quyền.'}
              </AlertDescription>
            </Alert>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Làm thế nào để có quyền tạo sự kiện?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Liên hệ với giáo viên chủ nhiệm của lớp</li>
                <li>• Yêu cầu được cấp quyền tạo sự kiện thi đua</li>
                <li>• Giáo viên sẽ xem xét và cấp quyền nếu phù hợp</li>
                <li>• Quyền có thể có thời hạn hoặc không giới hạn</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentPermissionStatus;
