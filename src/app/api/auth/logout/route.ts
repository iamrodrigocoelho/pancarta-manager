import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { AUDIT_ACTIONS } from '@/types'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (session) {
    await createAuditLog({
      acao: AUDIT_ACTIONS.LOGOUT,
      entidade: 'User',
      entidadeId: session.id,
      session,
      request,
    })
  }
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
