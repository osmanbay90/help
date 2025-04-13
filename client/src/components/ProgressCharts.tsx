import { useMemo } from "react";

interface ProgressStats {
  wordsLearned: number;
  totalWords: number;
  dailyGoal: {
    current: number;
    target: number;
  };
  streak: number;
}

interface MasteryBreakdown {
  mastered: number;
  learning: number;
  needsReview: number;
  notStarted: number;
  dueToday: number;
}

interface RecentActivity {
  id: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  text: string;
  timestamp: string;
}

interface ProgressChartsProps {
  stats: ProgressStats;
  mastery: MasteryBreakdown;
  recentActivity: RecentActivity[];
  onStartReview: () => void;
}

export default function ProgressCharts({ 
  stats, 
  mastery, 
  recentActivity,
  onStartReview
}: ProgressChartsProps) {
  // Calculate mastery percentage
  const masteryPercentage = useMemo(() => {
    if (stats.totalWords === 0) return 0;
    return Math.round((stats.wordsLearned / stats.totalWords) * 100);
  }, [stats]);
  
  // Calculate circle stroke dashoffset for progress circle
  const calculateCircleProgress = (percent: number) => {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    return offset;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Overall Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Summary</h3>
        
        <div className="flex mb-6">
          <div className="w-20 h-20 mr-6">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#E5E7EB" strokeWidth="8"/>
              <circle 
                className="progress-circle" 
                cx="40" 
                cy="40" 
                r="34" 
                fill="none" 
                stroke="#4F46E5" 
                strokeWidth="8" 
                strokeDasharray={2 * Math.PI * 34} 
                strokeDashoffset={calculateCircleProgress(masteryPercentage)} 
              />
            </svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{masteryPercentage}%</div>
            <div className="text-sm text-gray-500">Total Mastery</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Words Learned</span>
              <span className="text-gray-600">
                {stats.wordsLearned} / {stats.totalWords}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(stats.wordsLearned / stats.totalWords) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Daily Goal</span>
              <span className="text-gray-600">
                {stats.dailyGoal.current} / {stats.dailyGoal.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-secondary h-2 rounded-full" 
                style={{ width: `${(stats.dailyGoal.current / stats.dailyGoal.target) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Current Streak</span>
              <span className="text-gray-600">{stats.streak} days</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${Math.min(stats.streak * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start">
              <div className={`w-8 h-8 rounded-full ${activity.iconBgColor} flex items-center justify-center mr-3 flex-shrink-0`}>
                <span className={`material-icons ${activity.iconColor} text-sm`}>{activity.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
          
          {recentActivity.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No recent activity yet
            </div>
          )}
        </div>
      </div>
      
      {/* Mastery Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mastery Breakdown</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-700">Mastered</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{mastery.mastered} words</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm text-gray-700">Learning</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{mastery.learning} words</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-700">Needs Review</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{mastery.needsReview} words</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
              <span className="text-sm text-gray-700">Not Started</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{mastery.notStarted} words</div>
          </div>
        </div>
        
        {mastery.dueToday > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Due for Review</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                You have <span className="font-medium">{mastery.dueToday} words</span> due for review today.
              </p>
              <button 
                className="mt-2 w-full py-2 text-xs font-medium bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                onClick={onStartReview}
              >
                Start Review Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
