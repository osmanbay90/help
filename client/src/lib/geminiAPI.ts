import { WordLookupResult } from "@shared/schema";
import { staticLookupWord } from "./staticApi";

// Detect if we're running in static mode (i.e., no backend server available)
const isStaticMode = () => {
  // Check if we're running on GitHub Pages or another static host
  const isGitHubPages = window.location.hostname.includes('github.io');
  const isStaticHost = window.location.hostname.includes('.netlify.app') ||
                      window.location.hostname.includes('.vercel.app');
  
  // Also check for a URL parameter that can force static mode for testing
  const urlParams = new URLSearchParams(window.location.search);
  const forceStatic = urlParams.get('static') === 'true';
  
  return isGitHubPages || isStaticHost || forceStatic;
};

/**
 * Calls the appropriate word lookup implementation based on deployment environment
 * 
 * @param term Word or phrase to look up
 * @returns Promise with word details or throws error
 */
export async function lookupWord(term: string): Promise<WordLookupResult> {
  if (isStaticMode()) {
    return staticLookupWord(term);
  }
  
  // Normal mode with backend API
  try {
    const response = await fetch(`/api/lookup/${encodeURIComponent(term)}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error looking up word: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API request failed, falling back to static mode", error);
    // Fall back to static mode if API request fails
    return staticLookupWord(term);
  }
}
