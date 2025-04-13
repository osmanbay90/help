import { useState } from "react";
import { useVocab } from "@/contexts/VocabContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export default function SettingsDialog() {
  const { settings, updateSettings } = useVocab();
  const [isOpen, setIsOpen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(settings.dailyFlashcardLimit.toString());
  
  const handleSave = () => {
    const parsedLimit = parseInt(dailyLimit);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return;
    }
    updateSettings({ dailyFlashcardLimit: parsedLimit });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>App Settings</DialogTitle>
          <DialogDescription>
            Configure your vocabulary learning preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dailyLimit" className="text-right">
              Daily Cards
            </Label>
            <Input
              id="dailyLimit"
              type="number"
              min="1"
              max="100"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="col-span-4 text-sm text-gray-500">
            Maximum number of flashcards to practice each day.
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}