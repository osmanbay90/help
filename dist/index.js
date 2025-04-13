// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  vocabularyItems;
  vocabCollections;
  collectionItemsMap;
  flashcardReviewsMap;
  activityLogs;
  wordLookupCache;
  currentUserId;
  currentVocabId;
  currentCollectionId;
  currentCollectionItemId;
  currentReviewId;
  currentActivityId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.vocabularyItems = /* @__PURE__ */ new Map();
    this.vocabCollections = /* @__PURE__ */ new Map();
    this.collectionItemsMap = /* @__PURE__ */ new Map();
    this.flashcardReviewsMap = /* @__PURE__ */ new Map();
    this.activityLogs = /* @__PURE__ */ new Map();
    this.wordLookupCache = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentVocabId = 1;
    this.currentCollectionId = 1;
    this.currentCollectionItemId = 1;
    this.currentReviewId = 1;
    this.currentActivityId = 1;
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Vocabulary operations
  async getVocabularyItem(id) {
    return this.vocabularyItems.get(id);
  }
  async getVocabularyByTerm(term, userId) {
    return Array.from(this.vocabularyItems.values()).find(
      (item) => item.term.toLowerCase() === term.toLowerCase() && (userId === void 0 || item.userId === userId)
    );
  }
  async getVocabularyByUser(userId) {
    return Array.from(this.vocabularyItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  async getFavoriteVocabulary(userId) {
    return Array.from(this.vocabularyItems.values()).filter(
      (item) => item.userId === userId && item.favorite === true
    );
  }
  async createVocabularyItem(item) {
    const id = this.currentVocabId++;
    const dateAdded = /* @__PURE__ */ new Date();
    const vocabItem = { ...item, id, dateAdded };
    this.vocabularyItems.set(id, vocabItem);
    return vocabItem;
  }
  async updateVocabularyItem(id, item) {
    const existingItem = this.vocabularyItems.get(id);
    if (!existingItem) return void 0;
    const updatedItem = { ...existingItem, ...item };
    this.vocabularyItems.set(id, updatedItem);
    return updatedItem;
  }
  async deleteVocabularyItem(id) {
    return this.vocabularyItems.delete(id);
  }
  async toggleFavorite(id) {
    const item = this.vocabularyItems.get(id);
    if (!item) return void 0;
    const updatedItem = { ...item, favorite: !item.favorite };
    this.vocabularyItems.set(id, updatedItem);
    return updatedItem;
  }
  // Collection operations
  async getCollection(id) {
    return this.vocabCollections.get(id);
  }
  async getCollectionsByUser(userId) {
    return Array.from(this.vocabCollections.values()).filter(
      (collection) => collection.userId === userId
    );
  }
  async createCollection(collection) {
    const id = this.currentCollectionId++;
    const dateCreated = /* @__PURE__ */ new Date();
    const newCollection = { ...collection, id, dateCreated };
    this.vocabCollections.set(id, newCollection);
    return newCollection;
  }
  async updateCollection(id, collection) {
    const existingCollection = this.vocabCollections.get(id);
    if (!existingCollection) return void 0;
    const updatedCollection = { ...existingCollection, ...collection };
    this.vocabCollections.set(id, updatedCollection);
    return updatedCollection;
  }
  async deleteCollection(id) {
    const itemsToDelete = Array.from(this.collectionItemsMap.values()).filter((item) => item.collectionId === id);
    for (const item of itemsToDelete) {
      this.collectionItemsMap.delete(item.id);
    }
    return this.vocabCollections.delete(id);
  }
  // Collection items operations
  async addItemToCollection(item) {
    const existingItem = Array.from(this.collectionItemsMap.values()).find(
      (existing) => existing.collectionId === item.collectionId && existing.vocabularyId === item.vocabularyId
    );
    if (existingItem) return existingItem;
    const id = this.currentCollectionItemId++;
    const newItem = { ...item, id };
    this.collectionItemsMap.set(id, newItem);
    return newItem;
  }
  async removeItemFromCollection(collectionId, vocabularyId) {
    const itemToRemove = Array.from(this.collectionItemsMap.values()).find(
      (item) => item.collectionId === collectionId && item.vocabularyId === vocabularyId
    );
    if (!itemToRemove) return false;
    return this.collectionItemsMap.delete(itemToRemove.id);
  }
  async getCollectionItems(collectionId) {
    const itemIds = Array.from(this.collectionItemsMap.values()).filter((item) => item.collectionId === collectionId).map((item) => item.vocabularyId);
    return Array.from(this.vocabularyItems.values()).filter((vocabItem) => itemIds.includes(vocabItem.id));
  }
  // Flashcard review operations
  async getFlashcardReview(vocabularyId, userId) {
    return Array.from(this.flashcardReviewsMap.values()).find(
      (review) => review.vocabularyId === vocabularyId && review.userId === userId
    );
  }
  async getDueFlashcards(userId, limit = 20) {
    const now = /* @__PURE__ */ new Date();
    const dueReviews = Array.from(this.flashcardReviewsMap.values()).filter((review) => review.userId === userId && review.dueDate <= now).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, limit);
    return dueReviews.map((review) => {
      const vocabItem = this.vocabularyItems.get(review.vocabularyId);
      return vocabItem ? { ...vocabItem, reviewId: review.id } : null;
    }).filter((item) => item !== null);
  }
  async createFlashcardReview(review) {
    const id = this.currentReviewId++;
    const lastReviewDate = /* @__PURE__ */ new Date();
    const newReview = { ...review, id, lastReviewDate };
    this.flashcardReviewsMap.set(id, newReview);
    return newReview;
  }
  async updateFlashcardReview(id, review) {
    const existingReview = this.flashcardReviewsMap.get(id);
    if (!existingReview) return void 0;
    const lastReviewDate = /* @__PURE__ */ new Date();
    const updatedReview = { ...existingReview, ...review, lastReviewDate };
    this.flashcardReviewsMap.set(id, updatedReview);
    return updatedReview;
  }
  // Activity log operations
  async logActivity(activity) {
    const id = this.currentActivityId++;
    const timestamp2 = /* @__PURE__ */ new Date();
    const newActivity = { ...activity, id, timestamp: timestamp2 };
    this.activityLogs.set(id, newActivity);
    return newActivity;
  }
  async getRecentActivity(userId, limit = 10) {
    return Array.from(this.activityLogs.values()).filter((activity) => activity.userId === userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }
  // Cache operations
  async cacheWordLookup(term, result) {
    const normalizedTerm = term.toLowerCase().trim();
    this.wordLookupCache.set(normalizedTerm, {
      result,
      timestamp: Date.now()
    });
  }
  async getCachedWordLookup(term) {
    const normalizedTerm = term.toLowerCase().trim();
    const cached = this.wordLookupCache.get(normalizedTerm);
    if (!cached) return void 0;
    const CACHE_TTL = 24 * 60 * 60 * 1e3;
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      this.wordLookupCache.delete(normalizedTerm);
      return void 0;
    }
    return cached.result;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var vocabulary = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  term: text("term").notNull(),
  partOfSpeech: text("part_of_speech"),
  pronunciation: text("pronunciation"),
  definitions: json("definitions").notNull().$type(),
  examples: json("examples").notNull().$type(),
  culturalContext: text("cultural_context"),
  relatedForms: json("related_forms").$type(),
  favorite: boolean("favorite").default(false),
  dateAdded: timestamp("date_added").defaultNow(),
  userId: integer("user_id").references(() => users.id)
});
var insertVocabularySchema = createInsertSchema(vocabulary).omit({ id: true, dateAdded: true });
var collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#4F46E5"),
  dateCreated: timestamp("date_created").defaultNow(),
  userId: integer("user_id").references(() => users.id)
});
var insertCollectionSchema = createInsertSchema(collections).omit({ id: true, dateCreated: true });
var collectionItems = pgTable("collection_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").references(() => collections.id).notNull(),
  vocabularyId: integer("vocabulary_id").references(() => vocabulary.id).notNull()
});
var insertCollectionItemSchema = createInsertSchema(collectionItems).omit({ id: true });
var flashcardReviews = pgTable("flashcard_reviews", {
  id: serial("id").primaryKey(),
  vocabularyId: integer("vocabulary_id").references(() => vocabulary.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  easeFactor: integer("ease_factor").default(250),
  // SM-2 algorithm ease factor (multiplied by 100)
  interval: integer("interval").default(1),
  // interval in days
  repetitions: integer("repetitions").default(0),
  // number of successful repetitions in a row
  dueDate: timestamp("due_date").notNull(),
  // next review date
  lastReviewDate: timestamp("last_review_date").defaultNow()
});
var insertFlashcardReviewSchema = createInsertSchema(flashcardReviews).omit({ id: true, lastReviewDate: true });
var activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  // e.g., "learned_word", "created_collection", "reviewed_flashcard"
  details: json("details").$type(),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true, timestamp: true });
var wordLookupSchema = z.object({
  term: z.string(),
  partOfSpeech: z.string().optional(),
  pronunciation: z.string().optional(),
  definitions: z.array(z.string()),
  examples: z.array(z.string()),
  culturalContext: z.string().optional(),
  relatedForms: z.record(z.string()).optional()
});

// server/gemini.ts
var apiKey = process.env.GEMINI_API_KEY || "";
async function lookupWord(term) {
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
    throw new Error("Gemini API key is not configured");
  }
  try {
    const prompt = generateWordLookupPrompt(term);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      }
    );
    if (!response.ok) {
      console.error(`Gemini API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }
    const responseData = await response.json();
    const text2 = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text2) {
      console.error("Invalid or empty response from Gemini API");
      return null;
    }
    try {
      const jsonMatch = text2.match(/```json\n([\s\S]*?)\n```/) || text2.match(/```\n([\s\S]*?)\n```/) || text2.match(/{[\s\S]*}/);
      const jsonContent = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text2;
      const parsedData = JSON.parse(jsonContent);
      const validatedData = wordLookupSchema.parse(parsedData);
      return validatedData;
    } catch (error) {
      console.error("Error parsing Gemini API response:", error);
      console.error("Raw response:", text2);
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
function generateWordLookupPrompt(term) {
  return `
I need detailed information about the English word or phrase "${term}". 
Please provide comprehensive data formatted as JSON with the following structure:

{
  "term": "the exact word or phrase",
  "partOfSpeech": "the primary part of speech (noun, verb, adjective, etc.)",
  "pronunciation": "phonetic pronunciation in IPA format",
  "definitions": ["list of definitions as clear, concise strings"],
  "examples": ["3-5 example sentences showing natural usage of the term, as complete strings"],
  "culturalContext": "explanation of any cultural or historical significance, common usage contexts, or connotations",
  "relatedForms": {
    "noun": "related noun form (if applicable)",
    "verb": "related verb form (if applicable)",
    "adjective": "related adjective form (if applicable)",
    "adverb": "related adverb form (if applicable)"
  }
}

Include only fields that are relevant to this particular word/phrase. If a field is not applicable (like related forms for certain words), omit it or provide an empty value.

For the definitions, provide distinct meanings if the word has multiple senses.
For examples, create natural-sounding sentences that demonstrate correct usage.
For cultural context, mention any notable usage in literature, media, or everyday communication.

Format the response as valid JSON only, with no additional text before or after.
`;
}

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/lookup/:term", async (req, res) => {
    try {
      const term = req.params.term;
      const cached = await storage.getCachedWordLookup(term);
      if (cached) {
        return res.json(cached);
      }
      const result = await lookupWord(term);
      if (!result) {
        return res.status(404).json({ message: "Word not found" });
      }
      const parsed = wordLookupSchema.safeParse(result);
      if (!parsed.success) {
        return res.status(500).json({ message: "Invalid API response", error: parsed.error });
      }
      await storage.cacheWordLookup(term, parsed.data);
      return res.json(parsed.data);
    } catch (error) {
      console.error("Error looking up word:", error);
      return res.status(500).json({ message: "Error looking up word", error: String(error) });
    }
  });
  app2.post("/api/vocabulary", async (req, res) => {
    try {
      const data = insertVocabularySchema.parse(req.body);
      const vocabItem = await storage.createVocabularyItem(data);
      if (data.userId) {
        await storage.logActivity({
          userId: data.userId,
          action: "saved_vocabulary",
          details: { vocabularyId: vocabItem.id, term: vocabItem.term }
        });
      }
      return res.status(201).json(vocabItem);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid vocabulary data", error: error.errors });
      }
      return res.status(500).json({ message: "Error saving vocabulary", error: String(error) });
    }
  });
  app2.get("/api/vocabulary/user/:userId", async (req, res) => {
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
  app2.patch("/api/vocabulary/:id/favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const updatedItem = await storage.toggleFavorite(id);
      if (!updatedItem) {
        return res.status(404).json({ message: "Vocabulary item not found" });
      }
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
  app2.get("/api/vocabulary/favorites/:userId", async (req, res) => {
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
  app2.post("/api/collections", async (req, res) => {
    try {
      const data = insertCollectionSchema.parse(req.body);
      const collection = await storage.createCollection(data);
      if (data.userId) {
        await storage.logActivity({
          userId: data.userId,
          action: "created_collection",
          details: { collectionId: collection.id, name: collection.name }
        });
      }
      return res.status(201).json(collection);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid collection data", error: error.errors });
      }
      return res.status(500).json({ message: "Error creating collection", error: String(error) });
    }
  });
  app2.get("/api/collections/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const collections2 = await storage.getCollectionsByUser(userId);
      return res.json(collections2);
    } catch (error) {
      return res.status(500).json({ message: "Error getting collections", error: String(error) });
    }
  });
  app2.post("/api/collections/item", async (req, res) => {
    try {
      const data = insertCollectionItemSchema.parse(req.body);
      const item = await storage.addItemToCollection(data);
      const collection = await storage.getCollection(data.collectionId);
      const vocabulary2 = await storage.getVocabularyItem(data.vocabularyId);
      if (collection && vocabulary2 && vocabulary2.userId) {
        await storage.logActivity({
          userId: vocabulary2.userId,
          action: "added_to_collection",
          details: {
            collectionId: collection.id,
            collectionName: collection.name,
            vocabularyId: vocabulary2.id,
            term: vocabulary2.term
          }
        });
      }
      return res.status(201).json(item);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid collection item data", error: error.errors });
      }
      return res.status(500).json({ message: "Error adding item to collection", error: String(error) });
    }
  });
  app2.get("/api/collections/:id/items", async (req, res) => {
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
  app2.get("/api/flashcards/due/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const dueCards = await storage.getDueFlashcards(userId, limit);
      return res.json(dueCards);
    } catch (error) {
      return res.status(500).json({ message: "Error getting due flashcards", error: String(error) });
    }
  });
  app2.patch("/api/flashcards/review/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      const { easeFactor, interval, repetitions, dueDate } = req.body;
      const updatedReview = await storage.updateFlashcardReview(id, {
        easeFactor,
        interval,
        repetitions,
        dueDate
      });
      if (!updatedReview) {
        return res.status(404).json({ message: "Flashcard review not found" });
      }
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
  app2.get("/api/activity/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const activities = await storage.getRecentActivity(userId, limit);
      return res.json(activities);
    } catch (error) {
      return res.status(500).json({ message: "Error getting activity log", error: String(error) });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
