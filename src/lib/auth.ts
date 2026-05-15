import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionUser, JWTPayload } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'change-this-secret-in-production-min-32-chars!!'
)
const COOKIE_NAME = 'pancarta_session'
const SESSION_DURATION = 8 * 60 * 60 // 8 hours in seconds

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return {
    id: payload.sub,
    matricula: payload.matricula,
    nome: payload.nome,
    perfil: payload.perfil,
    lojaId: payload.lojaId,
    lojaCode: payload.lojaCode,
    lojaNome: payload.lojaNome,
    primeiroAcesso: payload.primeiroAcesso,
  }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signToken({
    sub: user.id,
    matricula: user.matricula,
    nome: user.nome,
    perfil: user.perfil,
    lojaId: user.lojaId,
    lojaCode: user.lojaCode,
    lojaNome: user.lojaNome,
    primeiroAcesso: user.primeiroAcesso,
  })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

export async function getSessionFromRequest(request: Request): Promise<SessionUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return {
    id: payload.sub,
    matricula: payload.matricula,
    nome: payload.nome,
    perfil: payload.perfil,
    lojaId: payload.lojaId,
    lojaCode: payload.lojaCode,
    lojaNome: payload.lojaNome,
    primeiroAcesso: payload.primeiroAcesso,
  }
}
