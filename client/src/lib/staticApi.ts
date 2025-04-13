import { WordLookupResult } from '@shared/schema';

// Cache configuration
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_PREFIX = 'vocabflash_word_cache_';

// Mock Gemini API response when API key is missing
export function generateMockWordData(term: string): WordLookupResult {
  return {
    term,
    phonetics: `/ˈsæmpəl/`,
    definitions: [
      {
        partOfSpeech: 'noun',
        definition: 'This is a placeholder definition since the app is running in static mode without API access.',
        examples: ['Please add a GEMINI_API_KEY to get real definitions.']
      }
    ],
    usage: {
      formalityLevel: 'neutral',
      regionalContext: 'None available in static mode',
      contextualUsage: 'This is a static deployment without API access. Real word data requires the backend server.'
    },
    related: {
      synonyms: ['placeholder', 'static', 'demo'],
      antonyms: []
    }
  };
}

/**
 * Static version of the word lookup function that uses locally cached data
 * or generates placeholder content when API access is unavailable
 */
export async function staticLookupWord(term: string): Promise<WordLookupResult> {
  const normalizedTerm = term.trim().toLowerCase();
  
  // Check browser cache first
  const cachedData = getCachedWord(normalizedTerm);
  if (cachedData) {
    console.log(`Using cached data for "${normalizedTerm}"`);
    return cachedData;
  }
  
  // For static site without API access, generate mock data
  console.log(`No API access in static mode. Generating placeholder data for "${normalizedTerm}"`);
  const mockData = generateMockWordData(normalizedTerm);
  
  // Cache the result
  cacheWordLookup(normalizedTerm, mockData);
  
  return mockData;
}

/**
 * Store word lookup result in local storage
 */
function cacheWordLookup(term: string, result: WordLookupResult): void {
  const cacheKey = CACHE_PREFIX + term;
  const cacheEntry = {
    data: result,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Failed to cache word lookup:', error);
  }
}

/**
 * Retrieve cached word lookup from local storage
 */
function getCachedWord(term: string): WordLookupResult | null {
  const cacheKey = CACHE_PREFIX + term;
  
  try {
    const cacheEntry = localStorage.getItem(cacheKey);
    if (!cacheEntry) return null;
    
    const { data, timestamp } = JSON.parse(cacheEntry);
    
    // Check if cache entry is still valid
    if (Date.now() - timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to retrieve cached word lookup:', error);
    return null;
  }
}