import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { VocabProvider } from "./contexts/VocabContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import StaticModeNotice from "./components/StaticModeNotice";
import NotFound from "@/pages/not-found";
import SearchPage from "./pages/SearchPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import CollectionsPage from "./pages/CollectionsPage";
import ProgressPage from "./pages/ProgressPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SearchPage} />
      <Route path="/flashcards" component={FlashcardsPage} />
      <Route path="/collections" component={CollectionsPage} />
      <Route path="/progress" component={ProgressPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VocabProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <div className="container mx-auto px-4 py-4">
              <StaticModeNotice />
              <Router />
            </div>
          </main>
          <Footer />
        </div>
        <Toaster />
      </VocabProvider>
    </QueryClientProvider>
  );
}

export default App;
