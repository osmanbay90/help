import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import AutocompleteSuggestions from "./AutocompleteSuggestions";
import { useVocab } from "@/contexts/VocabContext";

interface SearchBarProps {
  onSearch: (term: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { searchHistory } = useVocab();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const filtered = searchHistory
        .filter(term => term.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
    } else {
      setShowAutocomplete(false);
    }
  }, [searchTerm, searchHistory]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowAutocomplete(false);
    onSearch(suggestion);
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchTerm.trim().length === 0) {
      toast({
        title: "Please enter a word or phrase",
        description: "The search field cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    onSearch(searchTerm.trim());
    setShowAutocomplete(false);
  };

  // Handle outside click to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative" ref={inputRef}>
        <input 
          type="text" 
          className="w-full px-5 py-4 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm" 
          placeholder="Search for a word or phrase..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button 
          className="absolute right-4 top-4 text-gray-500 hover:text-primary"
          onClick={handleSearch}
        >
          <span className="material-icons">search</span>
        </button>
        
        {showAutocomplete && suggestions.length > 0 && (
          <AutocompleteSuggestions 
            suggestions={suggestions} 
            onSelect={handleSuggestionClick} 
          />
        )}
      </div>
    </div>
  );
}
