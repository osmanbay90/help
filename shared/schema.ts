import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Vocabulary items (words and phrases)
export const vocabulary = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  term: text("term").notNull(),
  phonetics: text("phonetics"),
  definitionText: text("definition_text").notNull(),
  partOfSpeech: text("part_of_speech"),
  context: text("context"),
  exampleSentences: text("example_sentences"), // Pipe-delimited string of examples
  synonyms: text("synonyms"), // Pipe-delimited string of synonyms
  antonyms: text("antonyms"), // Pipe-delimited string of antonyms
  favorite: boolean("favorite").default(false),
  dateAdded: timestamp("date_added").defaultNow(),
  userId: integer("user_id").references(() => users.id),
  
  // Spaced repetition fields
  easeFactor: integer("ease_factor").default(250),
  interval: integer("interval").default(1),
  repetitions: integer("repetitions").default(0),
  dueDate: timestamp("due_date").defaultNow(),
});

export const insertVocabularySchema = createInsertSchema(vocabulary)
  .omit({ id: true, dateAdded: true });

export type InsertVocabulary = z.infer<typeof insertVocabularySchema>;
export type VocabularyItem = typeof vocabulary.$inferSelect;

// Collections for grouping vocabulary
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#4F46E5"),
  dateCreated: timestamp("date_created").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertCollectionSchema = createInsertSchema(collections)
  .omit({ id: true, dateCreated: true });

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

// Collection items - relation between vocabulary and collections
export const collectionItems = pgTable("collection_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").references(() => collections.id).notNull(),
  vocabularyId: integer("vocabulary_id").references(() => vocabulary.id).notNull(),
});

export const insertCollectionItemSchema = createInsertSchema(collectionItems)
  .omit({ id: true });

export type InsertCollectionItem = z.infer<typeof insertCollectionItemSchema>;
export type CollectionItem = typeof collectionItems.$inferSelect;

// Flashcard review history for spaced repetition
export const flashcardReviews = pgTable("flashcard_reviews", {
  id: serial("id").primaryKey(),
  vocabularyId: integer("vocabulary_id").references(() => vocabulary.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  easeFactor: integer("ease_factor").default(250), // SM-2 algorithm ease factor (multiplied by 100)
  interval: integer("interval").default(1), // interval in days
  repetitions: integer("repetitions").default(0), // number of successful repetitions in a row
  dueDate: timestamp("due_date").notNull(), // next review date
  lastReviewDate: timestamp("last_review_date").defaultNow(),
});

export const insertFlashcardReviewSchema = createInsertSchema(flashcardReviews)
  .omit({ id: true, lastReviewDate: true });

export type InsertFlashcardReview = z.infer<typeof insertFlashcardReviewSchema>;
export type FlashcardReview = typeof flashcardReviews.$inferSelect;

// Activity log for tracking user progress
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // e.g., "learned_word", "created_collection", "reviewed_flashcard"
  details: json("details").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLog)
  .omit({ id: true, timestamp: true });

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;

// API Response type for Gemini word lookup
export const definitionSchema = z.object({
  partOfSpeech: z.string(),
  definition: z.string(),
  examples: z.array(z.string())
});

export const wordLookupSchema = z.object({
  term: z.string(),
  phonetics: z.string().optional(),
  definitions: z.array(definitionSchema),
  usage: z.object({
    formalityLevel: z.string().optional(),
    regionalContext: z.string().optional(),
    contextualUsage: z.string().optional()
  }),
  related: z.object({
    synonyms: z.array(z.string()).optional(),
    antonyms: z.array(z.string()).optional()
  })
});

export type WordLookupResult = z.infer<typeof wordLookupSchema>;
