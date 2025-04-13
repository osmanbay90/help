import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <span className="material-icons text-indigo-400 text-3xl">auto_stories</span>
              <h2 className="text-xl font-bold">VocabFlash</h2>
            </div>
            <p className="text-gray-400 max-w-md">
              Enhance your English vocabulary with our smart flashcard app powered by Google Gemini API.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white text-sm">Vocabulary Search</Link></li>
                <li><Link href="/flashcards" className="text-gray-300 hover:text-white text-sm">Flashcards</Link></li>
                <li><Link href="/flashcards" className="text-gray-300 hover:text-white text-sm">Spaced Repetition</Link></li>
                <li><Link href="/collections" className="text-gray-300 hover:text-white text-sm">Collections</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">User Guide</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">API Documentation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">FAQ</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">About</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} VocabFlash. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Twitter</span>
              <span className="material-icons">alternate_email</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">GitHub</span>
              <span className="material-icons">code</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">LinkedIn</span>
              <span className="material-icons">work</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
