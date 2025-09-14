import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Events from "./pages/Events";
import Rankings from "./pages/Rankings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider defaultOpen={true}>
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex-1" />
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Tuần 15/2024</span>
                          <span>•</span>
                          <span>04/11/2024 - 10/11/2024</span>
                        </div>
                        <div className="sm:hidden text-xs text-muted-foreground">
                          Tuần 15/2024
                        </div>
                      </header>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/classes" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Classes />
                          </ProtectedRoute>
                        } />
                        <Route path="/classes/:classroomId" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Classes />
                          </ProtectedRoute>
                        } />
                        <Route path="/classes/create" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Classes />
                          </ProtectedRoute>
                        } />
                        <Route path="/classes/:classroomId/edit" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Classes />
                          </ProtectedRoute>
                        } />
                        <Route path="/students" element={
                          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                            <Students />
                          </ProtectedRoute>
                        } />
                        <Route path="/students/create" element={
                          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                            <Students />
                          </ProtectedRoute>
                        } />
                        <Route path="/students/import" element={
                          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                            <Students />
                          </ProtectedRoute>
                        } />
                        <Route path="/students/behavior" element={
                          <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                            <Students />
                          </ProtectedRoute>
                        } />
                        <Route path="/students/:studentId" element={
                          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                            <Students />
                          </ProtectedRoute>
                        } />
                        <Route path="/students/:studentId/edit" element={
                          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                            <Students />
                          </ProtectedRoute>
                        } />
                        <Route path="/teachers" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Teachers />
                          </ProtectedRoute>
                        } />
                        <Route path="/teachers/:teacherId" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Teachers />
                          </ProtectedRoute>
                        } />
                        <Route path="/teachers/create" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Teachers />
                          </ProtectedRoute>
                        } />
                        <Route path="/teachers/:teacherId/edit" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Teachers />
                          </ProtectedRoute>
                        } />
                        <Route path="/teachers/import" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Teachers />
                          </ProtectedRoute>
                        } />
                        <Route path="/events" element={
                          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                            <Events />
                          </ProtectedRoute>
                        } />
                        <Route path="/rankings" element={<Rankings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
