import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SettingsDialog from "@/components/SettingsDialog";

export default function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getNavLinkClass = (path: string) => {
    const baseClass = "font-medium hover:text-primary transition-colors";
    return location === path 
      ? `${baseClass} text-gray-900` 
      : `${baseClass} text-gray-500`;
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-primary text-3xl">auto_stories</span>
          <h1 className="text-xl font-bold text-gray-800">VocabFlash</h1>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className={getNavLinkClass("/")}>
            Search
          </Link>
          <Link href="/flashcards" className={getNavLinkClass("/flashcards")}>
            Flashcards
          </Link>
          <Link href="/collections" className={getNavLinkClass("/collections")}>
            Collections
          </Link>
          <Link href="/progress" className={getNavLinkClass("/progress")}>
            Progress
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              onClick={() => {/* Open create flashcard modal */}}
            >
              Create Flashcard
            </Button>
            <SettingsDialog />
          </div>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden">
                <span className="material-icons text-gray-600">menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 py-4">
                <Link 
                  href="/" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Search
                </Link>
                <Link 
                  href="/flashcards" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Flashcards
                </Link>
                <Link 
                  href="/collections" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Collections
                </Link>
                <Link 
                  href="/progress" 
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Progress
                </Link>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    setIsMenuOpen(false);
                    /* Open create flashcard modal */
                  }}
                >
                  Create Flashcard
                </Button>
                
                <div className="mt-4 flex justify-center">
                  <SettingsDialog />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
