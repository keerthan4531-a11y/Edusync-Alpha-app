// In-memory store for rate limiting
// TODO: move to DB or Redis-based rate limiting for production (Phase H) since in-memory won't persist across serverless function instances on Vercel
const rateLimits = new Map<string, number>();

/**
 * Checks if the user has exceeded the rate limit.
 * @param userId The ID of the user.
 * @param endpoint The name of the endpoint (e.g. 'writing', 'speaking').
 * @param limitMs The limit in milliseconds.
 * @returns An object with { allowed: boolean, remainingMs: number }
 */
export function checkRateLimit(userId: string, endpoint: string, limitMs: number = 30000) {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const lastRequestTime = rateLimits.get(key) || 0;

  if (now - lastRequestTime < limitMs) {
    return {
      allowed: false,
      remainingMs: limitMs - (now - lastRequestTime)
    };
  }

  // Update the last request time
  rateLimits.set(key, now);
  
  return {
    allowed: true,
    remainingMs: 0
  };
}
