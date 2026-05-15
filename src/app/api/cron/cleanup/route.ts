import { NextRequest, NextResponse } from 'next/server'
import { runCleanup } from '@/lib/cleanup'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runCleanup()
  return NextResponse.json({ ok: true, result })
}

// Also allow GET for easy cron service integration
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runCleanup()
  return NextResponse.json({ ok: true, result })
}
