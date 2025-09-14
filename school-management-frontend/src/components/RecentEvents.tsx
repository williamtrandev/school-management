import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle } from "lucide-react";

// Mock data - in real app this would come from API
const recentEvents = [
  {
    id: 1,
    type: "positive",
    class: "12A1",
    student: "Nguyễn Văn An",
    event: "Xuất sắc trong tiết học Toán",
    points: +5,
    teacher: "Cô Trần Thị Lan",
    time: "10:30 - Hôm nay",
    category: "lesson"
  },
  {
    id: 2,
    type: "negative",
    class: "11B2",
    student: "Lê Thị Bình",
    event: "Đi trễ không phép",
    points: -2,
    teacher: "Thầy Nguyễn Văn Nam",
    time: "08:15 - Hôm nay",
    category: "attendance"
  },
  {
    id: 3,
    type: "positive",
    class: "10A3",
    student: null,
    event: "Vệ sinh lớp học xuất sắc",
    points: +3,
    teacher: "Cô Lê Thị Mai",
    time: "07:45 - Hôm nay",
    category: "hygiene"
  },
  {
    id: 4,
    type: "negative",
    class: "12B1",
    student: "Phạm Minh Đức",
    event: "Sử dụng điện thoại trong giờ học",
    points: -3,
    teacher: "Thầy Hoàng Văn Tùng",
    time: "14:20 - Hôm qua",
    category: "discipline"
  },
  {
    id: 5,
    type: "positive",
    class: "11A1",
    student: null,
    event: "Tham gia hoạt động đoàn tích cực",
    points: +4,
    teacher: "Cô Nguyễn Thị Hoa",
    time: "16:00 - Hôm qua",
    category: "activities"
  }
];

function getEventIcon(type: string, category: string) {
  if (type === "positive") {
    return <CheckCircle className="h-4 w-4 text-success" />;
  } else {
    return <XCircle className="h-4 w-4 text-error" />;
  }
}

function getEventBadge(type: string, points: number) {
  if (type === "positive") {
    return (
      <Badge className="bg-gradient-success text-success-foreground">
        +{points}
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive">
        {points}
      </Badge>
    );
  }
}

function getCategoryName(category: string) {
  const categoryMap = {
    lesson: "Tiết học",
    attendance: "Chuyên cần",
    discipline: "Nề nếp",
    hygiene: "Vệ sinh",
    activities: "Hoạt động"
  };
  return categoryMap[category as keyof typeof categoryMap] || category;
}

const RecentEvents = () => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sự kiện gần đây
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event.type, event.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{event.class}</span>
                  {getEventBadge(event.type, event.points)}
                </div>
                
                <p className="text-sm text-foreground mb-1">
                  {event.event}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {event.teacher}
                  </span>
                </div>
                
                {event.student && (
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {event.student}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors">
            Xem tất cả sự kiện →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentEvents;