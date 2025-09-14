import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Plus, Upload, Award } from 'lucide-react';
import StudentList from '@/components/StudentList';
import StudentImport from '@/components/StudentImport';
import StudentBehavior from '@/components/StudentBehavior';
import StudentForm from '@/components/StudentForm';
import StudentDetail from '@/components/StudentDetail';

export default function Students() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on URL path
  const getActiveTab = () => {
    const pathname = location.pathname;
    
    if (pathname.includes('/create')) return 'form';
    if (pathname.includes('/import')) return 'import';
    if (pathname.includes('/behavior')) return 'behavior';
    if (pathname.includes('/edit')) return 'form';
    
    // Check if it's a student detail page (e.g., /students/123)
    if (pathname.match(/^\/students\/[^\/]+$/) && !pathname.includes('/create') && !pathname.includes('/edit') && !pathname.includes('/import') && !pathname.includes('/behavior')) {
      return 'detail';
    }
    
    return 'list';
  };

  const activeTab = getActiveTab();

  // Debug logging
  console.log('Students page rendered with:', {
    pathname: location.pathname,
    activeTab,
    isDetailPage: location.pathname.match(/^\/students\/[^\/]+$/) && !location.pathname.includes('/create') && !location.pathname.includes('/edit') && !location.pathname.includes('/import') && !location.pathname.includes('/behavior')
  });

  return (
    <div className="container mx-auto py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Quản Lý Học Sinh
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin học sinh, tạo mới, chỉnh sửa, import từ Excel và chấm điểm nề nết
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        if (value === 'list') navigate('/students');
        else if (value === 'form') navigate('/students/create');
        else if (value === 'import') navigate('/students/import');
        else if (value === 'behavior') navigate('/students/behavior');
        // Note: detail tab is automatically activated when viewing a specific student
        // No need to navigate when clicking on detail tab
      }} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Danh Sách Học Sinh
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm Mới/Chỉnh Sửa
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Excel
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Chấm Điểm Nề Nết
          </TabsTrigger>
          <TabsTrigger value="detail" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Chi Tiết
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <StudentList />
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <StudentForm />
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <StudentImport />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <StudentBehavior />
        </TabsContent>

        <TabsContent value="detail" className="space-y-6">
          <StudentDetail />
        </TabsContent>
      </Tabs>
    </div>
  );
}