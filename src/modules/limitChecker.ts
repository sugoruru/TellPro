import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";
type CheckLimitFunc = () => {
  check: (limit: number, ipAddress: string) => Promise<void>;
};
export const LimitChecker: CheckLimitFunc = () => {
  const tokenCache = new LRUCache({
    max: 100,
    ttl: 1000 * 60,
  });

  return {
    check: (limit, token): Promise<void> =>
      new Promise((resolve, reject) => {
        let tokenCount = (tokenCache.get(token) as number) || 0;
        if (tokenCount === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount++;
        const currentUsage = tokenCount;
        tokenCache.set(token, [currentUsage]);

        const isRateLimited = currentUsage >= limit;
        NextResponse.next().headers.set("X-RateLimit-Limit", String(limit));
        NextResponse.next().headers.set("X-RateLimit-Remaining", String(isRateLimited ? 0 : limit - currentUsage));

        return isRateLimited ? reject("Too Many Requests") : resolve();
      }),
  };
};
