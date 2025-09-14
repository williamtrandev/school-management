import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, School, Trophy, AlertTriangle } from "lucide-react";

// Mock data - in real app this would come from API
const stats = [
  {
    title: "Tổng số lớp",
    value: "24",
    change: "+2",
    changeType: "positive" as const,
    icon: School,
    description: "So với tháng trước"
  },
  {
    title: "Học sinh",
    value: "856",
    change: "+12",
    changeType: "positive" as const,
    icon: Users,
    description: "Đang theo học"
  },
  {
    title: "Lớp xuất sắc",
    value: "8",
    change: "+3",
    changeType: "positive" as const,
    icon: Trophy,
    description: "Tuần này"
  },
  {
    title: "Lớp cần cải thiện",
    value: "3",
    change: "-1",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "Giảm so với tuần trước"
  }
];

const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant={stat.changeType === "positive" ? "default" : "destructive"}
                className={
                  stat.changeType === "positive" 
                    ? "bg-gradient-success text-success-foreground" 
                    : "bg-gradient-to-r from-error to-error-light text-error-foreground"
                }
              >
                {stat.changeType === "positive" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.change}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;