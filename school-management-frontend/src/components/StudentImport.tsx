import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  success_count: number;
  error_count: number;
  errors?: Array<{ row: number; error: string }>;
  message: string;
}

export default function StudentImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast({
          title: 'Lỗi',
          description: 'Chỉ chấp nhận file Excel (.xlsx, .xls)',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'Lỗi',
          description: 'File quá lớn (tối đa 5MB)',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const blob = await apiService.downloadStudentTemplate();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'student_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Thành công',
        description: 'Đã tải template Excel',
      });
    } catch (error) {
      console.error('Download template error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải template',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file Excel',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await apiService.importStudents(file);
      setImportResult(result);
      
      if (result.success_count > 0) {
        toast({
          title: 'Thành công',
          description: `Import thành công ${result.success_count} học sinh`,
        });
      }
      
      if (result.error_count > 0) {
        toast({
          title: 'Có lỗi',
          description: `Import thành công ${result.success_count} học sinh, ${result.error_count} lỗi`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Lỗi',
        description: error.response?.data?.error || 'Không thể import file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setImportResult(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Tải Template Excel
          </CardTitle>
          <CardDescription>
            Tải file template Excel để nhập danh sách học sinh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleDownloadTemplate} 
            disabled={isDownloading}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Đang tải...' : 'Tải Template'}
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Học Sinh
          </CardTitle>
          <CardDescription>
            Chọn file Excel để import danh sách học sinh
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-input">Chọn file Excel</Label>
            <Input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Chỉ chấp nhận file .xlsx, .xls (tối đa 5MB)
            </p>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              disabled={!file || isUploading}
              className="flex-1 sm:flex-none"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Đang import...' : 'Import'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Result */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Kết Quả Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.success_count}
                </div>
                <div className="text-sm text-muted-foreground">Thành công</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.error_count}
                </div>
                <div className="text-sm text-muted-foreground">Lỗi</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.success_count + importResult.error_count}
                </div>
                <div className="text-sm text-muted-foreground">Tổng cộng</div>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{importResult.message}</AlertDescription>
            </Alert>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Chi tiết lỗi:
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-red-50">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Dòng {error.row}</Badge>
                        <span className="text-sm">{error.error}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {importResult.errors.length > 10 && (
                  <p className="text-sm text-muted-foreground">
                    Chỉ hiển thị 10 lỗi đầu tiên
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng Dẫn Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Các cột bắt buộc trong file Excel:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>student_code</strong>: Mã học sinh (phải unique)</li>
              <li><strong>username</strong>: Tên đăng nhập (phải unique)</li>
              <li><strong>email</strong>: Email (phải unique)</li>
              <li><strong>password</strong>: Mật khẩu (tối thiểu 6 ký tự)</li>
              <li><strong>first_name</strong>: Họ</li>
              <li><strong>last_name</strong>: Tên</li>
              <li><strong>classroom_name</strong>: Tên lớp (định dạng: 12A1, 11B2, 10A1 - phải tồn tại trong hệ thống)</li>
              <li><strong>date_of_birth</strong>: Ngày sinh (định dạng YYYY-MM-DD)</li>
              <li><strong>gender</strong>: Giới tính (male/female)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Các cột tùy chọn:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>address</strong>: Địa chỉ</li>
              <li><strong>parent_phone</strong>: Số điện thoại phụ huynh</li>
            </ul>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Lưu ý:</strong> Hệ thống sẽ kiểm tra tính duy nhất của mã học sinh, 
              username và email. Nếu có trùng lặp, dòng đó sẽ bị bỏ qua và hiển thị lỗi.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
} 