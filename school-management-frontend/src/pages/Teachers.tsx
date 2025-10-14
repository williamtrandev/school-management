import React from 'react';
import { useParams, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Plus, Upload } from 'lucide-react';
import TeacherList from '@/components/TeacherList';
import TeacherForm from '@/components/TeacherForm';
import TeacherImport from '@/components/TeacherImport';

export default function Teachers() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine active tab based on URL path
  const getActiveTab = () => {
    if (location.pathname.includes('/create') || location.pathname.includes('/edit')) return 'form';
    if (location.pathname.includes('/import')) return 'import';
    return 'list';
  };

  const activeTab = getActiveTab();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Quản Lý Giáo Viên
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Quản lý thông tin giáo viên, tạo mới, chỉnh sửa và import từ Excel
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        if (value === 'list') navigate('/teachers');
        else if (value === 'form') navigate('/teachers/create');
        else if (value === 'import') navigate('/teachers/import');
      }} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-lg">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Danh Sách Giáo Viên</span>
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{location.pathname.includes('/edit') ? 'Chỉnh Sửa' : 'Thêm Mới'}</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import Excel</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 sm:space-y-6">
          <TeacherList />
        </TabsContent>

        <TabsContent value="form" className="space-y-4 sm:space-y-6">
          {(location.pathname.includes('/create') || location.pathname.includes('/edit')) && (
            <TeacherForm />
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-4 sm:space-y-6">
          <TeacherImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}