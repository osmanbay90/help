import { z } from "zod";
import { wordLookupSchema, WordLookupResult } from "@shared/schema";

// API Key from environment variables
const apiKey = process.env.GEMINI_API_KEY || "";

// Function to lookup a word using Gemini API
export async function lookupWord(term: string): Promise<WordLookupResult | null> {
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
    throw new Error("Gemini API key is not configured");
  }

  try {
    const prompt = generateWordLookupPrompt(term);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    
    // Extract text from the response
    const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error("Invalid or empty response from Gemini API");
      return null;
    }

    // Parse the response as JSON
    try {
      // Extract JSON content from the response if it's wrapped in markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) ||
                        text.match(/{[\s\S]*}/);
      
      const jsonContent = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      const parsedData = JSON.parse(jsonContent);
      
      // Validate against our schema
      const validatedData = wordLookupSchema.parse(parsedData);
      
      return validatedData;
    } catch (error) {
      console.error("Error parsing Gemini API response:", error);
      console.error("Raw response:", text);
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Function to generate the prompt for word lookup
function generateWordLookupPrompt(term: string): string {
  return `
I need detailed information about the English word or phrase "${term}". 
Please provide comprehensive data formatted as JSON with the following structure:

{
  "term": "the exact word or phrase",
  "partOfSpeech": "the primary part of speech (noun, verb, adjective, etc.)",
  "pronunciation": "phonetic pronunciation in IPA format",
  "definitions": ["list of definitions as clear, concise strings"],
  "examples": ["3-5 example sentences showing natural usage of the term, as complete strings"],
  "culturalContext": "explanation of any cultural or historical significance, common usage contexts, or connotations",
  "relatedForms": {
    "noun": "related noun form (if applicable)",
    "verb": "related verb form (if applicable)",
    "adjective": "related adjective form (if applicable)",
    "adverb": "related adverb form (if applicable)"
  }
}

Include only fields that are relevant to this particular word/phrase. If a field is not applicable (like related forms for certain words), omit it or provide an empty value.

For the definitions, provide distinct meanings if the word has multiple senses.
For examples, create natural-sounding sentences that demonstrate correct usage.
For cultural context, mention any notable usage in literature, media, or everyday communication.

Format the response as valid JSON only, with no additional text before or after.
`;
}
