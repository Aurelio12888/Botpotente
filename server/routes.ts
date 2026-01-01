import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // POST /api/signals/generate
  app.post(api.signals.generate.path, async (req, res) => {
    try {
      const { pair, timeframe } = api.signals.generate.input.parse(req.body);

      // === SIMULATED AI LOGIC ===
      // 1. Delay is handled on frontend for "Analyzing..." UI, but we calculate instantly here.
      
      // 2. Logic per timeframe
      // 1s/5s: Aggressive - Higher randomness, mimics high frequency noise
      // 30s: Balanced - 50/50 trend check logic (simulated)
      // 1m/5m: Selective - slightly biased towards "trend" (simulated by random seed)

      // In a real app, this would connect to a price feed. 
      // Here we simulate the decision based on the "state of the market".
      
      // Random decision for the MVP:
      const randomValue = Math.random();
      const type = randomValue > 0.5 ? "CALL" : "PUT";
      
      // Calculate fake confidence
      let confidence = 0.80; // Base high confidence
      if (timeframe === '1s' || timeframe === '5s') {
        confidence = 0.60 + (Math.random() * 0.3); // Volatile
      } else if (timeframe === '30s') {
        confidence = 0.75 + (Math.random() * 0.2); // Balanced
      } else {
        confidence = 0.85 + (Math.random() * 0.1); // Stable
      }

      // Store in DB
      const signal = await storage.createSignal({
        pair,
        timeframe,
        type,
      });

      res.json({
        type: signal.type as "CALL" | "PUT",
        pair: signal.pair,
        timeframe: signal.timeframe,
        timestamp: new Date().toISOString(),
        confidence: Number(confidence.toFixed(2)),
      });

    } catch (err) {
      console.error("Error in /api/signals/generate:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de entrada inválidos" });
      }
      res.status(500).json({ 
        message: "Erro interno ao gerar sinal",
        details: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // GET /api/signals/history (Optional for debugging or future features)
  app.get(api.signals.history.path, async (req, res) => {
    const history = await storage.getRecentSignals(10);
    // Transform dates to strings for JSON
    const response = history.map(s => ({
      ...s,
      entryTime: s.entryTime ? s.entryTime.toISOString() : new Date().toISOString()
    }));
    res.json(response);
  });

  return httpServer;
}
