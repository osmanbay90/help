import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Flashcard from "@/components/Flashcard";
import { useVocab } from "@/contexts/VocabContext";
import { VocabularyItem } from "@shared/schema";
import { calculateNextReview } from "@/lib/spacedRepetition";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import SettingsDialog from "@/components/SettingsDialog";

export default function FlashcardsPage() {
  const { flashcards, updateFlashcardReview, settings } = useVocab();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState<'all' | 'due'>('all');
  const [reviewedToday, setReviewedToday] = useState<number>(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Load daily review count from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const lastReviewDate = localStorage.getItem('lastReviewDate');
    const reviewCount = localStorage.getItem('dailyReviewCount');
    
    // If the last review was today, restore the review count
    if (lastReviewDate === today && reviewCount) {
      setReviewedToday(parseInt(reviewCount));
    } else {
      // Reset the count for a new day
      localStorage.setItem('lastReviewDate', today);
      localStorage.setItem('dailyReviewCount', '0');
      setReviewedToday(0);
    }
  }, []);
  
  // Get due flashcards if in review mode
  const { data: dueCards, isLoading } = useQuery<(VocabularyItem & { reviewId: number })[]>({
    queryKey: reviewMode === 'due' ? ['/api/flashcards/due/1'] : [],
    enabled: reviewMode === 'due',
  });
  
  // Get the current cards based on mode
  const currentCards = reviewMode === 'due' ? dueCards : flashcards;
  const cardsCount = currentCards?.length || 0;
  
  // Reset index when changing modes or when cards change
  useEffect(() => {
    setCurrentIndex(0);
  }, [reviewMode, dueCards, flashcards]);
  
  // Handle rating a card
  const handleRateCard = async (rating: 'easy' | 'medium' | 'hard') => {
    if (!currentCards || currentCards.length === 0) return;
    
    // Check if the daily review limit has been reached
    if (reviewedToday >= settings.dailyFlashcardLimit) {
      toast({
        title: "Daily limit reached",
        description: `You've reached your daily limit of ${settings.dailyFlashcardLimit} flashcards. Change your limit in settings or come back tomorrow!`,
      });
      return;
    }
    
    const currentCard = currentCards[currentIndex];
    if (!currentCard) return;
    
    // Calculate next review parameters
    const { easeFactor, interval, repetitions, dueDate } = calculateNextReview(
      rating,
      {
        easeFactor: currentCard.easeFactor || 250,
        interval: currentCard.interval || 1,
        repetitions: currentCard.repetitions || 0
      }
    );
    
    try {
      // If in due mode, update the review in the backend
      if (reviewMode === 'due' && 'reviewId' in currentCard) {
        await apiRequest('PATCH', `/api/flashcards/review/${currentCard.reviewId}`, {
          easeFactor,
          interval,
          repetitions,
          dueDate: dueDate.toISOString(),
        });
      }
      
      // Update local state
      updateFlashcardReview(currentCard.id, {
        easeFactor,
        interval,
        repetitions,
        dueDate
      });
      
      // Update daily review count
      const newReviewCount = reviewedToday + 1;
      setReviewedToday(newReviewCount);
      localStorage.setItem('dailyReviewCount', newReviewCount.toString());
      
      // Move to next card or finish review
      if (currentIndex < cardsCount - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        toast({
          title: "Review session completed",
          description: `You've reviewed all ${cardsCount} cards in this session`,
        });
      }
    } catch (error) {
      toast({
        title: "Error updating review",
        description: "There was a problem saving your progress",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  // Navigate to previous card
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  // Navigate to next card
  const handleNext = () => {
    if (currentIndex < cardsCount - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Shuffle the cards
  const handleShuffle = () => {
    setReviewMode('all');
    setCurrentIndex(0);
    // The actual shuffling is handled in the context
  };
  
  // Start review mode
  const handleStartReview = () => {
    setReviewMode('due');
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Flashcard Review</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setReviewMode(reviewMode === 'all' ? 'due' : 'all')}
            >
              <span className="material-icons text-sm mr-1 align-text-bottom">tune</span>
              {reviewMode === 'all' ? 'Due Cards' : 'All Cards'}
            </Button>
            <Button onClick={handleShuffle}>
              <span className="material-icons text-sm mr-1 align-text-bottom">shuffle</span>
              Shuffle
            </Button>
            <SettingsDialog />
          </div>
        </div>
        
        {/* Daily practice limit progress */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Daily practice: {reviewedToday}/{settings.dailyFlashcardLimit}</span>
            <span className="text-xs text-gray-500">
              {reviewedToday >= settings.dailyFlashcardLimit 
                ? "Limit reached!" 
                : `${settings.dailyFlashcardLimit - reviewedToday} cards remaining`}
            </span>
          </div>
          <Progress 
            value={(reviewedToday / settings.dailyFlashcardLimit) * 100} 
            className="h-2" 
          />
        </div>

        {/* Flashcard component */}
        {isLoading ? (
          <div className="mb-8">
            <div className="max-w-2xl mx-auto h-64">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          </div>
        ) : cardsCount === 0 ? (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow text-center">
            <span className="material-icons text-gray-400 text-5xl mb-4">
              {reviewMode === 'due' ? 'event_available' : 'school'}
            </span>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              {reviewMode === 'due' 
                ? 'No cards due for review' 
                : 'No flashcards added yet'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {reviewMode === 'due'
                ? 'All caught up! Check back later for more reviews.'
                : 'Search for words and add them to your flashcards to start learning.'
              }
            </p>
            {reviewMode === 'due' && (
              <Button onClick={() => setReviewMode('all')}>
                Practice anyway
              </Button>
            )}
            {reviewMode === 'all' && (
              <Button onClick={() => setLocation('/')}>
                Search words
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8">
              {currentCards && currentCards[currentIndex] && (
                <Flashcard 
                  card={currentCards[currentIndex]} 
                  onRate={handleRateCard} 
                />
              )}
            </div>

            {/* Flashcard Navigation */}
            <div className="flex justify-between items-center max-w-2xl mx-auto">
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <span className="material-icons text-gray-700">arrow_back</span>
              </button>
              <div className="text-gray-600 text-sm">
                Card {currentIndex + 1} of {cardsCount}
              </div>
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={handleNext}
                disabled={currentIndex === cardsCount - 1}
              >
                <span className="material-icons text-gray-700">arrow_forward</span>
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
