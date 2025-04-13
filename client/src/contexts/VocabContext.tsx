import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  VocabularyItem, 
  WordLookupResult, 
  Collection
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  dailyFlashcardLimit: number;
}

interface VocabContextType {
  // Vocabulary state
  flashcards: VocabularyItem[];
  favorites: VocabularyItem[];
  collections: Collection[];
  searchHistory: string[];
  settings: Settings;
  
  // Vocabulary actions
  addWordToFlashcards: (word: WordLookupResult) => void;
  addToFavorites: (word: WordLookupResult) => void;
  removeFromFavorites: (term: string) => void;
  isFavorite: (term: string) => boolean;
  updateFlashcardReview: (id: number, review: { 
    easeFactor: number;
    interval: number;
    repetitions: number;
    dueDate: Date;
  }) => void;
  addToSearchHistory: (term: string) => void;
  pronounceWord: (word: string) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const VocabContext = createContext<VocabContextType | undefined>(undefined);

export function VocabProvider({ children }: { children: ReactNode }) {
  const [flashcards, setFlashcards] = useState<VocabularyItem[]>([]);
  const [favorites, setFavorites] = useState<VocabularyItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [settings, setSettings] = useState<Settings>({
    dailyFlashcardLimit: 10 // Default limit is 10 cards per day
  });
  const { toast } = useToast();
  
  // Load data from localStorage on initial render
  useEffect(() => {
    const storedFlashcards = localStorage.getItem('flashcards');
    const storedFavorites = localStorage.getItem('favorites');
    const storedCollections = localStorage.getItem('collections');
    const storedSearchHistory = localStorage.getItem('searchHistory');
    const storedSettings = localStorage.getItem('settings');
    
    if (storedFlashcards) {
      try {
        setFlashcards(JSON.parse(storedFlashcards));
      } catch (error) {
        console.error("Error parsing flashcards from localStorage:", error);
      }
    }
    
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
      }
    }
    
    if (storedCollections) {
      try {
        setCollections(JSON.parse(storedCollections));
      } catch (error) {
        console.error("Error parsing collections from localStorage:", error);
      }
    }
    
    if (storedSearchHistory) {
      try {
        setSearchHistory(JSON.parse(storedSearchHistory));
      } catch (error) {
        console.error("Error parsing search history from localStorage:", error);
      }
    }
    
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (error) {
        console.error("Error parsing settings from localStorage:", error);
      }
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
  }, [flashcards]);
  
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  useEffect(() => {
    localStorage.setItem('collections', JSON.stringify(collections));
  }, [collections]);
  
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);
  
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);
  
  // Add a word to flashcards
  const addWordToFlashcards = (word: WordLookupResult) => {
    // Check if the word already exists
    const exists = flashcards.some(card => card.term.toLowerCase() === word.term.toLowerCase());
    
    if (exists) {
      toast({
        title: "Word already exists",
        description: `"${word.term}" is already in your flashcards`,
      });
      return;
    }
    
    // Create a new flashcard
    const newFlashcard: VocabularyItem = {
      id: Date.now(), // Use timestamp as ID
      term: word.term,
      phonetics: word.phonetics || '',
      definitionText: word.definitions[0]?.definition || '',
      context: word.usage?.contextualUsage || '',
      partOfSpeech: word.definitions[0]?.partOfSpeech || '',
      exampleSentences: word.definitions.flatMap(def => def.examples || []).join('|'),
      synonyms: (word.related?.synonyms || []).join('|'),
      antonyms: (word.related?.antonyms || []).join('|'),
      favorite: false,
      dateAdded: new Date(),
      userId: 1, // Hardcoded user ID for demo
      
      // Initial spaced repetition values
      easeFactor: 250,
      interval: 1,
      repetitions: 0,
      dueDate: new Date()
    };
    
    setFlashcards(prev => [...prev, newFlashcard]);
  };
  
  // Add a word to favorites
  const addToFavorites = (word: WordLookupResult) => {
    // Check if the word already exists in favorites
    const exists = favorites.some(fav => fav.term.toLowerCase() === word.term.toLowerCase());
    
    if (exists) {
      return; // Word is already in favorites
    }
    
    // Create a new favorite item
    const newFavorite: VocabularyItem = {
      id: Date.now(), // Use timestamp as ID
      term: word.term,
      phonetics: word.phonetics || '',
      definitionText: word.definitions[0]?.definition || '',
      context: word.usage?.contextualUsage || '',
      partOfSpeech: word.definitions[0]?.partOfSpeech || '',
      exampleSentences: word.definitions.flatMap(def => def.examples || []).join('|'),
      synonyms: (word.related?.synonyms || []).join('|'),
      antonyms: (word.related?.antonyms || []).join('|'),
      favorite: true,
      dateAdded: new Date(),
      userId: 1, // Hardcoded user ID for demo
      
      // Required SR fields even for favorites
      easeFactor: 250,
      interval: 1,
      repetitions: 0,
      dueDate: new Date()
    };
    
    setFavorites(prev => [...prev, newFavorite]);
    
    // Also update the item in flashcards if it exists
    setFlashcards(prev => prev.map(card => 
      card.term.toLowerCase() === word.term.toLowerCase() ? { ...card, favorite: true } : card
    ));
  };
  
  // Remove a word from favorites
  const removeFromFavorites = (term: string) => {
    setFavorites(prev => prev.filter(fav => fav.term.toLowerCase() !== term.toLowerCase()));
    
    // Also update the item in flashcards if it exists
    setFlashcards(prev => prev.map(card => 
      card.term.toLowerCase() === term.toLowerCase() ? { ...card, favorite: false } : card
    ));
  };
  
  // Check if a word is in favorites
  const isFavorite = (term: string) => {
    return favorites.some(fav => fav.term.toLowerCase() === term.toLowerCase());
  };
  
  // Update flashcard review data
  const updateFlashcardReview = (id: number, review: { 
    easeFactor: number;
    interval: number;
    repetitions: number;
    dueDate: Date;
  }) => {
    setFlashcards(prev => prev.map(card => 
      card.id === id ? { ...card, ...review } : card
    ));
  };
  
  // Add a term to search history
  const addToSearchHistory = (term: string) => {
    // Remove the term if it already exists (to move it to the front)
    const filteredHistory = searchHistory.filter(item => item.toLowerCase() !== term.toLowerCase());
    
    // Add the term to the beginning of the array
    setSearchHistory([term, ...filteredHistory].slice(0, 10)); // Keep only the 10 most recent searches
  };
  
  // Pronounce a word using the Web Speech API
  const pronounceWord = (word: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support the text-to-speech feature",
        variant: "destructive",
      });
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };
  
  // Update app settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
    
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved"
    });
  };
  
  const value = {
    flashcards,
    favorites,
    collections,
    searchHistory,
    settings,
    addWordToFlashcards,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    updateFlashcardReview,
    addToSearchHistory,
    pronounceWord,
    updateSettings
  };
  
  return (
    <VocabContext.Provider value={value}>
      {children}
    </VocabContext.Provider>
  );
}

export const useVocab = () => {
  const context = useContext(VocabContext);
  if (context === undefined) {
    throw new Error("useVocab must be used within a VocabProvider");
  }
  return context;
};
