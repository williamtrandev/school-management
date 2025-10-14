import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Removed Tabs components as no longer needed
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import ModernEventList from '@/components/ModernEventList';
import StudentPermissionStatus from '@/components/StudentPermissionStatus';

export default function Events() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Removed stats logic as statistics cards are no longer displayed

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sự Kiện Thi Đua
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-lg">
            Quản lý và theo dõi các sự kiện thi đua nề nếp của học sinh
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <Button 
              onClick={() => navigate('/events/create')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo Sự Kiện
            </Button>
          )}
        </div>
      </div>

      {/* Student Permission Status */}
      {user?.role === 'student' && (
        <StudentPermissionStatus />
      )}


      {/* Main Content */}
      <ModernEventList onRefresh={() => {}} />
    </div>
  );
} 