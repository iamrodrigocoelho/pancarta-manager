import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: Request): Promise<NextResponse> {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  return NextResponse.json({ data: session }, { status: 200 })
}
