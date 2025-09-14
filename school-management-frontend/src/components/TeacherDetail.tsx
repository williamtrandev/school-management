import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Mail, 
  Calendar, 
  Users, 
  Edit, 
  ArrowLeft,
  Award,
  Clock,
  Loader2
} from 'lucide-react';
import { Teacher, apiService } from '@/services/api';
import { toast } from 'sonner';

export default function TeacherDetail() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const teacherData = await apiService.getTeacher(teacherId!);
        setTeacher(teacherData);
      } catch (err) {
        console.error('Error fetching teacher detail:', err);
        setError('Không thể tải thông tin giáo viên');
        toast.error('Không thể tải thông tin giáo viên');
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacherDetail();
    }
  }, [teacherId]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBack = () => {
    navigate('/teachers');
  };

  const handleEdit = () => {
    if (teacher) {
      navigate(`/teachers/${teacher.id}/edit`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải thông tin giáo viên...</span>
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Lỗi</h2>
          <p className="text-muted-foreground">{error || 'Không tìm thấy thông tin giáo viên'}</p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chi Tiết Giáo Viên</h1>
            <p className="text-muted-foreground">
              Thông tin chi tiết về giáo viên
            </p>
          </div>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông Tin Cá Nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl font-semibold">
                    {getInitials(teacher.user.full_name || `${teacher.user.first_name} ${teacher.user.last_name}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{teacher.user.full_name || `${teacher.user.first_name} ${teacher.user.last_name}`}</h2>
                  <p className="text-muted-foreground">{teacher.user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="font-mono">
                      {teacher.teacher_code}
                    </Badge>
                    <Badge variant="secondary">
                      Giáo viên
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                  <p className="font-medium">{teacher.user.full_name || `${teacher.user.first_name} ${teacher.user.last_name}`}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tên đăng nhập</label>
                  <p className="font-medium">{teacher.user.username}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{teacher.user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{formatDate(teacher.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Thông Tin Chuyên Môn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mã giáo viên</label>
                  <Badge variant="outline" className="font-mono text-base">
                    {teacher.teacher_code}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Môn dạy</label>
                  {teacher.subject ? (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {teacher.subject}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Chưa cập nhật</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Homeroom Classes */}
          {teacher.homeroom_classes && teacher.homeroom_classes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Lớp Chủ Nhiệm
                </CardTitle>
                <CardDescription>
                  Danh sách các lớp mà giáo viên đang chủ nhiệm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teacher.homeroom_classes.map((classroom) => (
                    <div key={classroom.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{classroom.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Khối {classroom.grade.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Chủ nhiệm
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Thống Kê
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {teacher.homeroom_class_count || 0}
                </div>
                <div className="text-sm text-muted-foreground">Lớp chủ nhiệm</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {teacher.homeroom_classes?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Lớp hiện tại</div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hoạt Động Gần Đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Đăng nhập lần cuối</span>
                  <span className="text-muted-foreground ml-auto">Hôm nay</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Cập nhật thông tin</span>
                  <span className="text-muted-foreground ml-auto">
                    {formatDate(teacher.updated_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <span>Tham gia hệ thống</span>
                  <span className="text-muted-foreground ml-auto">
                    {formatDate(teacher.created_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Liên Hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{teacher.user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tên đăng nhập</p>
                  <p className="text-sm text-muted-foreground">{teacher.user.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 