import { prisma } from './prisma'
import type { SessionUser, AuditAction } from '@/types'
import { Prisma } from '@prisma/client'

interface AuditOptions {
  session?: SessionUser | null
  acao: AuditAction
  entidade: string
  entidadeId?: string
  dadosAnteriores?: Record<string, unknown>
  dadosNovos?: Record<string, unknown>
  request?: Request
  matricula?: string
  perfil?: string
  lojaId?: string
}

export async function createAuditLog(opts: AuditOptions): Promise<void> {
  try {
    const ip = opts.request
      ? (opts.request.headers.get('x-forwarded-for') ?? opts.request.headers.get('x-real-ip') ?? undefined)
      : undefined
    const userAgent = opts.request ? (opts.request.headers.get('user-agent') ?? undefined) : undefined

    await prisma.auditLog.create({
      data: {
        usuario_id: opts.session?.id ?? undefined,
        matricula: opts.session?.matricula ?? opts.matricula ?? undefined,
        perfil: opts.session?.perfil ?? opts.perfil ?? undefined,
        loja_id: opts.session?.lojaId ?? opts.lojaId ?? undefined,
        acao: opts.acao,
        entidade: opts.entidade,
        entidade_id: opts.entidadeId ?? undefined,
        dados_anteriores: opts.dadosAnteriores
          ? (opts.dadosAnteriores as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        dados_novos: opts.dadosNovos
          ? (opts.dadosNovos as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        ip: ip ?? undefined,
        user_agent: userAgent ?? undefined,
      },
    })
  } catch (err) {
    console.error('[AUDIT] Failed to write audit log:', err)
  }
}
