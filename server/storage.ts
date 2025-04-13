import { 
  User, InsertUser, users, 
  VocabularyItem, InsertVocabulary, vocabulary,
  Collection, InsertCollection, collections,
  CollectionItem, InsertCollectionItem, collectionItems,
  FlashcardReview, InsertFlashcardReview, flashcardReviews,
  ActivityLog, InsertActivityLog, activityLog,
  WordLookupResult
} from "@shared/schema";

// Storage interface for all database operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vocabulary operations
  getVocabularyItem(id: number): Promise<VocabularyItem | undefined>;
  getVocabularyByTerm(term: string, userId?: number): Promise<VocabularyItem | undefined>;
  getVocabularyByUser(userId: number): Promise<VocabularyItem[]>;
  getFavoriteVocabulary(userId: number): Promise<VocabularyItem[]>;
  createVocabularyItem(item: InsertVocabulary): Promise<VocabularyItem>;
  updateVocabularyItem(id: number, item: Partial<InsertVocabulary>): Promise<VocabularyItem | undefined>;
  deleteVocabularyItem(id: number): Promise<boolean>;
  toggleFavorite(id: number): Promise<VocabularyItem | undefined>;
  
  // Collection operations
  getCollection(id: number): Promise<Collection | undefined>;
  getCollectionsByUser(userId: number): Promise<Collection[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: number, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: number): Promise<boolean>;
  
  // Collection items operations
  addItemToCollection(item: InsertCollectionItem): Promise<CollectionItem>;
  removeItemFromCollection(collectionId: number, vocabularyId: number): Promise<boolean>;
  getCollectionItems(collectionId: number): Promise<VocabularyItem[]>;
  
  // Flashcard review operations
  getFlashcardReview(vocabularyId: number, userId: number): Promise<FlashcardReview | undefined>;
  getDueFlashcards(userId: number, limit?: number): Promise<(VocabularyItem & { reviewId: number })[]>;
  createFlashcardReview(review: InsertFlashcardReview): Promise<FlashcardReview>;
  updateFlashcardReview(id: number, review: Partial<InsertFlashcardReview>): Promise<FlashcardReview | undefined>;
  
  // Activity log operations
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(userId: number, limit?: number): Promise<ActivityLog[]>;
  
  // Cache operations
  cacheWordLookup(term: string, result: WordLookupResult): Promise<void>;
  getCachedWordLookup(term: string): Promise<WordLookupResult | undefined>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vocabularyItems: Map<number, VocabularyItem>;
  private vocabCollections: Map<number, Collection>;
  private collectionItemsMap: Map<number, CollectionItem>;
  private flashcardReviewsMap: Map<number, FlashcardReview>;
  private activityLogs: Map<number, ActivityLog>;
  private wordLookupCache: Map<string, { result: WordLookupResult, timestamp: number }>;
  
  private currentUserId: number;
  private currentVocabId: number;
  private currentCollectionId: number;
  private currentCollectionItemId: number;
  private currentReviewId: number;
  private currentActivityId: number;
  
  constructor() {
    this.users = new Map();
    this.vocabularyItems = new Map();
    this.vocabCollections = new Map();
    this.collectionItemsMap = new Map();
    this.flashcardReviewsMap = new Map();
    this.activityLogs = new Map();
    this.wordLookupCache = new Map();
    
    this.currentUserId = 1;
    this.currentVocabId = 1;
    this.currentCollectionId = 1;
    this.currentCollectionItemId = 1;
    this.currentReviewId = 1;
    this.currentActivityId = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Vocabulary operations
  async getVocabularyItem(id: number): Promise<VocabularyItem | undefined> {
    return this.vocabularyItems.get(id);
  }
  
  async getVocabularyByTerm(term: string, userId?: number): Promise<VocabularyItem | undefined> {
    return Array.from(this.vocabularyItems.values()).find(
      (item) => item.term.toLowerCase() === term.toLowerCase() && 
                (userId === undefined || item.userId === userId)
    );
  }
  
  async getVocabularyByUser(userId: number): Promise<VocabularyItem[]> {
    return Array.from(this.vocabularyItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getFavoriteVocabulary(userId: number): Promise<VocabularyItem[]> {
    return Array.from(this.vocabularyItems.values()).filter(
      (item) => item.userId === userId && item.favorite === true
    );
  }
  
  async createVocabularyItem(item: InsertVocabulary): Promise<VocabularyItem> {
    const id = this.currentVocabId++;
    const dateAdded = new Date();
    const vocabItem: VocabularyItem = { ...item, id, dateAdded };
    this.vocabularyItems.set(id, vocabItem);
    return vocabItem;
  }
  
  async updateVocabularyItem(id: number, item: Partial<InsertVocabulary>): Promise<VocabularyItem | undefined> {
    const existingItem = this.vocabularyItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.vocabularyItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteVocabularyItem(id: number): Promise<boolean> {
    return this.vocabularyItems.delete(id);
  }
  
  async toggleFavorite(id: number): Promise<VocabularyItem | undefined> {
    const item = this.vocabularyItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, favorite: !item.favorite };
    this.vocabularyItems.set(id, updatedItem);
    return updatedItem;
  }
  
  // Collection operations
  async getCollection(id: number): Promise<Collection | undefined> {
    return this.vocabCollections.get(id);
  }
  
  async getCollectionsByUser(userId: number): Promise<Collection[]> {
    return Array.from(this.vocabCollections.values()).filter(
      (collection) => collection.userId === userId
    );
  }
  
  async createCollection(collection: InsertCollection): Promise<Collection> {
    const id = this.currentCollectionId++;
    const dateCreated = new Date();
    const newCollection: Collection = { ...collection, id, dateCreated };
    this.vocabCollections.set(id, newCollection);
    return newCollection;
  }
  
  async updateCollection(id: number, collection: Partial<InsertCollection>): Promise<Collection | undefined> {
    const existingCollection = this.vocabCollections.get(id);
    if (!existingCollection) return undefined;
    
    const updatedCollection = { ...existingCollection, ...collection };
    this.vocabCollections.set(id, updatedCollection);
    return updatedCollection;
  }
  
  async deleteCollection(id: number): Promise<boolean> {
    // Delete all collection items related to this collection
    const itemsToDelete = Array.from(this.collectionItemsMap.values())
      .filter(item => item.collectionId === id);
      
    for (const item of itemsToDelete) {
      this.collectionItemsMap.delete(item.id);
    }
    
    return this.vocabCollections.delete(id);
  }
  
  // Collection items operations
  async addItemToCollection(item: InsertCollectionItem): Promise<CollectionItem> {
    // Check if item already exists
    const existingItem = Array.from(this.collectionItemsMap.values()).find(
      existing => existing.collectionId === item.collectionId && 
                 existing.vocabularyId === item.vocabularyId
    );
    
    if (existingItem) return existingItem;
    
    const id = this.currentCollectionItemId++;
    const newItem: CollectionItem = { ...item, id };
    this.collectionItemsMap.set(id, newItem);
    return newItem;
  }
  
  async removeItemFromCollection(collectionId: number, vocabularyId: number): Promise<boolean> {
    const itemToRemove = Array.from(this.collectionItemsMap.values()).find(
      item => item.collectionId === collectionId && item.vocabularyId === vocabularyId
    );
    
    if (!itemToRemove) return false;
    return this.collectionItemsMap.delete(itemToRemove.id);
  }
  
  async getCollectionItems(collectionId: number): Promise<VocabularyItem[]> {
    const itemIds = Array.from(this.collectionItemsMap.values())
      .filter(item => item.collectionId === collectionId)
      .map(item => item.vocabularyId);
    
    return Array.from(this.vocabularyItems.values())
      .filter(vocabItem => itemIds.includes(vocabItem.id));
  }
  
  // Flashcard review operations
  async getFlashcardReview(vocabularyId: number, userId: number): Promise<FlashcardReview | undefined> {
    return Array.from(this.flashcardReviewsMap.values()).find(
      review => review.vocabularyId === vocabularyId && review.userId === userId
    );
  }
  
  async getDueFlashcards(userId: number, limit = 20): Promise<(VocabularyItem & { reviewId: number })[]> {
    const now = new Date();
    
    // Get all reviews due for this user
    const dueReviews = Array.from(this.flashcardReviewsMap.values())
      .filter(review => review.userId === userId && review.dueDate <= now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, limit);
    
    // Get vocabulary items for these reviews
    return dueReviews
      .map(review => {
        const vocabItem = this.vocabularyItems.get(review.vocabularyId);
        return vocabItem ? { ...vocabItem, reviewId: review.id } : null;
      })
      .filter((item): item is VocabularyItem & { reviewId: number } => item !== null);
  }
  
  async createFlashcardReview(review: InsertFlashcardReview): Promise<FlashcardReview> {
    const id = this.currentReviewId++;
    const lastReviewDate = new Date();
    const newReview: FlashcardReview = { ...review, id, lastReviewDate };
    this.flashcardReviewsMap.set(id, newReview);
    return newReview;
  }
  
  async updateFlashcardReview(id: number, review: Partial<InsertFlashcardReview>): Promise<FlashcardReview | undefined> {
    const existingReview = this.flashcardReviewsMap.get(id);
    if (!existingReview) return undefined;
    
    const lastReviewDate = new Date();
    const updatedReview = { ...existingReview, ...review, lastReviewDate };
    this.flashcardReviewsMap.set(id, updatedReview);
    return updatedReview;
  }
  
  // Activity log operations
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentActivityId++;
    const timestamp = new Date();
    const newActivity: ActivityLog = { ...activity, id, timestamp };
    this.activityLogs.set(id, newActivity);
    return newActivity;
  }
  
  async getRecentActivity(userId: number, limit = 10): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  // Cache operations
  async cacheWordLookup(term: string, result: WordLookupResult): Promise<void> {
    const normalizedTerm = term.toLowerCase().trim();
    this.wordLookupCache.set(normalizedTerm, {
      result,
      timestamp: Date.now()
    });
  }
  
  async getCachedWordLookup(term: string): Promise<WordLookupResult | undefined> {
    const normalizedTerm = term.toLowerCase().trim();
    const cached = this.wordLookupCache.get(normalizedTerm);
    
    if (!cached) return undefined;
    
    // Cache expires after 24 hours
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      this.wordLookupCache.delete(normalizedTerm);
      return undefined;
    }
    
    return cached.result;
  }
}

export const storage = new MemStorage();
