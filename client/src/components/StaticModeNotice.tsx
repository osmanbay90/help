import { useState, useEffect } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

export default function StaticModeNotice() {
  const [showDialog, setShowDialog] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const inStaticMode = isStaticMode();
  
  useEffect(() => {
    if (inStaticMode) {
      // Check if we've already shown the notice
      const hasSeenNotice = localStorage.getItem('static_mode_notice_seen');
      
      if (!hasSeenNotice) {
        setShowDialog(true);
      } else {
        // Show the banner instead
        setShowBanner(true);
      }
    }
  }, [inStaticMode]);
  
  const handleClose = () => {
    setShowDialog(false);
    setShowBanner(true);
    
    // Remember that we've shown the notice
    localStorage.setItem('static_mode_notice_seen', 'true');
  };
  
  if (!inStaticMode) {
    return null;
  }
  
  return (
    <>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Running in Static Mode</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">
                You're currently using VocabFlash in static mode, which means:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Word definitions are placeholders (no API access)</li>
                <li>Your data is stored only in your browser</li>
                <li>Data will be lost if you clear your browser storage</li>
              </ul>
              <p>
                For the full experience with real word definitions, use the
                full version with backend support.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose}>
              I understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {showBanner && (
        <Alert className="mb-4 border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Static Mode Active</AlertTitle>
          <AlertDescription>
            You're using VocabFlash in static mode with limited functionality.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}