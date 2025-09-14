import React from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import ClassroomList from '@/components/ClassroomList';
import ClassroomForm from '@/components/ClassroomForm';

export default function Classes() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine active tab based on URL path and query params
  const getActiveTab = () => {
    if (location.pathname.includes('/create') || location.pathname.includes('/edit')) return 'form';
    return 'list';
  };

  const activeTab = getActiveTab();

  return (
    <div className="container mx-auto py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Quản Lý Lớp Học
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin lớp học, tạo mới và chỉnh sửa
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        if (value === 'list') navigate('/classes');
        else if (value === 'form') navigate('/classes/create');
      }} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Danh Sách Lớp Học
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm Mới/Chỉnh Sửa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <ClassroomList />
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          {(location.pathname.includes('/create') || location.pathname.includes('/edit')) && (
            <ClassroomForm />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}