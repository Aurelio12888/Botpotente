import { useMutation, useQuery } from "@tanstack/react-query";
import { api, type GenerateSignalRequest, type GenerateSignalResponse } from "@shared/schema"; // Inferred from requirements context, assuming schema export
// Since the user provided schema in prompt, I'll mock the import structure as requested
// Re-mapping based on provided schema block in prompt:

import { z } from "zod";

// Re-defining for typesafety in this file based on prompt info
const ASSET_PAIRS = [
  "EUR/USD OTC",
  "GBP/USD OTC",
  "USD/JPY OTC",
  "AUD/USD OTC",
  "USD/CHF OTC",
  "EUR/GBP OTC",
  "EUR/JPY OTC",
  "GBP/JPY OTC",
] as const;

const TIMEFRAMES = ["1s", "5s", "30s", "1m", "5m"] as const;

// Types matching backend
export type AssetPair = typeof ASSET_PAIRS[number];
export type Timeframe = typeof TIMEFRAMES[number];

// Use the API contract path
const GENERATE_PATH = '/api/signals/generate';
const HISTORY_PATH = '/api/signals/history';

// Response schema for runtime validation (simplified based on prompt)
const signalResponseSchema = z.object({
  type: z.enum(["CALL", "PUT"]),
  pair: z.string(),
  timeframe: z.string(),
  timestamp: z.string(),
  confidence: z.number(),
});

export function useGenerateSignal() {
  return useMutation({
    mutationFn: async (data: { pair: string; timeframe: string }) => {
      // Simulate network delay for "Analyzing..." effect if backend is instant, 
      // but UI will handle the main animation delay.
      const res = await fetch(GENERATE_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to generate signal');
      }

      const json = await res.json();
      return signalResponseSchema.parse(json);
    }
  });
}

export function useSignalHistory() {
  return useQuery({
    queryKey: [HISTORY_PATH],
    queryFn: async () => {
      const res = await fetch(HISTORY_PATH);
      if (!res.ok) throw new Error('Failed to fetch history');
      return await res.json();
    }
  });
}
