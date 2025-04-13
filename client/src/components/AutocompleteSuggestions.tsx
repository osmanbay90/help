interface AutocompleteSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export default function AutocompleteSuggestions({ 
  suggestions, 
  onSelect 
}: AutocompleteSuggestionsProps) {
  if (suggestions.length === 0) return null;
  
  return (
    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
      <ul>
        {suggestions.map((suggestion, index) => (
          <li 
            key={index} 
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center group"
            onClick={() => onSelect(suggestion)}
          >
            <span className="material-icons text-gray-400 mr-2 group-hover:text-primary">history</span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
