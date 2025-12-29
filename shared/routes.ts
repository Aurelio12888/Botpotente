import { z } from 'zod';
import { ASSET_PAIRS, TIMEFRAMES } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  signals: {
    generate: {
      method: 'POST' as const,
      path: '/api/signals/generate',
      input: z.object({
        pair: z.enum(ASSET_PAIRS),
        timeframe: z.enum(TIMEFRAMES),
      }),
      responses: {
        200: z.object({
          type: z.enum(["CALL", "PUT"]),
          pair: z.string(),
          timeframe: z.string(),
          timestamp: z.string(),
          confidence: z.number(),
        }),
        400: errorSchemas.validation,
      },
    },
    // Optional: Get recent history
    history: {
      method: 'GET' as const,
      path: '/api/signals/history',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          pair: z.string(),
          timeframe: z.string(),
          type: z.string(),
          entryTime: z.string(), // ISO string from backend
        })),
      },
    }
  },
};

// Helper for URL building
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
