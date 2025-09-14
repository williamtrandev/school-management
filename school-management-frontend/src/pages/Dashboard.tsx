import DashboardStats from "@/components/DashboardStats";
import WeeklyRanking from "@/components/WeeklyRanking";
import RecentEvents from "@/components/RecentEvents";
import { useAuth } from "@/contexts/AuthContext";
import StudentDashboard from "./StudentDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  // Show student dashboard for students
  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  // Show admin/teacher dashboard for admin and teachers
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Tổng quan hệ thống
        </h1>
        <p className="text-muted-foreground">
          Theo dõi tình hình thi đua nề nếp của toàn trường
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-2">
          <WeeklyRanking />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <RecentEvents />
        </div>
      </div>
    </div>
  );
}