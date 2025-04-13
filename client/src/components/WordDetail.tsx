import { useState } from "react";
import { useVocab } from "@/contexts/VocabContext";
import { WordLookupResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface WordDetailProps {
  word: WordLookupResult;
  onAddToFlashcards?: () => void;
}

export default function WordDetail({ word, onAddToFlashcards }: WordDetailProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useVocab();
  const [favorite, setFavorite] = useState(isFavorite(word.term));
  const [isAdded, setIsAdded] = useState(false);
  const { toast } = useToast();
  
  // Handle pronouncing the word using text-to-speech
  const handlePronounce = () => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support the text-to-speech feature",
        variant: "destructive",
      });
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(word.term);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };
  
  // Toggle favorite status
  const toggleFavorite = () => {
    if (favorite) {
      removeFromFavorites(word.term);
      toast({
        title: "Removed from favorites",
        description: `"${word.term}" has been removed from your favorites`,
      });
    } else {
      addToFavorites(word);
      toast({
        title: "Added to favorites",
        description: `"${word.term}" has been added to your favorites`,
      });
    }
    setFavorite(!favorite);
  };
  
  // Add to flashcards
  const handleAddToFlashcards = () => {
    if (onAddToFlashcards) {
      onAddToFlashcards();
      setIsAdded(true);
      toast({
        title: "Added to flashcards",
        description: `"${word.term}" has been added to your flashcards`,
      });
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        {/* Word Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{word.term}</h3>
            <div className="flex items-center text-gray-600">
              {word.partOfSpeech && (
                <span className="text-sm font-medium bg-indigo-100 text-primary px-2 py-0.5 rounded mr-2">
                  {word.partOfSpeech}
                </span>
              )}
              {word.pronunciation && (
                <>
                  <span className="text-sm">{word.pronunciation}</span>
                  <button 
                    className="ml-2 text-primary hover:text-indigo-700"
                    onClick={handlePronounce}
                    aria-label="Pronounce word"
                  >
                    <span className="material-icons text-sm">volume_up</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={toggleFavorite}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <span className="material-icons text-yellow-400">
                {favorite ? "star" : "star_border"}
              </span>
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={handleAddToFlashcards}
              aria-label="Add to flashcards"
              disabled={isAdded}
            >
              <span className={`material-icons ${isAdded ? "text-green-500" : "text-gray-500"}`}>
                {isAdded ? "check_circle" : "add_circle_outline"}
              </span>
            </button>
          </div>
        </div>

        {/* Definition */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Definition</h4>
          {word.definitions.map((definition, index) => (
            <p key={index} className="text-gray-700 mb-2">{definition}</p>
          ))}
        </div>

        {/* Cultural Context */}
        {word.culturalContext && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Cultural Context</h4>
            <p className="text-gray-700">{word.culturalContext}</p>
          </div>
        )}

        {/* Examples */}
        {word.examples && word.examples.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Examples</h4>
            <ul className="space-y-3">
              {word.examples.map((example, index) => (
                <li key={index} className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-gray-800">
                    {example.split(word.term).map((part, i, array) => (
                      <span key={i}>
                        {i > 0 && (
                          <span className="font-medium text-primary">{word.term}</span>
                        )}
                        {part}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Forms */}
        {word.relatedForms && Object.keys(word.relatedForms).length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Related Forms</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(word.relatedForms).map(([type, form]) => (
                <div key={type} className="p-3 border border-gray-200 rounded-lg">
                  <span className="block text-sm font-medium text-gray-500 mb-1">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                  <span className="text-gray-800">{form}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
