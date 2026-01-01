import { db } from "./db";
import {
  signals,
  type InsertSignal,
  type Signal,
} from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  createSignal(signal: InsertSignal): Promise<Signal>;
  getRecentSignals(limit?: number): Promise<Signal[]>;
}

export class DatabaseStorage implements IStorage {
  async createSignal(signal: InsertSignal): Promise<Signal> {
    try {
      const [newSignal] = await db
        .insert(signals)
        .values(signal)
        .returning();
      
      if (!newSignal) {
        throw new Error("Failed to insert signal: No data returned");
      }
      
      return newSignal;
    } catch (error) {
      console.error("Database error in createSignal:", error);
      throw new Error("Could not save signal to database");
    }
  }

  async getRecentSignals(limit: number = 10): Promise<Signal[]> {
    try {
      return await db
        .select()
        .from(signals)
        .orderBy(desc(signals.entryTime))
        .limit(limit);
    } catch (error) {
      console.error("Database error in getRecentSignals:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
