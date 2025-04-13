import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom styles to match the design reference
document.head.innerHTML += `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
  <title>VocabFlash - English Vocabulary Learning App</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #F9FAFB;
    }
    
    .flashcard {
      perspective: 1000px;
      transform-style: preserve-3d;
      transition: transform 0.6s;
      height: 100%;
    }
    
    .flashcard-inner {
      position: relative;
      width: 100%;
      height: 100%;
      text-align: center;
      transition: transform 0.6s;
      transform-style: preserve-3d;
    }
    
    .flashcard.flipped .flashcard-inner {
      transform: rotateY(180deg);
    }
    
    .flashcard-front, .flashcard-back {
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: 0.75rem;
    }
    
    .flashcard-back {
      transform: rotateY(180deg);
    }

    .progress-circle {
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }
  </style>
`;

createRoot(document.getElementById("root")!).render(<App />);
