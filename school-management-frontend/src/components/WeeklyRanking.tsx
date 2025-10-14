import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Trophy, Medal, Award, Calendar, TrendingUp, TrendingDown, RefreshCw, Star, Crown, Zap } from 'lucide-react';
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
  const [useRange, setUseRange] = useState<boolean>(false);
  const [startWeek, setStartWeek] = useState<number>(getCurrentWeek());
  const [endWeek, setEndWeek] = useState<number>(getCurrentWeek());
  const [regenerating, setRegenerating] = useState<boolean>(false);

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
  }, [selectedWeek, selectedYear, useRange, startWeek, endWeek]);

  const loadRankings = async () => {
    try {
      setIsLoading(true);
      setError('');
      if (!useRange) {
        const data = await apiService.getRealtimeRankings({ week_number: selectedWeek, year: selectedYear });
        setRankings(data);
      } else {
        // compute realtime by start/end date range
        // Approximate dates from ISO week numbers by using Monday of start and Sunday of end
        const year = selectedYear;
        const sw = Math.min(startWeek, endWeek);
        const ew = Math.max(startWeek, endWeek);
        const start = new Date(year, 0, 1);
        // helper to get ISO week date
        const isoToDate = (yr: number, wk: number, day: number) => {
          const simple = new Date(Date.UTC(yr, 0, 1 + (wk - 1) * 7));
          const dow = simple.getUTCDay() || 7;
          if (dow <= 4) simple.setUTCDate(simple.getUTCDate() - dow + day);
          else simple.setUTCDate(simple.getUTCDate() + 7 - dow + day);
          return simple;
        };
        const startDate = isoToDate(year, sw, 1).toISOString().slice(0, 10);
        const endDate = isoToDate(year, ew, 7).toISOString().slice(0, 10);
        const data = await apiService.getRealtimeRankings({ start_date: startDate, end_date: endDate });
        setRankings(data);
      }
    } catch (error) {
      console.error('Error loading rankings:', error);
      setError('Không thể tải bảng xếp hạng');
      toast.error('Không thể tải bảng xếp hạng');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed handleRegenerate - using real-time computation instead

  // Removed approval logic - rankings are computed in real-time

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-white drop-shadow-lg" />;
      case 2:
        return <Medal className="h-6 w-6 text-white drop-shadow-lg" />;
      case 3:
        return <Award className="h-6 w-6 text-white drop-shadow-lg" />;
      default:
        return <span className="text-lg font-bold text-white drop-shadow-lg">#{rank}</span>;
    }
  };

  const getTableRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-600" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-600" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-blue-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300 shadow-lg';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-300 shadow-md';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-300 shadow-md';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-300 shadow-sm';
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Consistent with ModernEventList */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Bảng xếp hạng thi đua tuần</h2>
          <p className="text-sm sm:text-base text-gray-600">Xếp hạng các lớp theo điểm thi đua</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Select value={useRange ? 'range' : 'single'} onValueChange={(v) => setUseRange(v === 'range')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Chọn chế độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">1 tuần</SelectItem>
              <SelectItem value="range">Khoảng tuần</SelectItem>
            </SelectContent>
          </Select>

          {!useRange ? (
            <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Tuần" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                  <SelectItem key={week} value={week.toString()}>
                    Tuần {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex gap-2">
              <Select value={startWeek.toString()} onValueChange={(v) => setStartWeek(parseInt(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Từ tuần" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Từ {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={endWeek.toString()} onValueChange={(v) => setEndWeek(parseInt(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Đến tuần" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Đến {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Realtime mode: no regenerate button */}
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Top 3 Podium - Beautiful Design */}
      {rankings.length > 0 && (
        <div className="relative mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              Bảng Vàng Thi Đua
            </h3>
            <p className="text-gray-600 mt-1">Top 3 lớp học xuất sắc nhất</p>
          </div>
          
          <div className="flex justify-center items-end gap-6 lg:gap-12 mb-8">
            {/* 2nd Place */}
            {rankings[1] && (
              <div className="flex flex-col items-center transform scale-95 lg:scale-100">
                <div className="relative mb-4 flex justify-center">
                  <div className="absolute -top-3 w-9 h-9 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xl z-20 border-2 border-gray-300">
                    2
                  </div>
                </div>
                <Card className="w-52 lg:w-60 bg-gradient-to-b from-gray-50 to-gray-100 border-2 border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="text-center pb-3">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full shadow-lg flex items-center justify-center">
                        <div className="text-white">
                          {getRankIcon(2)}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800 mb-2">
                      {rankings[1].classroom.full_name}
                    </CardTitle>
                    <Badge className={`${getRankBadgeColor(2)} text-sm font-bold px-3 py-1`}>
                      Hạng 2
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <div className="text-3xl font-bold text-gray-700 mb-3">
                      {rankings[1].total_points > 0 ? '+' : ''}{rankings[1].total_points}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Điểm cộng:</span>
                        <span className="font-semibold text-green-600">+{rankings[1].positive_points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Điểm trừ:</span>
                        <span className="font-semibold text-red-600">-{rankings[1].negative_points}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 1st Place - Center and Elevated */}
            {rankings[0] && (
              <div className="flex flex-col items-center transform scale-105 lg:scale-110 z-10">
                <div className="relative mb-8 flex justify-center">
                  <div className="absolute -top-3 w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-2xl z-20 border-2 border-yellow-300">
                    👑
                  </div>
                </div>
                <Card className="w-56 lg:w-72 bg-gradient-to-b from-yellow-50 to-yellow-100 border-3 border-yellow-400 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-xl animate-pulse flex items-center justify-center">
                        <div className="text-white">
                          {getRankIcon(1)}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-yellow-800 mb-3">
                      {rankings[0].classroom.full_name}
                    </CardTitle>
                    <Badge className={`${getRankBadgeColor(1)} text-sm font-bold px-4 py-2`}>
                      🏆 Hạng 1
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <div className="text-4xl font-bold text-yellow-700 mb-4">
                      {rankings[0].total_points > 0 ? '+' : ''}{rankings[0].total_points}
                    </div>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <div className="flex justify-between">
                        <span>Điểm cộng:</span>
                        <span className="font-semibold text-green-600">+{rankings[0].positive_points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Điểm trừ:</span>
                        <span className="font-semibold text-red-600">-{rankings[0].negative_points}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 3rd Place */}
            {rankings[2] && (
              <div className="flex flex-col items-center transform scale-95 lg:scale-100">
                <div className="relative mb-4 flex justify-center">
                  <div className="absolute -top-3 w-9 h-9 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xl z-20 border-2 border-amber-300">
                    3
                  </div>
                </div>
                <Card className="w-52 lg:w-60 bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="text-center pb-3">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-lg flex items-center justify-center">
                        <div className="text-white">
                          {getRankIcon(3)}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-amber-800 mb-2">
                      {rankings[2].classroom.full_name}
                    </CardTitle>
                    <Badge className={`${getRankBadgeColor(3)} text-sm font-bold px-3 py-1`}>
                      Hạng 3
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <div className="text-3xl font-bold text-amber-700 mb-3">
                      {rankings[2].total_points > 0 ? '+' : ''}{rankings[2].total_points}
                    </div>
                    <div className="space-y-2 text-sm text-amber-700">
                      <div className="flex justify-between">
                        <span>Điểm cộng:</span>
                        <span className="font-semibold text-green-600">+{rankings[2].positive_points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Điểm trừ:</span>
                        <span className="font-semibold text-red-600">-{rankings[2].negative_points}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Rankings Table - Beautiful Design */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {useRange
                  ? `Bảng xếp hạng chi tiết - Tuần ${Math.min(startWeek, endWeek)} - ${Math.max(startWeek, endWeek)}/${selectedYear}`
                  : `Bảng xếp hạng chi tiết - Tuần ${selectedWeek}/${selectedYear}`}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Danh sách đầy đủ các lớp học</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm sm:text-base">Chưa có dữ liệu xếp hạng cho tuần này</div>
            </div>
          ) : (
            <>
              {/* Desktop Table - Enhanced Design */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <TableHead className="w-20 text-center font-bold text-gray-700">Hạng</TableHead>
                      <TableHead className="font-bold text-gray-700">Lớp học</TableHead>
                      <TableHead className="w-32 text-center font-bold text-gray-700">Điểm cộng</TableHead>
                      <TableHead className="w-32 text-center font-bold text-gray-700">Điểm trừ</TableHead>
                      <TableHead className="w-32 text-center font-bold text-gray-700">Tổng điểm</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.map((summary, index) => (
                      <TableRow 
                        key={summary.id} 
                        className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400' : ''
                        }`}
                      >
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getTableRankIcon(index + 1)}
                            {index < 3 && (
                              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-bold text-lg text-gray-800">
                              {summary.classroom.full_name}
                            </div>
                            {summary.classroom.homeroom_teacher && (
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Star className="h-3 w-3 text-blue-500" />
                                GVCN: {summary.classroom.homeroom_teacher.full_name || `${summary.classroom.homeroom_teacher.first_name} ${summary.classroom.homeroom_teacher.last_name}`}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Zap className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 font-bold text-lg">+{summary.positive_points}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-red-600 font-bold text-lg">-{summary.negative_points}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getPointsTrend(summary)}
                            <span className={`font-bold text-xl ${summary.total_points > 0 ? 'text-green-600' : summary.total_points < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              {summary.total_points > 0 ? '+' : ''}{summary.total_points}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards - Enhanced Design */}
              <div className="lg:hidden space-y-3">
                {rankings.map((summary, index) => (
                  <Card 
                    key={summary.id} 
                    className={`border-l-4 hover:shadow-lg transition-all duration-300 ${
                      index < 3 
                        ? 'border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-md' 
                        : 'border-l-blue-500 hover:border-l-blue-600 bg-white'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                            'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}>
                            <div className="text-white font-bold text-lg">
                              {index < 3 ? getTableRankIcon(index + 1) : `#${index + 1}`}
                            </div>
                          </div>
                        </div>
                        
                        {/* Class Info */}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-bold text-gray-800 truncate">
                            {summary.classroom.full_name}
                          </CardTitle>
                          {summary.classroom.homeroom_teacher && (
                            <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                              <Star className="h-3 w-3 text-blue-500 flex-shrink-0" />
                              <span className="truncate">
                                {summary.classroom.homeroom_teacher.full_name || `${summary.classroom.homeroom_teacher.first_name} ${summary.classroom.homeroom_teacher.last_name}`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Total Points */}
                        <div className="flex-shrink-0 text-right">
                          <div className={`text-lg font-bold ${
                            summary.total_points > 0 ? 'text-green-600' : 
                            summary.total_points < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {summary.total_points > 0 ? `+${summary.total_points}` : summary.total_points}
                          </div>
                          <div className="text-xs text-gray-500">Tổng điểm</div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Points Breakdown */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-bold text-base">+{summary.positive_points}</span>
                          </div>
                          <div className="text-green-700 text-xs font-medium mt-1">Điểm cộng</div>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span className="text-red-600 font-bold text-base">-{summary.negative_points}</span>
                          </div>
                          <div className="text-red-700 text-xs font-medium mt-1">Điểm trừ</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyRanking;