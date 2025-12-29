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
    const [newSignal] = await db
      .insert(signals)
      .values(signal)
      .returning();
    return newSignal;
  }

  async getRecentSignals(limit: number = 10): Promise<Signal[]> {
    return await db
      .select()
      .from(signals)
      .orderBy(desc(signals.entryTime))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
