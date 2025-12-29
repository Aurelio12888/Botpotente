import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === CONSTANTS ===
export const ASSET_PAIRS = [
  "EUR/USD OTC",
  "GBP/USD OTC",
  "USD/JPY OTC",
  "AUD/USD OTC",
  "USD/CHF OTC",
  "EUR/GBP OTC",
  "EUR/JPY OTC",
  "GBP/JPY OTC",
] as const;

export const TIMEFRAMES = ["1s", "5s", "30s", "1m", "5m"] as const;

export const SIGNAL_TYPES = ["CALL", "PUT"] as const; // BUY=CALL, SELL=PUT

// === TABLE DEFINITIONS ===
export const signals = pgTable("signals", {
  id: serial("id").primaryKey(),
  pair: text("pair").notNull(),
  timeframe: text("timeframe").notNull(),
  type: text("type").notNull(), // CALL or PUT
  entryTime: timestamp("entry_time").defaultNow(),
  result: text("result"), // Optional: WIN/LOSS for tracking later
});

// === SCHEMAS ===
export const insertSignalSchema = createInsertSchema(signals).omit({ 
  id: true, 
  entryTime: true,
  result: true 
});

// === EXPLICIT TYPES ===
export type Signal = typeof signals.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;

export type AssetPair = typeof ASSET_PAIRS[number];
export type Timeframe = typeof TIMEFRAMES[number];
export type SignalType = typeof SIGNAL_TYPES[number];

// Request/Response types
export type GenerateSignalRequest = {
  pair: AssetPair;
  timeframe: Timeframe;
};

export type GenerateSignalResponse = {
  type: SignalType; // CALL (BUY) or PUT (SELL)
  pair: AssetPair;
  timeframe: Timeframe;
  timestamp: string;
  confidence: number; // For internal logic/display
};
