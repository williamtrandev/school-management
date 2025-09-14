import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Trophy, Medal, Award, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import apiService, { WeekSummary } from '../services/api';

interface WeeklyRankingProps {
  onRefresh?: () => void;
}

const WeeklyRanking: React.FC<WeeklyRankingProps> = ({ onRefresh }) => {
  const [rankings, setRankings] = useState<WeekSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<number>(getCurrentWeek());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Get current week number
  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  // Load rankings
  useEffect(() => {
    loadRankings();
  }, [selectedWeek, selectedYear]);

  const loadRankings = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getClassRankings({
        week_number: selectedWeek,
        year: selectedYear
      });
      setRankings(data);
    } catch (error) {
      console.error('Error loading rankings:', error);
      setError('Không thể tải bảng xếp hạng');
      toast.error('Không thể tải bảng xếp hạng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (summaryId: string) => {
    try {
      await apiService.approveWeekSummary(summaryId);
      toast.success('Duyệt báo cáo tuần thành công!');
      loadRankings();
      onRefresh?.();
    } catch (error) {
      console.error('Error approving summary:', error);
      toast.error('Duyệt báo cáo thất bại');
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPointsTrend = (summary: WeekSummary) => {
    const totalPoints = summary.total_points;
    if (totalPoints > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (totalPoints < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bảng xếp hạng thi đua tuần</h2>
          <p className="text-gray-600">Xếp hạng các lớp theo điểm thi đua</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                <SelectItem key={week} value={week.toString()}>
                  Tuần {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Top 3 Cards */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rankings.slice(0, 3).map((summary, index) => (
            <Card key={summary.id} className={`${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  {getRankIcon(index + 1)}
                </div>
                <CardTitle className="text-lg">
                  {summary.classroom.full_name}
                </CardTitle>
                <Badge className={getRankBadgeColor(index + 1)}>
                  Hạng {index + 1}
                </Badge>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {summary.total_points > 0 ? '+' : ''}{summary.total_points}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <div>Điểm cộng: +{summary.positive_points}</div>
                  <div>Điểm trừ: -{summary.negative_points}</div>
                </div>
                {!summary.is_approved && (
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => handleApprove(summary.id)}
                  >
                    Duyệt
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bảng xếp hạng chi tiết - Tuần {selectedWeek}/{selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu xếp hạng cho tuần này
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hạng</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Điểm cộng</TableHead>
                    <TableHead>Điểm trừ</TableHead>
                    <TableHead>Tổng điểm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((summary, index) => (
                    <TableRow key={summary.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(index + 1)}
                          <span className="font-medium">{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {summary.classroom.full_name}
                        </div>
                        {summary.classroom.homeroom_teacher && (
                          <div className="text-sm text-gray-500">
                            GVCN: {summary.classroom.homeroom_teacher.full_name || `${summary.classroom.homeroom_teacher.first_name} ${summary.classroom.homeroom_teacher.last_name}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-medium">+{summary.positive_points}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-red-600 font-medium">-{summary.negative_points}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getPointsTrend(summary)}
                          <span className={`font-bold ${summary.total_points > 0 ? 'text-green-600' : summary.total_points < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {summary.total_points > 0 ? '+' : ''}{summary.total_points}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={summary.is_approved ? "default" : "secondary"}>
                          {summary.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!summary.is_approved && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(summary.id)}
                          >
                            Duyệt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyRanking;