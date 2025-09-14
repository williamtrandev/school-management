import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, Calendar, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();

  // Mock data for student
  const studentData = {
    currentScore: 85,
    weeklyRank: 3,
    monthlyRank: 5,
    attendance: 95,
    behavior: "excellent",
    achievements: [
      "Xuất sắc trong tiết học Toán",
      "Vệ sinh lớp học tốt",
      "Tham gia hoạt động đoàn tích cực"
    ],
    recentEvents: [
      {
        type: "positive",
        event: "Xuất sắc trong tiết học Toán",
        points: +5,
        date: "Hôm nay"
      },
      {
        type: "positive", 
        event: "Vệ sinh lớp học tốt",
        points: +3,
        date: "Hôm qua"
      },
      {
        type: "negative",
        event: "Đi trễ 5 phút",
        points: -2,
        date: "2 ngày trước"
      }
    ]
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Chào mừng, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Theo dõi thành tích học tập và thi đua của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm tuần</CardTitle>
            <Trophy className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{studentData.currentScore}</div>
            <p className="text-xs text-muted-foreground">
              +5 so với tuần trước
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xếp hạng tuần</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">#{studentData.weeklyRank}</div>
            <p className="text-xs text-muted-foreground">
              Trong lớp 12A1
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuyên cần</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{studentData.attendance}%</div>
            <p className="text-xs text-muted-foreground">
              Tuần này
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hạnh kiểm</CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <Badge className="bg-gradient-success text-success-foreground">
              Xuất sắc
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Events */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Sự kiện gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentData.recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.event}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <Badge 
                    variant={event.type === "positive" ? "default" : "destructive"}
                    className={event.type === "positive" ? "bg-gradient-success text-success-foreground" : ""}
                  >
                    {event.points > 0 ? '+' : ''}{event.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              Thành tích
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-success/10 border border-success/20">
                  <Award className="h-4 w-4 text-success" />
                  <span className="text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 