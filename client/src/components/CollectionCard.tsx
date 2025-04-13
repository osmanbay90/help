import { Collection } from "@shared/schema";
import { useLocation } from "wouter";

interface CollectionCardProps {
  collection: Collection;
  itemCount: number;
  initials: string[];
}

// Create a new collection card component
export default function CollectionCard({ 
  collection, 
  itemCount, 
  initials 
}: CollectionCardProps) {
  const [, setLocation] = useLocation();
  
  const colors = [
    "bg-indigo-100 text-primary",
    "bg-pink-100 text-pink-600",
    "bg-green-100 text-green-600",
    "bg-yellow-100 text-yellow-600",
    "bg-purple-100 text-purple-600"
  ];
  
  // Convert collection color to background opacity class
  const getBgClass = () => {
    const colorMap: Record<string, string> = {
      "#4F46E5": "bg-primary bg-opacity-10",
      "#EC4899": "bg-secondary bg-opacity-10",
      "#8B5CF6": "bg-accent bg-opacity-10",
      "#F59E0B": "bg-yellow-500 bg-opacity-10",
      "#10B981": "bg-emerald-500 bg-opacity-10"
    };
    
    return colorMap[collection.color || ""] || "bg-primary bg-opacity-10";
  };
  
  // Convert collection color to icon color class
  const getIconClass = () => {
    const colorMap: Record<string, string> = {
      "#4F46E5": "text-primary",
      "#EC4899": "text-secondary",
      "#8B5CF6": "text-accent",
      "#F59E0B": "text-yellow-500",
      "#10B981": "text-emerald-500"
    };
    
    return colorMap[collection.color || ""] || "text-primary";
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setLocation(`/collections/${collection.id}`)}
    >
      <div className={`h-24 ${getBgClass()} flex items-center justify-center`}>
        <span className={`material-icons text-4xl ${getIconClass()}`}>folder</span>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{collection.name}</h3>
        <p className="text-gray-500 text-sm mb-3">{itemCount} {itemCount === 1 ? 'word' : 'words'}</p>
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {initials.slice(0, 3).map((initial, index) => (
              <div 
                key={index} 
                className={`w-6 h-6 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-xs font-medium border border-white`}
              >
                {initial}
              </div>
            ))}
          </div>
          <button className="text-gray-400 hover:text-primary">
            <span className="material-icons">more_vert</span>
          </button>
        </div>
      </div>
    </div>
  );
}
