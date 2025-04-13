import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { lookupWord } from "./gemini";
import { wordLookupSchema, insertVocabularySchema, insertCollectionSchema, insertCollectionItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for vocabulary operations
  
  // Get word definition from Gemini API
  app.get("/api/lookup/:term", async (req, res) => {
    try {
      const term = req.params.term;
      
      // Check if we have it cached
      const cached = await storage.getCachedWordLookup(term);
      if (cached) {
        return res.json(cached);
      }
      
      // Lookup the term
      const result = await lookupWord(term);
      if (!result) {
        return res.status(404).json({ message: "Word not found" });
      }
      
      // Validate and parse the result
      const parsed = wordLookupSchema.safeParse(result);
      if (!parsed.success) {
        return res.status(500).json({ message: "Invalid API response", error: parsed.error });
      }
      
      // Cache the result
      await storage.cacheWordLookup(term, parsed.data);
      
      return res.json(parsed.data);
    } catch (error) {
      console.error("Error looking up word:", error);
      return res.status(500).json({ message: "Error looking up word", error: String(error) });
    }
  });
  
  // Save vocabulary item
  app.post("/api/vocabulary", async (req, res) => {
    try {
      const data = insertVocabularySchema.parse(req.body);
      const vocabItem = await storage.createVocabularyItem(data);
      
      // Log activity
      if (data.userId) {
        await storage.logActivity({
          userId: data.userId,
          action: "saved_vocabulary",
          details: { vocabularyId: vocabItem.id, term: vocabItem.term }
        });
      }
      
      return res.status(201).json(vocabItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vocabulary data", error: error.errors });
      }
      return res.status(500).json({ message: "Error saving vocabulary", error: String(error) });
    }
  });
  
  // Get user's vocabulary items
  app.get("/api/vocabulary/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const items = await storage.getVocabularyByUser(userId);
      return res.json(items);
    } catch (error) {
      return res.status(500).json({ message: "Error getting vocabulary", error: String(error) });
    }
  });
  
  // Toggle favorite status
  app.patch("/api/vocabulary/:id/favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const updatedItem = await storage.toggleFavorite(id);
      if (!updatedItem) {
        return res.status(404).json({ message: "Vocabulary item not found" });
      }
      
      // Log activity
      if (updatedItem.userId) {
        await storage.logActivity({
          userId: updatedItem.userId,
          action: updatedItem.favorite ? "added_favorite" : "removed_favorite",
          details: { vocabularyId: updatedItem.id, term: updatedItem.term }
        });
      }
      
      return res.json(updatedItem);
    } catch (error) {
      return res.status(500).json({ message: "Error updating favorite status", error: String(error) });
    }
  });
  
  // Get favorite vocabulary items
  app.get("/api/vocabulary/favorites/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const items = await storage.getFavoriteVocabulary(userId);
      return res.json(items);
    } catch (error) {
      return res.status(500).json({ message: "Error getting favorite vocabulary", error: String(error) });
    }
  });
  
  // Collection operations
  
  // Create a new collection
  app.post("/api/collections", async (req, res) => {
    try {
      const data = insertCollectionSchema.parse(req.body);
      const collection = await storage.createCollection(data);
      
      // Log activity
      if (data.userId) {
        await storage.logActivity({
          userId: data.userId,
          action: "created_collection",
          details: { collectionId: collection.id, name: collection.name }
        });
      }
      
      return res.status(201).json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid collection data", error: error.errors });
      }
      return res.status(500).json({ message: "Error creating collection", error: String(error) });
    }
  });
  
  // Get user's collections
  app.get("/api/collections/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const collections = await storage.getCollectionsByUser(userId);
      return res.json(collections);
    } catch (error) {
      return res.status(500).json({ message: "Error getting collections", error: String(error) });
    }
  });
  
  // Add item to collection
  app.post("/api/collections/item", async (req, res) => {
    try {
      const data = insertCollectionItemSchema.parse(req.body);
      const item = await storage.addItemToCollection(data);
      
      // Get collection and vocabulary for activity log
      const collection = await storage.getCollection(data.collectionId);
      const vocabulary = await storage.getVocabularyItem(data.vocabularyId);
      
      if (collection && vocabulary && vocabulary.userId) {
        await storage.logActivity({
          userId: vocabulary.userId,
          action: "added_to_collection",
          details: { 
            collectionId: collection.id, 
            collectionName: collection.name,
            vocabularyId: vocabulary.id,
            term: vocabulary.term
          }
        });
      }
      
      return res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid collection item data", error: error.errors });
      }
      return res.status(500).json({ message: "Error adding item to collection", error: String(error) });
    }
  });
  
  // Get collection items
  app.get("/api/collections/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid collection ID" });
      }
      
      const items = await storage.getCollectionItems(id);
      return res.json(items);
    } catch (error) {
      return res.status(500).json({ message: "Error getting collection items", error: String(error) });
    }
  });
  
  // Flashcard review operations
  
  // Get due flashcards for review
  app.get("/api/flashcards/due/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const dueCards = await storage.getDueFlashcards(userId, limit);
      return res.json(dueCards);
    } catch (error) {
      return res.status(500).json({ message: "Error getting due flashcards", error: String(error) });
    }
  });
  
  // Update flashcard review after user rates it
  app.patch("/api/flashcards/review/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const { easeFactor, interval, repetitions, dueDate } = req.body;
      const updatedReview = await storage.updateFlashcardReview(id, {
        easeFactor, interval, repetitions, dueDate
      });
      
      if (!updatedReview) {
        return res.status(404).json({ message: "Flashcard review not found" });
      }
      
      // Log activity
      await storage.logActivity({
        userId: updatedReview.userId,
        action: "reviewed_flashcard",
        details: { 
          reviewId: updatedReview.id,
          vocabularyId: updatedReview.vocabularyId,
          newInterval: updatedReview.interval
        }
      });
      
      return res.json(updatedReview);
    } catch (error) {
      return res.status(500).json({ message: "Error updating flashcard review", error: String(error) });
    }
  });
  
  // Activity log
  
  // Get recent activity
  app.get("/api/activity/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivity(userId, limit);
      return res.json(activities);
    } catch (error) {
      return res.status(500).json({ message: "Error getting activity log", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
