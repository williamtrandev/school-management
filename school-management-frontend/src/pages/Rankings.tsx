import React from 'react';
import { Trophy } from 'lucide-react';
import WeeklyRanking from '../components/WeeklyRanking';

const Rankings: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Header - Consistent with Events page */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Bảng Xếp Hạng
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-lg">
            Theo dõi và đánh giá thành tích thi đua của các lớp
          </p>
        </div>
      </div>

      {/* Weekly Rankings */}
      <WeeklyRanking />
    </div>
  );
};

// Removed RankingTable component as WeeklyRanking component handles its own display

export default Rankings;