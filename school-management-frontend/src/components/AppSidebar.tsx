import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Calendar, 
  School,
  Trophy,
  ClipboardCheck,
  LogOut,
  Activity
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Menu items based on user role

const adminItems = [
  { title: "Sự kiện thi đua", url: "/events", icon: Activity },
  { title: "Quản lý lớp", url: "/classes", icon: School },
  { title: "Học sinh", url: "/students", icon: GraduationCap },
  { title: "Giáo viên", url: "/teachers", icon: Users },
  { title: "Bảng xếp hạng", url: "/rankings", icon: Trophy },
];

const teacherItems = [
  { title: "Sự kiện thi đua", url: "/events", icon: Activity },
  { title: "Lớp của tôi", url: "/my-class", icon: School },
  { title: "Bảng xếp hạng", url: "/rankings", icon: Trophy },
];

const studentItems = [
  { title: "Sự kiện thi đua", url: "/events", icon: Activity },
  { title: "Lớp của tôi", url: "/my-class", icon: School },
  { title: "Bảng xếp hạng", url: "/rankings", icon: Trophy },
];

function getMenuItems(role: "admin" | "teacher" | "student") {
  switch (role) {
    case "admin":
      return adminItems;
    case "teacher":
      return teacherItems;
    case "student":
      return studentItems;
    default:
      return adminItems;
  }
}

export function AppSidebar() {
  const { state, open, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  
  const items = getMenuItems(user?.role || "admin");

  const isActive = (path: string) => {
    if (path === "/rankings") {
      return currentPath === "/rankings";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-card" 
      : "hover:bg-accent/50 transition-colors";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r border-border"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground flex-shrink-0">
            <School className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <h2 className="text-sm font-semibold truncate">Thi đua nề nếp</h2>
            <p className="text-xs text-muted-foreground truncate">Trường THPT ABC</p>
          </div>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="mt-4 pt-4 border-t border-border group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user.full_name ? user.full_name.charAt(0) : (user.username ? user.username.charAt(0) : 'U')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user.full_name || `${user.first_name} ${user.last_name}` || user.username || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {user.role === 'admin' ? 'Quản trị viên' : 
                   user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="mb-3 text-sm font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">Menu chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                  >
                    <NavLink 
                      to={item.url} 
                      className={`${getNavCls} py-3`}
                      style={{
                        color: isActive(item.url) ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Logout Button */}
        {user && (
          <div className="mt-auto p-2">
            <SidebarMenuButton
              onClick={() => logout()}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Đăng xuất</span>
            </SidebarMenuButton>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}