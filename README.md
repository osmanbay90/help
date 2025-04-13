# VocabFlash - Interactive English Vocabulary App

An interactive English vocabulary application with Google Gemini AI integration, spaced repetition flashcards, and personalized collections.

## Features

- **Powerful Word Lookup**: Search for any English word to get comprehensive definitions, usage examples, and cultural context
- **Anki-style Spaced Repetition**: Learn efficiently with a proven flashcard system that optimizes your memorization
- **Customizable Daily Limits**: Set how many flashcards you want to practice each day
- **Pronunciation Support**: Hear the correct pronunciation of words using text-to-speech
- **Personal Collections**: Organize vocabulary into custom collections
- **Progress Tracking**: Monitor your learning progress and vocabulary mastery

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **API Integration**: Google Gemini API for comprehensive word lookups
- **Storage**: In-memory database with localStorage persistence

## Getting Started

### Prerequisites

- Node.js (v14+)
- A Google Gemini API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/YOUR_USERNAME/vocab-flash-app.git
   cd vocab-flash-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser to `http://localhost:5000` to see the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.