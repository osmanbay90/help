import { useState } from "react";
import { VocabularyItem } from "@shared/schema";
import { useVocab } from "@/contexts/VocabContext";

interface FlashcardProps {
  card: VocabularyItem;
  onRate: (rating: 'easy' | 'medium' | 'hard') => void;
}

export default function Flashcard({ card, onRate }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const { pronounceWord } = useVocab();
  
  const handleFlip = () => {
    setFlipped(!flipped);
  };
  
  const handleRating = (rating: 'easy' | 'medium' | 'hard', event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering card flip
    onRate(rating);
    // Reset card state for next card
    setTimeout(() => {
      setFlipped(false);
    }, 500);
  };
  
  return (
    <div className="max-w-2xl mx-auto h-64">
      <div 
        className={`flashcard h-full cursor-pointer ${flipped ? 'flipped' : ''}`} 
        onClick={handleFlip}
      >
        <div className="flashcard-inner">
          {/* Front of card */}
          <div className="flashcard-front bg-white border border-gray-200 p-8 flex flex-col justify-center items-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">{card.term}</h3>
            <p className="text-gray-500 text-sm">Click to flip</p>
          </div>
          
          {/* Back of card */}
          <div className="flashcard-back bg-white border border-gray-200 p-6 overflow-y-auto text-left">
            <div className="mb-4">
              {card.partOfSpeech && (
                <span className="text-sm font-medium bg-indigo-100 text-primary px-2 py-0.5 rounded">
                  {card.partOfSpeech}
                </span>
              )}
              <div className="flex items-center justify-between mt-1">
                <h4 className="text-xl font-bold text-gray-900">{card.term}</h4>
                <button 
                  className="text-primary hover:text-indigo-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    pronounceWord(card.term);
                  }}
                  aria-label="Pronounce word"
                >
                  <span className="material-icons text-sm">volume_up</span>
                </button>
              </div>
            </div>
            
            {/* Definition */}
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 uppercase mb-1">Definition</h5>
              <p className="text-gray-800">{card.definitions[0]}</p>
            </div>
            
            {/* Example */}
            {card.examples && card.examples.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 uppercase mb-1">Example</h5>
                <p className="text-gray-800">{card.examples[0]}</p>
              </div>
            )}
            
            {/* Rating buttons */}
            <div className="pt-3 border-t border-gray-200 mt-auto">
              <h5 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                How well did you know this?
              </h5>
              <div className="flex space-x-2">
                <button 
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                  onClick={(e) => handleRating('hard', e)}
                >
                  Hard
                </button>
                <button 
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  onClick={(e) => handleRating('medium', e)}
                >
                  Medium
                </button>
                <button 
                  className="flex-1 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                  onClick={(e) => handleRating('easy', e)}
                >
                  Easy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
