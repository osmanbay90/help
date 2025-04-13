import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVocab } from "@/contexts/VocabContext";
import ProgressCharts from "@/components/ProgressCharts";
import { ActivityLog } from "@shared/schema";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function ProgressPage() {
  const { flashcards } = useVocab();
  const [progressStats, setProgressStats] = useState({
    wordsLearned: 0,
    totalWords: 0,
    dailyGoal: {
      current: 0,
      target: 10
    },
    streak: 0
  });
  
  const [masteryBreakdown, setMasteryBreakdown] = useState({
    mastered: 0,
    learning: 0,
    needsReview: 0,
    notStarted: 0,
    dueToday: 0
  });
  
  const [, setLocation] = useLocation();
  
  // Get activity log from the server
  const { data: activityData, isLoading: isLoadingActivity } = useQuery<ActivityLog[]>({
    queryKey: ['/api/activity/1'], // Hardcoded user ID for demo
  });
  
  // Calculate stats based on flashcards
  useEffect(() => {
    if (flashcards) {
      // Count words by mastery level
      let mastered = 0;
      let learning = 0;
      let needsReview = 0;
      let dueToday = 0;
      
      const now = new Date();
      
      flashcards.forEach(card => {
        if (card.repetitions && card.repetitions >= 3) {
          mastered++;
        } else if (card.repetitions && card.repetitions > 0) {
          learning++;
        } else {
          needsReview++;
        }
        
        // Check if due today
        if (card.dueDate && card.dueDate <= now) {
          dueToday++;
        }
      });
      
      const notStarted = Math.max(0, 10 - flashcards.length); // Minimum of 10 total words for UI
      
      setMasteryBreakdown({
        mastered,
        learning,
        needsReview,
        notStarted,
        dueToday
      });
      
      // Update progress stats
      setProgressStats({
        wordsLearned: mastered + learning,
        totalWords: Math.max(flashcards.length, 10),
        dailyGoal: {
          current: Math.min(8, flashcards.length), // Mock current progress
          target: 10
        },
        streak: 5 // Mock streak for demo
      });
    }
  }, [flashcards]);
  
  // Format recent activity for display
  const formattedActivity = activityData ? activityData.map(activity => {
    // Determine icon and text based on activity type
    let icon = 'event_note';
    let iconColor = 'text-primary';
    let iconBgColor = 'bg-indigo-100';
    let text = 'Activity logged';
    
    switch (activity.action) {
      case 'saved_vocabulary':
        icon = 'edit';
        text = `Learned "${activity.details.term}"`;
        break;
      case 'reviewed_flashcard':
        icon = 'check_circle';
        iconColor = 'text-green-600';
        iconBgColor = 'bg-green-100';
        text = 'Completed flashcard review';
        break;
      case 'added_favorite':
        icon = 'star';
        iconColor = 'text-yellow-600';
        iconBgColor = 'bg-yellow-100';
        text = `Added "${activity.details.term}" to favorites`;
        break;
      case 'removed_favorite':
        icon = 'star_border';
        iconColor = 'text-yellow-600';
        iconBgColor = 'bg-yellow-100';
        text = `Removed "${activity.details.term}" from favorites`;
        break;
      case 'created_collection':
        icon = 'folder';
        iconColor = 'text-pink-600';
        iconBgColor = 'bg-pink-100';
        text = `Created "${activity.details.name}" collection`;
        break;
      case 'added_to_collection':
        icon = 'playlist_add';
        iconColor = 'text-purple-600';
        iconBgColor = 'bg-purple-100';
        text = `Added "${activity.details.term}" to "${activity.details.collectionName}"`;
        break;
    }
    
    return {
      id: String(activity.id),
      icon,
      iconColor,
      iconBgColor,
      text,
      timestamp: formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
    };
  }) : [];
  
  // Start review session
  const handleStartReview = () => {
    setLocation('/flashcards');
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
      
      {isLoadingActivity ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-80 rounded-lg" />
          ))}
        </div>
      ) : (
        <ProgressCharts 
          stats={progressStats}
          mastery={masteryBreakdown}
          recentActivity={formattedActivity || []}
          onStartReview={handleStartReview}
        />
      )}
    </div>
  );
}
