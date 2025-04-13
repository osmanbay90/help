import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import WordDetail from "@/components/WordDetail";
import { useVocab } from "@/contexts/VocabContext";
import { useToast } from "@/hooks/use-toast";
import { WordLookupResult } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { addWordToFlashcards, addToSearchHistory } = useVocab();
  const { toast } = useToast();
  
  // Use react-query to fetch word data
  const { data, isLoading, error } = useQuery<WordLookupResult>({
    queryKey: searchTerm ? [`/api/lookup/${searchTerm}`] : [],
    enabled: !!searchTerm,
  });
  
  // Handle search submission
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    addToSearchHistory(term);
  };
  
  // Add current word to flashcards
  const handleAddToFlashcards = () => {
    if (data) {
      addWordToFlashcards(data);
      toast({
        title: "Added to flashcards",
        description: `"${data.term}" has been added to your flashcards collection`,
      });
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Enhance Your English Vocabulary
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Search for words or phrases to learn definitions, context, examples, and add them to your personalized flashcards.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />
      </section>
      
      {/* Word Detail Section */}
      <section className="mb-12">
        {isLoading && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-full">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-6" />
              
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-16 w-full mb-2 rounded-lg" />
              <Skeleton className="h-16 w-full mb-2 rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center text-red-500 mb-4">
                <span className="material-icons mr-2">error</span>
                <h3 className="text-lg font-medium">Error looking up word</h3>
              </div>
              <p className="text-gray-700">
                We couldn't find information for "{searchTerm}". Please check the spelling or try another word.
              </p>
            </div>
          </div>
        )}
        
        {data && !isLoading && (
          <WordDetail 
            word={data} 
            onAddToFlashcards={handleAddToFlashcards} 
          />
        )}
        
        {!searchTerm && !isLoading && !data && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8 text-center">
              <span className="material-icons text-gray-400 text-5xl mb-4">search</span>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Search for a word to get started</h3>
              <p className="text-gray-500">
                Type a word or phrase in the search box above to see its definition, examples, and more.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
