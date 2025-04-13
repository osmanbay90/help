import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVocab } from "@/contexts/VocabContext";
import CollectionCard from "@/components/CollectionCard";
import { Collection } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#4F46E5");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get collections from the server
  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ['/api/collections/user/1'], // Hardcoded user ID for demo
  });
  
  // Create a new collection
  const handleCreateCollection = async () => {
    if (!name) {
      toast({
        title: "Missing collection name",
        description: "Please provide a name for your collection",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/collections', {
        name,
        description,
        color,
        userId: 1 // Hardcoded user ID for demo
      });
      
      // Invalidate the collections cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/collections/user/1'] });
      
      toast({
        title: "Collection created",
        description: `"${name}" collection has been created successfully`,
      });
      
      // Reset form and close dialog
      setName("");
      setDescription("");
      setColor("#4F46E5");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error creating collection",
        description: "There was a problem creating your collection",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate mock data for demo
  const getMockData = (collection: Collection) => {
    // Generate initial word list from collection name and description
    const words = collection.name.split(' ').concat(collection.description?.split(' ') || []);
    const uniqueWords = [...new Set(words)].filter(word => word.length > 1);
    const itemCount = 5 + Math.floor(Math.random() * 40); // Random count between 5-45
    
    // Generate random initials
    const initials = uniqueWords.length > 0
      ? uniqueWords.map(word => word[0].toUpperCase()).slice(0, 3)
      : ['A', 'B', 'C'].slice(0, 3);
    
    return { itemCount, initials };
  };
  
  // Available colors for collections
  const colorOptions = [
    { value: "#4F46E5", label: "Indigo", class: "bg-indigo-500" },
    { value: "#EC4899", label: "Pink", class: "bg-pink-500" },
    { value: "#8B5CF6", label: "Purple", class: "bg-purple-500" },
    { value: "#F59E0B", label: "Amber", class: "bg-amber-500" },
    { value: "#10B981", label: "Emerald", class: "bg-emerald-500" },
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Collections</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <span className="material-icons text-sm mr-1 align-text-bottom">add</span>
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new collection</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Collection name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea 
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="color" className="text-sm font-medium">Color</label>
                  <div className="flex gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`w-8 h-8 rounded-full ${
                          color === option.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        } ${option.class}`}
                        aria-label={option.label}
                        onClick={() => setColor(option.value)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateCollection}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Collection'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection) => {
              const { itemCount, initials } = getMockData(collection);
              return (
                <CollectionCard 
                  key={collection.id}
                  collection={collection}
                  itemCount={itemCount}
                  initials={initials}
                />
              );
            })}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 text-gray-500 hover:text-primary hover:border-primary cursor-pointer transition-colors"
              onClick={() => setOpen(true)}
            >
              <span className="material-icons text-3xl mb-2">add_circle_outline</span>
              <p className="text-sm font-medium">Create New Collection</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-icons text-gray-400 text-5xl mb-4">folder_open</span>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No collections yet</h3>
            <p className="text-gray-500 mb-6">Create your first collection to organize your vocabulary.</p>
            <Button onClick={() => setOpen(true)}>Create a Collection</Button>
          </div>
        )}
      </section>
    </div>
  );
}
