interface RateLimitStore {
  [key: string]: { count: number; resetAt: number }
}

const store: RateLimitStore = {}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store[key]

  if (!entry || now > entry.resetAt) {
    store[key] = { count: 1, resetAt: now + windowMs }
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

export function getRateLimitKey(request: Request, prefix: string): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  return `${prefix}:${ip}`
}
