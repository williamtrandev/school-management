import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Info,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function TeacherImport() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast({
          title: 'Lỗi',
          description: 'Chỉ chấp nhận file Excel (.xlsx hoặc .xls)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'Lỗi',
          description: 'File quá lớn. Kích thước tối đa là 5MB',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      console.log('Starting template download...');
      const blob = await apiService.downloadTeacherTemplate();
      console.log('Template blob received:', blob);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teacher_import_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Thành công',
        description: 'Đã tải template thành công',
      });
    } catch (error: any) {
      console.error('Error downloading template:', error);
      console.error('Template download error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Không thể tải template';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file để upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('Starting upload for file:', file.name, 'Size:', file.size);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('Calling apiService.importTeachers...');
      const result = await apiService.importTeachers(file);
      console.log('Upload result:', result);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setImportResult(result);

      if (result.success_count > 0) {
        toast({
          title: 'Thành công',
          description: `Đã import ${result.success_count} giáo viên thành công`,
        });
      }

      if (result.error_count > 0) {
        toast({
          title: 'Có lỗi',
          description: `${result.error_count} dòng có lỗi. Vui lòng kiểm tra chi tiết bên dưới`,
          variant: 'destructive',
        });
      }

      // Reset file input
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('Error importing teachers:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Không thể import file';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatErrors = (errors: any) => {
    if (typeof errors === 'string') return errors;
    if (typeof errors === 'object') {
      return Object.entries(errors)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${messages}`;
        })
        .join('; ');
    }
    return 'Lỗi không xác định';
  };

  return (
    <div className="space-y-6">

      {/* Instructions Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            Hướng Dẫn Import
          </CardTitle>
          <CardDescription className="text-blue-600">
            Làm theo các bước sau để import giáo viên thành công
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">Bước 1: Tải Template</h4>
              <ul className="space-y-2 text-sm text-blue-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Click nút "Tải Template" bên dưới</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Template sẽ chứa cấu trúc cột chuẩn</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Và dữ liệu mẫu để tham khảo</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">Bước 2: Chuẩn Bị Dữ Liệu</h4>
              <ul className="space-y-2 text-sm text-blue-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Điền thông tin giáo viên vào template</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Đảm bảo các cột bắt buộc không để trống</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Username, email, teacher_code phải là duy nhất</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-700 mb-3">Cấu Trúc File Excel:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-600 mb-2">Cột Bắt Buộc:</h5>
                <ul className="space-y-1 text-blue-600">
                  <li><strong>username:</strong> Tên đăng nhập (duy nhất)</li>
                  <li><strong>email:</strong> Email (duy nhất)</li>
                  <li><strong>password:</strong> Mật khẩu (tối thiểu 6 ký tự)</li>
                  <li><strong>first_name:</strong> Tên</li>
                  <li><strong>last_name:</strong> Họ</li>
                  <li><strong>teacher_code:</strong> Mã giáo viên (duy nhất)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-600 mb-2">Cột Tùy Chọn:</h5>
                <ul className="space-y-1 text-blue-600">
                  <li><strong>subject:</strong> Môn dạy</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Download */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Tải Template
            </CardTitle>
            <CardDescription>
              Tải file template Excel với cấu trúc chuẩn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleDownloadTemplate}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              disabled={uploading}
            >
              <Download className="h-4 w-4 mr-2" />
              Tải Template Excel
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Template bao gồm cấu trúc cột và dữ liệu mẫu
            </p>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload File
            </CardTitle>
            <CardDescription>
              Chọn file Excel đã chuẩn bị để import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  {file ? file.name : 'Click để chọn file Excel'}
                </p>
                <p className="text-xs text-gray-500">
                  Hỗ trợ .xlsx và .xls (tối đa 5MB)
                </p>
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">{file.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
            )}

            <Button 
              onClick={handleUpload}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={!file || uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Đang Import...' : 'Import Giáo Viên'}
            </Button>

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  Đang xử lý file... {uploadProgress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Results */}
      {importResult && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Kết Quả Import
            </CardTitle>
            <CardDescription>
              Tổng quan kết quả import giáo viên
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {importResult.success_count}
                </div>
                <div className="text-sm text-green-600">Thành công</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <div className="text-2xl font-bold text-red-700">
                  {importResult.error_count}
                </div>
                <div className="text-sm text-red-600">Có lỗi</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-700">
                  {importResult.success_count + importResult.error_count}
                </div>
                <div className="text-sm text-blue-600">Tổng cộng</div>
              </div>
            </div>

            {/* Success Details */}
            {importResult.success_data && importResult.success_data.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Danh Sách Import Thành Công
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importResult.success_data.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          Dòng {item.row}
                        </Badge>
                        <div>
                          <div className="font-medium text-green-700">{item.full_name}</div>
                          <div className="text-sm text-green-600">
                            {item.username} • {item.teacher_code}
                          </div>
                        </div>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Details */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Chi Tiết Lỗi
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importResult.errors.map((error: any, index: number) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">Dòng {error.row}:</div>
                        <div className="text-sm mt-1">
                          {formatErrors(error.errors)}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 